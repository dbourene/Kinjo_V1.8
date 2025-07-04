"""
Serveur minimal pour WebContainer
Version ultra-simplifiée
"""

import http.server
import socketserver
import json

PORT = 8000

class SimpleHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "message": "Kinjo API WebContainer",
            "status": "running",
            "path": self.path
        }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "success": True,
            "message": "POST reçu",
            "data": {"energie_kwh": 8500.0}
        }
        
        self.wfile.write(json.dumps(response).encode())

print("🚀 Démarrage serveur minimal sur port", PORT)

with socketserver.TCPServer(("", PORT), SimpleHandler) as httpd:
    httpd.serve_forever()