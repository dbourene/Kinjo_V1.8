import requests
import pandas as pd

# === PARAMÈTRES DE CONFIGURATION ===
API_KEY = "cUfCcCkCiPu8fs7pObzfECghSY0eajNFXteG0TVb"  # Remplace par ta vraie clé API ici
LAT = 45.75
LON = 4.85
CAPACITE_KWC = 110  # Puissance crête
TILT = 30         # Inclinaison des panneaux
AZIMUTH = 180     # 180 = plein sud
PERTE = 14        # % de pertes totales (câbles, ombrage, etc.)

# === APPEL DE L’API PVWatts ===
url = (
    "https://developer.nrel.gov/api/pvwatts/v8.json?"
    f"api_key={API_KEY}"
    f"&lat={LAT}&lon={LON}"
    f"&system_capacity={CAPACITE_KWC}"
    f"&azimuth={AZIMUTH}&tilt={TILT}"
    f"&losses={PERTE}"
    "&array_type=1"        # 1 = Fixed - Roof Mounted
    "&module_type=0"       # 0 = standard
    "&timeframe=hourly"
    "&dataset=intl"        # important pour les sites en Europe
)

response = requests.get(url)
data = response.json()

# === EXTRACTION DES DONNÉES ===
if "errors" in data and data["errors"]:
    raise Exception("Erreur dans l'appel API : " + str(data["errors"]))

outputs = data["outputs"]
ac = outputs["ac"]              # liste des productions horaires (en kWh)

# Générer l'index temporel : 8760 heures à partir du 1er janvier
year = outputs.get("year", 2020)  # fallback si "year" non fourni
idx = pd.date_range(f"{year}-01-01 00:00", periods=len(ac), freq="h")

# Création d’un DataFrame
df = pd.DataFrame({
    "production_ac_kWh": [val/1000 for val in ac]
}, index=idx)

# Calcul de l'énergie produite sur l'année
energie_produite = df["production_ac_kWh"].sum()

# Affichage du résultat
print(f"Énergie produite totale sur l'année : {energie_produite:.2f} kWh")

# === EXPORT VERS EXCEL ===
fichier_excel = "pvwatts_production_horaire.xlsx"
df.to_excel(fichier_excel, index_label="time")
print(f"✅ Production PV exportée dans le fichier : {fichier_excel}")