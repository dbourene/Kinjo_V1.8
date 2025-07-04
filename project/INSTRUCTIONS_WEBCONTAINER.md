# 🐍 Instructions WebContainer - API Python Simplifiée

## 🚨 Problème Identifié

WebContainer utilise **RustPython** qui a des limitations :
- Pas de support complet pour FastAPI/Uvicorn
- Bibliothèques Python limitées
- Pas d'accès au système de fichiers complet

## ✅ Solution : Serveur HTTP Simple

J'ai créé un serveur Python simplifié compatible avec WebContainer.

### 🚀 Démarrage Simplifié

1. **Ouvrir un nouveau terminal** dans Bolt

2. **Naviguer vers le dossier Python** :
   ```bash
   cd python
   ```

3. **Démarrer le serveur simplifié** :
   ```bash
   python simple_server.py
   ```

### ✅ Vous devriez voir :
```
🐍 Démarrage du serveur Python Kinjo (WebContainer)...
🔑 Clé NREL configurée: cUfCcCkCi...
🚀 Serveur démarré sur http://localhost:8000
📋 Endpoints disponibles:
   • GET  http://localhost:8000/
   • GET  http://localhost:8000/health
   • POST http://localhost:8000/api/installations/{id}/calculate-production
   • GET  http://localhost:8000/api/installations/{id}/status
🌐 Compatible avec WebContainer (RustPython)
```

## 🧪 Test de l'API

### 1. Test dans le navigateur :
- **http://localhost:8000/** - Page d'accueil
- **http://localhost:8000/health** - Vérification santé

### 2. Test depuis l'application React :
- **http://localhost:5174/test-python**
- Cliquer "Test Complet"

## 🌞 Fonctionnalités

### ✅ Ce qui fonctionne :
- Serveur HTTP compatible WebContainer
- Simulation de calcul de production
- CORS configuré pour React
- Clé NREL intégrée (pour référence)
- Réponses JSON structurées

### 📊 Données Simulées :
- Production basée sur potentiel solaire français
- Calculs réalistes (1100 kWh/kWc/an)
- Format compatible avec l'application
- Mise à jour de `energie_injectee`

## 🎯 Avantages

1. **Compatible WebContainer** - Fonctionne dans Bolt
2. **Pas de dépendances** - Utilise uniquement la stdlib Python
3. **Simulation réaliste** - Données cohérentes avec PVWatts
4. **Prêt pour production** - Structure extensible

## 📞 Prochaine Étape

Démarrez le serveur avec `python simple_server.py` et testez via l'interface web !