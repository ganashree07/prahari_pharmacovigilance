# 🛡️ Prahari: Agentic Pharmacovigilance & Social Listening

Prahari is a state-of-the-art AI platform designed to transform pharmacovigilance from a reactive process into a proactive, collaborative shield. By leveraging agentic AI to monitor social media, forums, and clinical discussions, Prahari detects adverse drug reactions (ADRs) in real-time and provides a structured bridge between patients, medical professionals, and regulatory authorities.

## ✨ Key Features

### 🤖 Agentic Signal Detection
- **Real-Time Monitoring**: Automatically scans Reddit, Twitter/X, and medical forums for potential ADRs.
- **NLP Intelligence**: Advanced entity extraction (MedDRA coding) and signal classification (Known vs. Novel).
- **Automated Redaction**: Built-in PII protection (Aadhaar, PAN, Phone, Email) for data privacy.

### 👥 Collaborative Workflows
- **User Safety Verification**: A simplified, plain-English questionnaire for patients to verify their experiences with translations for medical terms.
- **Medical Reviewer Toolkit**: A comprehensive dashboard for doctors to perform WHO-UMC causality assessments and earn CME credits.
- **One-Click Escalation**: Seamless integration with CDSCO (Central Drugs Standard Control Organization) for official reporting.

### 🛠️ Agentic Onboarding
- **Zero-Code Integration**: Dynamically onboard new data sources by simply providing a URL.
- **Schema Detection**: AI-driven structure analysis and automated extraction schema generation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- [Optional] Docker Desktop

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*API will be live at `http://localhost:8000`*

### 2. Frontend Setup (Next.js)
```bash
# In the root directory
npm install
npm run dev
```
*Frontend will be live at `http://localhost:3000`*

## 🧪 Demo Instructions

Prahari comes pre-seeded with 5 high-impact signals (Metformin, Paracetamol, etc.) to demonstrate the full lifecycle.

### Resetting the Demo
To start fresh before a presentation, run the following command in PowerShell:
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/demo/reset
```

### The 4-Minute Walkthrough Script
1. **Login**: Access the root URL and choose **User Portal** or **Doctor Portal**.
2. **User Flow**: Select a signal like **Metformin** and complete the safety verification. Notice the plain-English translations for complex symptoms.
3. **Doctor Flow**: Login as a doctor (MCI required), assess the Metformin signal using the WHO-UMC toolkit, and **Escalate to CDSCO**.
4. **Authority View**: Observe the real-time status updates and the green "Submitted to Authority" banner on the signal detail page.

## 🏗️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts.
- **Backend**: FastAPI, SQLAlchemy, Pydantic v2.
- **Database**: SQLite (local development parity).
- **AI**: Agentic workflow for source analysis and keyword-based NLP pipeline.

---
**Built for the future of drug safety monitoring.** ⚡
