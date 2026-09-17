from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, jobs, resumes, applications, matches
from app.database import engine, Base
from app import models


app = FastAPI(
    title="Job Tracker API",
    description="Track job applications with AI-powered matching",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://job-tracker-jay5566170.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup: create tables
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")


# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(resumes.router)
app.include_router(applications.router)
app.include_router(matches.router)


@app.get("/")
def root():
    return {
        "message": "Job Tracker API is running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}