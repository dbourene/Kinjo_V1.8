import csv
import io
import datetime
import pandas as pd
import requests
from app.supabase import supabase

def calc_prod_and_upload_csv(installation):
    api_key = "cUfCcCkCiPu8fs7pObzfECghSY0eajNFXteG0TVb"
    LAT = installation["latitude"]
    LON = installation["longitude"]
    CAPACITE_KWC = installation["puissance"]
    PRM = installation["prm"]
    INSTALLATION_ID = installation["id"]

    # Requête PVWatts
    url = "https://developer.nrel.gov/api/pvwatts/v8.json"
    params = {
        "api_key": api_key,
        "lat": LAT,
        "lon": LON,
        "system_capacity": CAPACITE_KWC,
        "azimuth": 180,
        "tilt": 30,
        "array_type": 1,
        "module_type": 1,
        "losses": 14,
        "timeframe": "hourly"
    }

    res = requests.get(url, params=params)
    data = res.json()

    if 'outputs' not in data or 'ac' not in data['outputs']:
        raise Exception("Erreur dans la réponse PVWatts : " + str(data))

    ac = data['outputs']['ac']  # liste de 8760 valeurs horaires
    timestamps = pd.date_range("2024-01-01", periods=8760, freq="H")  # année par défaut

    rows = []
    for ts, ac_hour in zip(timestamps, ac):
        ac_hour_kwh = ac_hour / 1000  # conversion Wh → kWh
        ac_quarter_kwh = ac_hour_kwh / 4
        for q in range(4):
            dt = ts + pd.Timedelta(minutes=15 * q)
            rows.append({
                "date": dt.date(),
                "time": dt.time(),
                "value_wh": round(ac_quarter_kwh * 1000, 2),  # stocké en Wh
                "interval_length": "15min",
                "installation_id": INSTALLATION_ID
            })

    df = pd.DataFrame(rows)

    # Fichier CSV à uploader
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=["date", "time", "value_wh", "interval_length", "installation_id"])
    writer.writeheader()
    writer.writerows(rows)

    datedebut = df.iloc[0]["date"].strftime("%d%m%Y")
    datedefin = df.iloc[-1]["date"].strftime("%d%m%Y")
    filename = f"{PRM}_{datedebut}_{datedefin}_Prod_CDC.csv"
    path = f"producteurs/avant_acc/{filename}"

    # Upload Supabase Storage
    supabase.storage.from_("courbescharge").upload(path, buffer.getvalue(), file_options={"content-type": "text/csv", "upsert": True})

    # Mise à jour installation
    energie_kwh = sum([r["value_wh"] for r in rows]) / 1000
    supabase.table("installations").update({"energie_injectee": energie_kwh}).eq("id", INSTALLATION_ID).execute()

    return {"filename": filename, "energie_kwh": round(energie_kwh, 2)}
