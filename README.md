# Job Tracker & Matching Platform

A full-stack web application that helps you track job applications and matches your resume to job descriptions using AI.

## 🚀 Features (In Progress)

- ✅ Backend foundation (FastAPI + PostgreSQL)
- ✅ Database connection
- ✅ Models (User, Job, Resume, Application)
- 🔄 Authentication (JWT) — Coming next
- 🔄 Job tracking API
- 🔄 Resume upload and AI parsing
- 🔄 AI-powered matching
- 🔄 React frontend
- 🔄 Docker deployment

## 🛠️ Tech Stack

- **Backend:** FastAPI, Python, SQLAlchemy
- **Database:** PostgreSQL
- **AI:** Google Gemini API
- **Frontend:** React (coming soon)
- **Deployment:** Docker, Railway (coming soon)

## 📂 Project Structure
job-tracker/
├── backend/
│ ├── app/
│ │ ├── config.py # Settings and environment variables
│ │ ├── database.py # PostgreSQL connection
│ │ ├── models.py # Database tables (User, Job, Resume, Application)
│ │ ├── routes/ # API endpoints (coming)
│ │ ├── services/ # Business logic (coming)
│ │ └── utils/ # Helper functions (coming)
│ ├── requirements.txt # Dependencies
│ └── run.py # Server launcher
├── .gitignore
└── README.md


## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL

### Installation

1. Clone the repository:
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
Create .env file in backend/:

env
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_tracker
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
Run the server:

bash
python run.py
Open Swagger UI: http://localhost:8000/docs

📊 Project Status
Currently building the backend foundation. Next steps:

JWT Authentication

Job tracking CRUD

Resume upload and parsing

AI-powered matching

React frontend

Docker deployment

🔗 Links
GitHub: Jay5566170/job-tracker

📄 License
This project is for learning and portfolio purposes.