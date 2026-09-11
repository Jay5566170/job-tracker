from fastapi import FastAPI

app = FastAPI(
    title="Job Tracker API",
    description="Track job applications with AI-powered matching",
    version="1.0.0"
)

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