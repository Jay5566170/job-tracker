from fastapi import FastAPI
from app.routes import auth, jobs  # ← Add jobs

app = FastAPI(
    title="Job Tracker API",
    description="Track job applications with AI-powered matching",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)  # ← Add this

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