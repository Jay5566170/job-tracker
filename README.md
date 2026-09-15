# Job Tracker & AI Matching Platform

A full-stack web application that helps job seekers track applications and match resumes to jobs using AI.

![Status](https://img.shields.io/badge/status-complete-brightgreen)

## 🚀 Live Demo

- **Frontend:** [Coming soon]
- **Backend API:** [Coming soon]

## ✨ Features

- ✅ **User Authentication** — JWT-based register/login
- ✅ **Job Tracking** — Add, view, update, delete jobs
- ✅ **Resume Upload** — PDF/TXT with AI skill extraction (Gemini)
- ✅ **AI Matching** — Match resumes to jobs with score (0-100%)
- ✅ **Application Tracking** — Link jobs to resumes
- ✅ **URL/Text Parsing** — Paste job URL or text, AI extracts details
- ✅ **Skill Gap Analysis** — See matching vs missing skills
- ✅ **AI Recommendations** — Personalized advice

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Auth:** JWT, PBKDF2
- **AI:** Google Gemini API
- **PDF:** PyPDF2
- **Deployment:** Railway

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router 7
- **HTTP:** Axios
- **State:** Context API
- **Deployment:** Vercel

## 📂 Project Structure
job-tracker/
├── backend/
│ ├── app/
│ │ ├── config.py
│ │ ├── database.py
│ │ ├── models.py
│ │ ├── schemas.py
│ │ ├── dependencies.py
│ │ ├── routes/
│ │ │ ├── auth.py
│ │ │ ├── jobs.py
│ │ │ ├── resumes.py
│ │ │ ├── applications.py
│ │ │ └── matches.py
│ │ ├── services/
│ │ │ ├── auth_service.py
│ │ │ ├── job_service.py
│ │ │ ├── resume_service.py
│ │ │ ├── application_service.py
│ │ │ ├── match_service.py
│ │ │ └── ai_service.py
│ │ └── utils/
│ │ ├── security.py
│ │ ├── pdf_parser.py
│ │ └── url_fetcher.py
│ ├── requirements.txt
│ └── run.py
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ └── Navbar.jsx
│ │ ├── context/
│ │ │ └── AuthContext.jsx
│ │ ├── pages/
│ │ │ ├── Login.jsx
│ │ │ ├── Register.jsx
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Jobs.jsx
│ │ │ ├── AddJob.jsx
│ │ │ ├── JobDetails.jsx
│ │ │ ├── Resumes.jsx
│ │ │ └── Matches.jsx
│ │ ├── services/
│ │ │ └── api.js
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── package.json
│
└── README.md

text

## 🚀 Getting Started

### Backend Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/Jay5566170/job-tracker.git
   cd job-tracker/backend
Create virtual environment:

bash
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
Install dependencies:

bash
pip install -r requirements.txt
Create .env:

env
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_tracker
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
Run:

bash
python run.py
Frontend Setup
Navigate to frontend:

bash
cd frontend
Install dependencies:

bash
npm install
Run:

bash
npm run dev
Open: http://localhost:5173

📊 API Endpoints
Auth
POST /auth/register — Register user

POST /auth/login — Login (get JWT)

GET /auth/me — Current user

Jobs
POST /jobs/ — Create job

GET /jobs/ — List jobs

GET /jobs/{id} — Get one

DELETE /jobs/{id} — Delete

POST /jobs/parse-url — Parse from URL

POST /jobs/parse-text — Parse from text

Resumes
POST /resumes/upload — Upload resume

GET /resumes/ — List resumes

GET /resumes/{id} — Get one

DELETE /resumes/{id} — Delete

Applications
POST /applications/ — Link job + resume

GET /applications/ — List

PUT /applications/{id} — Update status

DELETE /applications/{id} — Delete

Matches
POST /matches/{resume_id}/{job_id} — AI match

📚 What I Learned
Full-stack development (FastAPI + React)

JWT authentication

AI/LLM integration (Google Gemini)

PostgreSQL + SQLAlchemy

File uploads and PDF parsing

React Context + React Router

CORS handling

Environment variables

Deployment

🔗 Links
GitHub: Jay5566170/job-tracker

📄 License
For learning and portfolio purposes.
