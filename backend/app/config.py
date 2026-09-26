import os

SECRET_KEY = os.getenv("SECRET_KEY", "urbanfix-super-secret-key-2026-chennai")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./urbanfix.db")
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Gemini AI
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
