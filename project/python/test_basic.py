"""
Test basique pour vérifier Python dans WebContainer
"""

print("🐍 Test Python WebContainer")
print("✅ Python fonctionne")

# Test import basique
import json
import os
from datetime import datetime

print("✅ Imports de base OK")

# Test création de serveur simple
import http.server
import socketserver

print("✅ Modules serveur disponibles")

# Test de base
data = {
    "message": "Test WebContainer",
    "timestamp": datetime.now().isoformat(),
    "python_working": True
}

print("📊 Données test:", json.dumps(data, indent=2))
print("🎉 Test terminé avec succès")