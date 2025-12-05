from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict, states

app = FastAPI(
    title="Energy Prediction API",
    description="Hybrid AI Model for Energy Consumption Prediction",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/api/v1", tags=["predictions"])
app.include_router(states.router, prefix="/api/v1", tags=["states"])

@app.get("/")
def root():
    return {
        "message": "Energy Prediction API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)