"""
GeminiClient — wraps the Google GenAI SDK for UrbanFix AI triage.

Uses gemini-2.5-flash with a strictly-enforced JSON response schema so that
all downstream consumers can rely on a deterministic payload shape.
"""
from __future__ import annotations

import base64
import json
import logging
from typing import Any, Optional

try:
    from google import genai
    from google.genai import types as genai_types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Gemini response schema enforced via application/json MIME type
# ---------------------------------------------------------------------------
_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "category": {
            "type": "string",
            "description": (
                "Specific civic issue category such as: Electrical Hazard, "
                "Transformer Explosion, Open Manhole, Pothole, Water Main Burst, "
                "Sewage Overflow, Garbage Overflow, Fallen Tree, Flooding, "
                "Damaged Road, Broken Streetlight, or Other."
            ),
        },
        "department": {
            "type": "string",
            "enum": [
                "Electricity Board",
                "Public Works / Roads",
                "Water Supply and Sewerage",
                "Waste Management and Sanitation",
                "Disaster and Emergency Services",
            ],
            "description": "Municipal department responsible for resolving this issue.",
        },
        "severity": {
            "type": "string",
            "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            "description": (
                "Severity level. Use CRITICAL for any life-threatening hazard "
                "including electrical fires, transformer explosions, exposed live wires, "
                "active gas leaks, or structural collapses."
            ),
        },
        "confidence_score": {
            "type": "number",
            "description": "Classification confidence in [0.0, 1.0].",
        },
        "hazard_risk_summary": {
            "type": "string",
            "description": (
                "Concise human-readable paragraph describing the specific dangers "
                "posed by this incident to people, traffic, or utility infrastructure."
            ),
        },
        "recommended_action": {
            "type": "string",
            "description": (
                "Immediate actionable instruction for the dispatched field team, "
                "including safety precautions and escalation steps if required."
            ),
        },
        "is_emergency": {
            "type": "boolean",
            "description": (
                "Set to true if the incident involves immediate risk to human life "
                "or critical utility infrastructure and must bypass normal SLA queues. "
                "This MUST be true for: transformer explosions, active electrical fires, "
                "open high-voltage live cables on public roads, gas main ruptures, "
                "structural collapses, or major flooding events."
            ),
        },
    },
    "required": [
        "category",
        "department",
        "severity",
        "confidence_score",
        "hazard_risk_summary",
        "recommended_action",
        "is_emergency",
    ],
}

_SYSTEM_INSTRUCTION = """You are the UrbanFix AI Triage Engine — a municipal emergency response classifier
integrated into a civic grievance platform serving Indian cities.

Your task is to analyse citizen reports about infrastructure failures and classify
them accurately. Follow these mandatory rules without exception:

CRITICAL ESCALATION RULES (non-negotiable):
1. Transformer explosions, electrical fires, or active sparking incidents MUST be
   classified as severity=CRITICAL and is_emergency=true.
2. Exposed or fallen high-voltage electrical cables on public roads or footpaths
   MUST be classified as severity=CRITICAL and is_emergency=true.
3. Open manholes in high-traffic areas are severity=HIGH minimum.
4. Water main bursts causing road flooding or structural undermining are severity=HIGH.
5. Any incident explicitly described as life-threatening, with casualties, or with
   fire/explosion must set is_emergency=true.

DEPARTMENT ROUTING RULES:
- All electrical issues (streetlights, transformers, live wires) → Electricity Board
- Road defects (potholes, damaged asphalt, fallen trees on roads) → Public Works / Roads
- Water pipes, sewage, drainage → Water Supply and Sewerage
- Garbage, waste, illegal dumping → Waste Management and Sanitation
- Multi-agency emergencies, floods, structural collapse → Disaster and Emergency Services

OUTPUT FORMAT:
Respond with a single valid JSON object matching the provided schema exactly.
Do not include any prose, markdown, or commentary outside the JSON object.
"""


class GeminiClient:
    """
    Async-compatible client that sends civic issue data to Gemini 2.5 Flash
    and returns a validated structured JSON triage result.
    """

    MODEL_ID = "gemini-2.5-flash"

    def __init__(self) -> None:
        if not GENAI_AVAILABLE:
            raise RuntimeError(
                "google-genai package is not installed. "
                "Run: pip install google-genai"
            )
        try:
            from app.core.config import settings  # type: ignore
            api_key = settings.GEMINI_API_KEY
        except ImportError:
            # Fallback: try the flat config module used by the existing codebase
            try:
                import os
                import importlib
                cfg = importlib.import_module("app.config")
                api_key = getattr(cfg, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY", "")
            except Exception:
                import os
                api_key = os.getenv("GEMINI_API_KEY", "")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set. "
                "Export it as an environment variable or add it to your config."
            )
        self._client = genai.Client(api_key=api_key)

    async def analyze_civic_issue(
        self,
        title: str,
        description: str,
        image_bytes: Optional[bytes] = None,
    ) -> dict[str, Any]:
        """
        Sends the civic issue to Gemini 2.5 Flash and returns a structured dict.

        Args:
            title:        Short title from the citizen report.
            description:  Full description of the civic issue.
            image_bytes:  Raw image bytes (JPEG/PNG). If provided they are
                          inline-uploaded as a Part alongside the text prompt.

        Returns:
            Parsed dict matching the _RESPONSE_SCHEMA keys.

        Raises:
            ValueError:  If the model returns malformed JSON.
            RuntimeError: If the Gemini API call fails.
        """
        text_prompt = (
            f"Civic Issue Title: {title}\n\n"
            f"Citizen Description:\n{description}\n\n"
            "Analyse the above report and return the structured JSON triage result."
        )

        parts: list[Any] = [text_prompt]

        # Attach image if available
        if image_bytes:
            mime = _detect_mime_type(image_bytes)
            parts.append(
                genai_types.Part.from_bytes(data=image_bytes, mime_type=mime)
            )

        generation_config = genai_types.GenerateContentConfig(
            system_instruction=_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=_RESPONSE_SCHEMA,
            temperature=0.1,           # Near-deterministic for triage decisions
            max_output_tokens=1024,
        )

        try:
            response = self._client.models.generate_content(
                model=self.MODEL_ID,
                contents=parts,
                config=generation_config,
            )
        except Exception as exc:
            logger.exception("Gemini API call failed: %s", exc)
            raise RuntimeError(f"Gemini API error: {exc}") from exc

        raw_text = (response.text or "").strip()

        try:
            result = json.loads(raw_text)
        except json.JSONDecodeError as exc:
            logger.error("Gemini returned non-JSON output: %s", raw_text[:500])
            raise ValueError(
                f"Gemini returned malformed JSON: {exc}. Raw: {raw_text[:200]}"
            ) from exc

        # Clamp confidence_score to [0.0, 1.0] defensively
        if "confidence_score" in result:
            result["confidence_score"] = max(0.0, min(1.0, float(result["confidence_score"])))

        return result


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _detect_mime_type(data: bytes) -> str:
    """Heuristic MIME detection from magic bytes."""
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:4] in (b"GIF8", b"GIF9"):
        return "image/gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"  # safe default
