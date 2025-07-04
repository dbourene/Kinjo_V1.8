from fastapi import APIRouter
from app.services.calcul_production import calc_prod_and_upload_csv
from app.supabase import supabase

router = APIRouter()

@router.post("/installations/{installation_id}/calculate-production")
def calculate_production(installation_id: str):
    res = supabase.table("installations").select("*").eq("id", installation_id).single().execute()
    if not res.data:
        return {"error": "Installation not found"}

    result = calc_prod_and_upload_csv(res.data)
    return result
