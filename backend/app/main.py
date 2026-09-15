from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ← ADD THIS
from app.routes import auth, jobs, resumes, applications, matches

app = FastAPI(
    title="Job Tracker API",
    description="Track job applications with AI-powered matching",
    version="1.0.0"
)

# ← ADD THIS SECTION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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