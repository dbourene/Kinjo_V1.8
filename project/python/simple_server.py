"""
Serveur Python simplifié pour WebContainer
Compatible avec RustPython et les limitations de Bolt
"""

import json
import http.server
import socketserver
import urllib.parse
import os
from datetime import datetime

# Configuration
PORT = 8000
NREL_API_KEY = "cUfCcCkCiPu8fs7pObzfECghSY0eajNFXteG0TVb"

class KinjoAPIHandler(http.server.BaseHTTPRequestHandler):
    
    def do_GET(self):
        """Gérer les requêtes GET"""
        if self.path == '/':
            self.send_api_info()
        elif self.path == '/health':
            self.send_health_check()
        elif self.path.startswith('/api/installations/') and self.path.endswith('/status'):
            installation_id = self.path.split('/')[-2]
            self.send_installation_status(installation_id)
        else:
            self.send_404()
    
    def do_POST(self):
        """Gérer les requêtes POST"""
        if '/api/installations/' in self.path and '/calculate-production' in self.path:
            installation_id = self.path.split('/')[-2]
            self.calculate_production(installation_id)
        else:
            self.send_404()
    
    def do_OPTIONS(self):
        """Gérer les requêtes OPTIONS pour CORS"""
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Envoyer les headers CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
    
    def send_json_response(self, data, status=200):
        """Envoyer une réponse JSON"""
        self.send_cors_headers()
        self.end_headers()
        response = json.dumps(data, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def send_404(self):
        """Envoyer une erreur 404"""
        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()
        error = {"error": "Endpoint not found", "path": self.path}
        self.wfile.write(json.dumps(error).encode('utf-8'))
    
    def send_api_info(self):
        """Page d'accueil de l'API"""
        data = {
            "message": "Kinjo Energy API - NREL PVWatts Integration",
            "version": "1.0.0 (WebContainer)",
            "status": "running",
            "account": "dbourene@audencia.com",
            "services": {
                "pvwatts": {
                    "configured": bool(NREL_API_KEY),
                    "api_version": "v8",
                    "dataset": "intl",
                    "key_preview": f"{NREL_API_KEY[:10]}..." if NREL_API_KEY else "Not configured"
                },
                "simulation": {
                    "available": True,
                    "description": "Fallback simulation service"
                }
            },
            "endpoints": [
                "GET / - API information",
                "GET /health - Health check",
                "POST /api/installations/{id}/calculate-production - Calculate production",
                "GET /api/installations/{id}/status - Installation status"
            ],
            "environment": "WebContainer (RustPython compatible)"
        }
        self.send_json_response(data)
    
    def send_health_check(self):
        """Vérification de santé"""
        data = {
            "status": "healthy",
            "api": "operational",
            "environment": "WebContainer",
            "python": "RustPython",
            "pvwatts": {
                "configured": bool(NREL_API_KEY),
                "key_preview": f"{NREL_API_KEY[:10]}..." if NREL_API_KEY else "Not configured"
            },
            "timestamp": datetime.now().isoformat()
        }
        self.send_json_response(data)
    
    def send_installation_status(self, installation_id):
        """Statut d'une installation"""
        data = {
            "installation_id": installation_id,
            "status": "ready",
            "api_available": "NREL PVWatts v8 (Simulation)",
            "environment": "WebContainer",
            "message": "Installation prête pour calcul de production"
        }
        self.send_json_response(data)
    
    def calculate_production(self, installation_id):
        """Calculer la production pour une installation"""
        try:
            # Simulation de calcul de production
            # En WebContainer, on simule les données PVWatts
            
            print(f"🔍 Calcul production pour installation: {installation_id}")
            
            # Données simulées basées sur une installation française typique
            simulation_data = {
                "installation_id": installation_id,
                "latitude": 46.603354,  # Centre France
                "longitude": 1.888334,
                "puissance": 9.0,  # kWc
                "prm": "12345678901234"
            }
            
            # Calcul simulé de production annuelle
            # Potentiel solaire moyen en France : 1100 kWh/kWc/an
            potentiel_solaire = 1100  # kWh/kWc/an
            production_annuelle = simulation_data["puissance"] * potentiel_solaire
            
            # Génération du nom de fichier
            date_str = datetime.now().strftime("%d%m%Y")
            filename = f"{simulation_data['prm']}_{date_str}_{date_str}_Prod_CDC_SIMULE.csv"
            
            result = {
                "success": True,
                "message": "Calcul de production effectué avec succès (Simulation WebContainer)",
                "data": {
                    "filename": filename,
                    "energie_kwh": round(production_annuelle, 2),
                    "annual_energy": production_annuelle,
                    "capacity_factor": 12.5,  # % typique pour la France
                    "api_source": "Simulation (WebContainer)",
                    "dataset": "simulation",
                    "data_points": 35040,  # 15min sur 1 an
                    "simulation": True,
                    "pvwatts_equivalent": True
                },
                "installation": {
                    "id": installation_id,
                    "prm": simulation_data["prm"],
                    "puissance": simulation_data["puissance"],
                    "latitude": simulation_data["latitude"],
                    "longitude": simulation_data["longitude"]
                },
                "api_source": "Simulation WebContainer",
                "environment": "WebContainer (RustPython)",
                "nrel_key_configured": bool(NREL_API_KEY)
            }
            
            print(f"✅ Production calculée: {production_annuelle:.2f} kWh/an")
            self.send_json_response(result)
            
        except Exception as e:
            print(f"❌ Erreur calcul: {e}")
            error_response = {
                "success": False,
                "error": str(e),
                "message": "Erreur lors du calcul de production",
                "installation_id": installation_id,
                "environment": "WebContainer"
            }
            self.send_json_response(error_response, 500)

def start_server():
    """Démarrer le serveur HTTP"""
    print("🐍 Démarrage du serveur Python Kinjo (WebContainer)...")
    print(f"🔑 Clé NREL configurée: {NREL_API_KEY[:10]}..." if NREL_API_KEY else "❌ Clé NREL manquante")
    print(f"🚀 Serveur démarré sur http://localhost:{PORT}")
    print(f"📋 Endpoints disponibles:")
    print(f"   • GET  http://localhost:{PORT}/")
    print(f"   • GET  http://localhost:{PORT}/health")
    print(f"   • POST http://localhost:{PORT}/api/installations/{{id}}/calculate-production")
    print(f"   • GET  http://localhost:{PORT}/api/installations/{{id}}/status")
    print(f"🌐 Compatible avec WebContainer (RustPython)")
    
    try:
        with socketserver.TCPServer(("", PORT), KinjoAPIHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du serveur")
    except Exception as e:
        print(f"❌ Erreur serveur: {e}")

if __name__ == "__main__":
    start_server()