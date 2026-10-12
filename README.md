# OnTime

OnTime is a mobile-first attendance management and predictive absenteeism application engineered for university students. Built with Python and Flask, the platform provides real-time attendance calculation, statutory threshold monitoring, and predictive analysis to determine safe leave margins and recovery schedules.

---

## Overview

Academic institutions routinely mandate attendance thresholds (typically 75% to 85%) under penalty of examination debarment. Calculating permissible leaves or required recovery sessions across multiple courses with varying schedules is often prone to error.

OnTime delivers an automated roll-call ledger optimized for mobile devices. It computes precise absence allowances, flags subjects in deficit, and provides offline access through Progressive Web App (PWA) architecture.

---

## Features

### Mathematical Bunk and Recovery Computation
- **Surplus Allowance**: When current attendance exceeds the configured threshold, the algorithm determines the maximum number of consecutive lectures that can be missed without breaching the institutional minimum:
  $$\text{Margin} = \left\lfloor \frac{\text{Attended}}{\text{Target}} - \text{Total} \right\rfloor$$
- **Deficit Recovery**: When attendance drops below the threshold, the system computes the exact sequence of consecutive classes that must be attended to return to good standing:
  $$\text{Required} = \left\lceil \frac{\text{Target} \times \text{Total} - \text{Attended}}{1 - \text{Target}} \right\rceil$$

### Configurable Institutional Thresholds
- The default minimum attendance benchmark is set to 75%.
- Users can adjust their statutory target (e.g., 65%, 80%, 85%) on the fly, instantly recalculating metrics and advice across all registered courses.

### Asymmetric Ledger and Session Ticker
- **Semester Vibe Metric**: Displays aggregate attendance percentage alongside dynamic status tags (Safe Zone, On Thin Ice, Deficit).
- **Session Tally Tape**: Monospaced summary counters tracking total classes held, sessions attended, and logged cuts.
- **Course Rosters**: Individual course entries display course initials, real-time percentages, proportional visual meter bars, and thumb-accessible quick actions.

### Data Protection and Safety Measures
- **Accidental Deletion Prevention**: Irreversible deletions require explicit confirmation via a bottom drawer dialog.
- **Client-Side Live Filtering**: Instant search by course title or code, coupled with status filter tabs (All, Cooked, Safe).
- **Haptic Feedback**: Micro-vibrations accompany key interactions on supported mobile hardware for a tactile interface feel.

### Progressive Web App (PWA) Capabilities
- **Installable Native Shell**: Conforms to the W3C Web App Manifest specification for full-screen standalone installation on Android and iOS home screens.
- **Service Worker Caching**: Employs network-first caching for dynamic application pages and cache-first strategies for assets, ensuring reliable offline functionality.

### Secure Account Authentication
- Session-based user isolation utilizing server-side filesystem storage.
- Passwords hashed using cryptographic salt methods provided by Werkzeug.
- Client-side real-time passphrase verification during account creation.

---

## Technology Stack

### Backend
- **Python 3**: Core language runtime.
- **Flask**: Lightweight WSGI micro-framework organizing routes via modular blueprints (`auth` and `tracker`).
- **Flask-Session**: Server-side session management configured with filesystem serialization.
- **SQLite3**: Embedded relational database handling user accounts and tracking ledgers.
- **Werkzeug Security**: SHA-256 password hashing and validation.

### Frontend
- **HTML5 & Jinja2**: Server-rendered semantic markup utilizing extensible templates.
- **Vanilla Modern CSS**:
  - Custom design tokens eliminating generic framework styling.
  - Distinctive typography: Fraunces (editorial display), JetBrains Mono (tabular figures), and Plus Jakarta Sans (humanist body text).
  - High-conviction dual color system: Obsidian Slate (`#0a0e14`) and Archival Parchment (`#f6f3eb`) with Terracotta Vermilion accents.
  - Strict compliance with WCAG AAA contrast standards across both light and dark themes.
  - Mobile ergonomics including viewport safe-area handling (`env(safe-area-inset-*)`).
- **Vanilla JavaScript (ES6+)**:
  - Zero external JavaScript dependencies or bulky client libraries.
  - Service worker registration and PWA install prompt lifecycle management.
  - Dynamic mathematical calculations and live DOM updates.

---

## Project Structure

```
attendance-tracker/
├── app/
│   ├── __init__.py           # Package initializer
│   ├── acc_db.py             # User account data layer
│   ├── auth.py               # Authentication blueprint and views
│   ├── routes.py             # Ledger blueprint and tracker controllers
│   └── track_db.py           # Subject and attendance data layer
├── static/
│   ├── css/
│   │   └── app.css           # Core stylesheet and theme engine
│   ├── js/
│   │   └── app.js            # Client-side computations and PWA handlers
│   ├── icons/                # Vector and raster PWA application icons
│   ├── manifest.json         # Web App Manifest configuration
│   └── sw.js                 # Service worker script
├── templates/
│   ├── base.html             # Foundational application layout
│   ├── home.html             # Primary dashboard and ledger roster
│   ├── login.html            # User authentication interface
│   └── register.html         # User onboarding interface
├── run.py                    # Application entry point
├── tracker_data.db           # SQLite database
└── README.md                 # Project documentation
```

---

## Installation and Setup

### Prerequisites
- Python 3.10 or higher
- `pip` package manager

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/attendance-tracker.git
cd attendance-tracker
```

### 2. Install Dependencies
Ensure the required packages are present in your environment:
```bash
pip install -r requirements.txt
```

### 3. Initialize and Run the Application
Start the Flask development server:
```bash
python3 run.py
```

By default, the server listens on `http://0.0.0.0:5000`. Navigate to this URL in a modern desktop browser or on a smartphone connected to the same local area network.

---

## Usage Workflow

1. **Register an Account**: Navigate to the registration page, enter your credentials, and establish your personal ledger.
2. **Add Courses**: Tap the "Record Course" button in the bottom navigation bar or header to add your syllabus subjects.
3. **Log Sessions**:
   - Tap **+ Attended** when you attend a lecture.
   - Tap **- Bunked** when you miss or skip a lecture.
4. **Monitor Advice**: Check the status banner beneath each course to view exact permissible leave balances or required recovery lectures.
5. **Install as App**: When prompted, tap the install button to add OnTime to your device home screen for quick single-tap access.

---

## License

This project is licensed under the MIT License. You are free to modify, distribute, and utilize the codebase for academic and personal projects.
