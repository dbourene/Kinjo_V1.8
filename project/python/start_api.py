"""
Script pour démarrer l'API Python localement
Version corrigée avec gestion d'erreurs
"""

import uvicorn
import os
import sys
from dotenv import load_dotenv

def start_api():
    """Démarre l'API FastAPI"""
    
    print("🐍 Démarrage de l'API Python Kinjo...")
    
    # Charger les variables d'environnement
    load_dotenv()
    
    # Vérifier que le module app est accessible
    try:
        from app.main import app
        print("✅ Module app importé avec succès")
    except ImportError as e:
        print(f"❌ Erreur d'import: {e}")
        print("💡 Assurez-vous d'être dans le dossier python/")
        sys.exit(1)
    
    # Configuration du serveur
    config = {
        "app": "app.main:app",
        "host": "0.0.0.0",
        "port": 8000,
        "reload": True,
        "log_level": "info"
    }
    
    print(f"🚀 Démarrage sur http://localhost:8000")
    print(f"📋 Endpoints disponibles:")
    print(f"   • GET  http://localhost:8000/")
    print(f"   • GET  http://localhost:8000/health")
    print(f"   • POST http://localhost:8000/api/installations/{{id}}/calculate-production")
    print(f"   • GET  http://localhost:8000/api/installations/{{id}}/status")
    
    try:
        uvicorn.run(**config)
    except KeyboardInterrupt:
        print("\n🛑 Arrêt de l'API")
    except Exception as e:
        print(f"❌ Erreur lors du démarrage: {e}")

if __name__ == "__main__":
    start_api()