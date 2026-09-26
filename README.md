# UrbanFix AI Command & Citizen Redressal Platform
> **An AI-powered closed-loop civic infrastructure platform connecting citizens, municipal authorities, and field crews from report to verified resolution.**

Built for **SYNORA 2026** by Team **autobots** (SRM Institute of Science and Technology, Ramapuram).

---

## 🌟 Key Capabilities

### 1. 📢 Multimodal Citizen Grievance Desk
- **Voice-to-Text Dictation**: Native microphone intake with live frequency audio waveform animation and instant speech-to-text transcript generation.
- **GPS Auto-Detect**: One-click GNSS geolocation locking latitude/longitude coordinates (`12.9121° N, 77.6446° E`).
- **Photo Evidence & Inspection Snapshot**: Upload on-site damage photos with geotag metadata.
- **Categorization**: *Roads & Potholes*, *Electricity & Grid*, *Water & Drainage*, *Sanitation & Waste*.

### 2. 👥 Neighborhood Community Feed (Duplicate Deduplication)
- **Shared Ward Activity Stream**: See real-time civic defects reported across Ward 174 (HSR Layout).
- **"I'm Affected Too (+1)" Upvoting**: Prevents duplicate complaint filing by letting neighbors upvote existing hazards, elevating issue priority for zonal dispatchers.
- **Community Discussion Thread**: Live neighborhood updates and field worker arrival notices.

### 3. 🏛️ Municipal Authority Command Center
- **Live Priority Dispatch Queue**: Real-time incoming dockets with severity classification (P1 Critical Hazard / P2 Moderate / P3 Routine) and SLA timers.
- **Geospatial Telemetry & Hotspot Map**: Visual spatial distribution of ward defects.
- **Duplicate Incident Clustering**: Groups reports within a 150m radius into a single consolidated work order with one click.
- **Zonal Field Units Roster**: Telemetry and dispatch controls for *BBMP Asphalt Crew #14*, *BESCOM Rapid Van #08*, and *BWSSB Pipe Unit #03*.

### 4. 🔒 Two-Way Citizen Verification & Audit Gate
- Dockets cannot be archived by authorities alone.
- When field crews complete physical repair, residents receive an audit prompt to verify on-site quality with a **1–5 Star Rating**, **Physical State Assessment**, and **Audit Remarks** to permanently close the municipal ticket.

---

## 🚀 Quickstart Guide

### Option A: Run the React 19 + TypeScript + Vite Application
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start the local development server
npm run dev

# 3. Build for production
npm run build
```

### Option B: Standalone Zero-Dependency HTML Editions
Double-click either file to launch immediately in any browser:
- `standalone-citizen.html` — The citizen grievance and community portal
- `standalone-authority.html` — The municipal operations command center

---

## 🛠️ Technology Stack
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols Outlined, Lucide Icons
- **Animation**: Motion
- **Architecture**: Role-based views for Citizens and Municipal Command Officers
