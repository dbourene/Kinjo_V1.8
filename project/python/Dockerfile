FROM python:3.11-slim

# Crée un dossier de travail
WORKDIR /app

# Copie les fichiers
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

# Lancement de l’API FastAPI via Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]