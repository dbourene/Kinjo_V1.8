# 🌞 Intégration NREL PVWatts - Compte dbourene@audencia.com

## ✅ Configuration Terminée

### 🔑 Clé API Configurée
- **Email**: dbourene@audencia.com
- **Clé API**: cUfCcCkCiPu8fs7pObzfECghSY0eajNFXteG0TVb
- **Version**: PVWatts v8
- **Dataset**: International (pour l'Europe)

### 🚀 Fonctionnalités Implémentées

#### 1. **Service PVWatts Principal**
- Calcul de production avec l'API NREL officielle
- Données horaires converties en quarts d'heure
- Paramètres optimisés pour la France :
  - Orientation : 180° (Sud)
  - Inclinaison : 30°
  - Pertes système : 14%
  - Type de montage : Toiture fixe

#### 2. **Système de Fallback**
- Si PVWatts échoue → Basculement automatique vers simulation
- Aucune interruption de service
- Logs détaillés pour diagnostic

#### 3. **Validation des Données**
- Vérification des coordonnées GPS
- Contrôle de la cohérence des paramètres
- Gestion d'erreurs robuste

## 📊 Données Retournées

### Informations PVWatts :
- **Énergie annuelle** (kWh)
- **Facteur de capacité** (%)
- **Courbe de production** (8760 heures → 35040 points 15min)
- **Fichier CSV** avec horodatage complet

### Métadonnées :
- Source des données (PVWatts vs Simulation)
- Paramètres utilisés
- Qualité des données
- Erreurs éventuelles

## 🧪 Test de l'Intégration

### 1. Démarrer l'API Python
```bash
cd python
python start_api.py
```

### 2. Vérifier la Configuration
Ouvrir : **http://localhost:8000/**
- Doit afficher "pvwatts.configured: true"
- Clé API visible (masquée)

### 3. Tester avec Installation Réelle
```bash
curl -X POST "http://localhost:8000/api/installations/eb7f2618-58eb-4b3b-9db3-449ad8205596/calculate-production"
```

### 4. Via Interface Web
- Aller sur : **http://localhost:5174/test-python**
- Cliquer "Test Complet"
- Vérifier que "API NREL PVWatts" apparaît dans les résultats

## 🎯 Avantages de l'API NREL

### ✅ Données Officielles
- Modèle validé scientifiquement
- Données météorologiques réelles
- Précision élevée pour l'Europe

### ✅ Paramètres Avancés
- Prise en compte de l'ombrage
- Pertes système détaillées
- Variations saisonnières précises

### ✅ Format Professionnel
- Compatible avec les standards de l'industrie
- Données exploitables pour les contrats
- Traçabilité complète

## 🔧 Configuration Technique

### Variables d'Environnement :
```env
NREL_API_KEY=cUfCcCkCiPu8fs7pObzfECghSY0eajNFXteG0TVb
PVWATTS_API_URL=https://developer.nrel.gov/api/pvwatts/v8.json
PVWATTS_DATASET=intl
```

### Paramètres PVWatts :
- **azimuth**: 180 (orientation sud)
- **tilt**: 30 (inclinaison optimale France)
- **array_type**: 1 (montage toiture fixe)
- **module_type**: 0 (modules standard)
- **losses**: 14 (pertes système %)
- **timeframe**: hourly
- **dataset**: intl (données internationales)

## 📈 Exemple de Résultat

```json
{
  "success": true,
  "message": "Calcul de production effectué avec succès (API NREL PVWatts)",
  "data": {
    "filename": "12345678901234_01012024_31122024_Prod_CDC_PVWATTS.csv",
    "energie_kwh": 8547.32,
    "annual_energy": 8547.32,
    "capacity_factor": 19.8,
    "api_source": "NREL PVWatts v8",
    "dataset": "intl",
    "data_points": 35040
  },
  "api_source": "NREL PVWatts v8"
}
```

## 🎉 Prêt pour Production

L'intégration est maintenant complète et prête pour :
- ✅ Calculs de production réels
- ✅ Génération d'Annexe 21
- ✅ Contrats producteur-consommateur
- ✅ Analyses de rentabilité