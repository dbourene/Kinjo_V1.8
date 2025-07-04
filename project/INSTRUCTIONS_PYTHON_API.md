# 🐍 Instructions - API Python de Calcul de Production

## 🚀 Démarrage de l'API Python

### 1. Ouvrir un nouveau terminal
Dans Bolt, ouvrez un **nouveau terminal** (ne fermez pas celui de Vite).

### 2. Naviguer vers le dossier Python
```bash
cd python
```

### 3. Installer les dépendances (si pas déjà fait)
```bash
pip install -r requirements.txt
```

### 4. Démarrer l'API
```bash
python start_api.py
```

## 📋 Vérification du Fonctionnement

### 1. API démarrée
Vous devriez voir :
```
🐍 Démarrage de l'API Python Kinjo...
✅ Module app importé avec succès
🚀 Démarrage sur http://localhost:8000
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Test de l'API
Ouvrez dans votre navigateur :
- **http://localhost:8000/** - Page d'accueil de l'API
- **http://localhost:8000/health** - Vérification santé

### 3. Test avec l'installation cible
```bash
curl -X POST "http://localhost:8000/api/installations/eb7f2618-58eb-4b3b-9db3-449ad8205596/calculate-production"
```

## 🧪 Test depuis l'Application React

Une fois l'API Python démarrée :

1. **Allez sur** : http://localhost:5174/test-python
2. **Cliquez sur "Test Complet"**
3. **Regardez la console** pour voir les appels API

## 🔧 Corrections Apportées

### ✅ Problèmes Résolus :
1. **Imports corrigés** dans `supabase.py`
2. **Service de simulation** créé pour remplacer l'API PVWatts
3. **Routes corrigées** avec gestion d'erreurs
4. **CORS configuré** pour localhost:5174
5. **Script de démarrage** simplifié

### 🌞 Simulation de Production :
- **Calcul basé sur la latitude** (potentiel solaire français)
- **Génération de courbes horaires** réalistes
- **Données au format 15 minutes** comme requis
- **Mise à jour automatique** de `energie_injectee`

## 📊 Données de Test

L'installation `eb7f2618-58eb-4b3b-9db3-449ad8205596` sera testée avec :
- Position géographique réelle
- Calcul de production simulé mais réaliste
- Mise à jour de la base de données
- Génération du fichier CSV

## 🎯 Prochaines Étapes

1. **Démarrer l'API Python** avec les instructions ci-dessus
2. **Tester via l'interface web** sur /test-python
3. **Vérifier les résultats** dans la base de données
4. **Intégrer avec l'edge function** si nécessaire