# 🐍 Instructions de Démarrage - API Python NREL PVWatts

## 🚀 Étapes pour Démarrer l'API

### 1. Ouvrir un Nouveau Terminal
Dans Bolt, cliquez sur le **+** pour ouvrir un nouveau terminal (gardez celui de Vite ouvert).

### 2. Naviguer vers le Dossier Python
```bash
cd python
```

### 3. Vérifier la Structure
```bash
ls -la
```
Vous devriez voir :
- `app/` (dossier)
- `requirements.txt`
- `start_api.py` ✅
- `.env`

### 4. Installer les Dépendances
```bash
pip install -r requirements.txt
```

### 5. Démarrer l'API
```bash
python start_api.py
```

## ✅ Vérification du Succès

### Vous devriez voir :
```
🐍 Démarrage de l'API Python Kinjo...
✅ Module app importé avec succès
🚀 Démarrage sur http://localhost:8000
📋 Endpoints disponibles:
   • GET  http://localhost:8000/
   • GET  http://localhost:8000/health
   • POST http://localhost:8000/api/installations/{id}/calculate-production
   • GET  http://localhost:8000/api/installations/{id}/status
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Test dans le Navigateur :
1. **http://localhost:8000/** - Page d'accueil
2. **http://localhost:8000/health** - Vérification santé

Vous devriez voir :
```json
{
  "message": "Kinjo Energy API - NREL PVWatts Integration",
  "version": "1.0.0",
  "status": "running",
  "account": "dbourene@audencia.com",
  "services": {
    "pvwatts": {
      "configured": true,
      "api_version": "v8",
      "dataset": "intl"
    }
  }
}
```

## 🧪 Test Complet

### Une fois l'API démarrée :

1. **Allez sur** : http://localhost:5174/test-python
2. **Cliquez "Test Complet"**
3. **Regardez les résultats** - vous devriez voir "API NREL PVWatts" dans la réponse

## 🔧 En Cas de Problème

### Erreur "Module not found" :
```bash
# Vérifiez que vous êtes dans le bon dossier
pwd
# Doit afficher quelque chose comme : /home/project/python

# Vérifiez la structure
ls -la app/
```

### Erreur de dépendances :
```bash
# Réinstallez les dépendances
pip install --upgrade -r requirements.txt
```

### Port déjà utilisé :
```bash
# Tuez le processus existant
pkill -f "uvicorn"
# Puis relancez
python start_api.py
```

## 🎯 Résultat Attendu

Avec votre clé API NREL configurée, l'API va maintenant :
- ✅ Utiliser de vraies données PVWatts
- ✅ Calculer la production réelle pour la France
- ✅ Mettre à jour `energie_injectee` dans la base
- ✅ Générer des courbes de charge professionnelles

## 📞 Prochaine Étape

Une fois l'API démarrée avec succès, testez-la via l'interface web pour voir les calculs NREL PVWatts en action ! 🌞