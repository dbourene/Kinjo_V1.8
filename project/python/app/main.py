from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import installations

# Charger les variables d'environnement
load_dotenv()

app = FastAPI(
    title="Kinjo Energy API - NREL PVWatts",
    description="API pour les calculs de courbes de charge et production énergétique avec NREL PVWatts",
    version="1.0.0"
)

# Configuration CORS pour permettre les appels depuis l'app React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:5173", "http://localhost:5174", "https://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(installations.router, prefix="/api")

@app.get("/")
def read_root():
    """Page d'accueil de l'API"""
    nrel_key_configured = bool(os.getenv("NREL_API_KEY"))
    
    return {
        "message": "Kinjo Energy API - NREL PVWatts Integration",
        "version": "1.0.0",
        "status": "running",
        "account": "dbourene@audencia.com",
        "services": {
            "pvwatts": {
                "configured": nrel_key_configured,
                "api_version": "v8",
                "dataset": os.getenv("PVWATTS_DATASET", "intl")
            },
            "simulation": {
                "available": True,
                "description": "Fallback service"
            }
        },
        "endpoints": [
            "GET /health - Health check",
            "GET /api-info - API information",
            "POST /api/installations/{id}/calculate-production - Calculate production",
            "GET /api/installations/{id}/status - Installation status"
        ]
    }

@app.get("/health")
def health_check():
    """Vérification de santé de l'API"""
    nrel_key = os.getenv("NREL_API_KEY")
    
    return {
        "status": "healthy",
        "api": "operational",
        "database": "connected",
        "pvwatts": {
            "configured": bool(nrel_key),
            "key_preview": f"{nrel_key[:10]}..." if nrel_key else "Not configured"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)