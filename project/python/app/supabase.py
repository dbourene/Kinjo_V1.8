import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jkpugvpeejprxyczkcqt.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcHVndnBlZWpwcnh5Y3prY3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjU1NTksImV4cCI6MjA2MzA0MTU1OX0.q6_q0TetSkY2njOdjZ3Zsq5DgfzSL9Exhn65fV04sRc")

# Créer le client Supabase
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Export pour compatibilité
supabase = supabase_client