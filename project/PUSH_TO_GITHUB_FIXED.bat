@echo off
REM =============================================================================
REM KINJO APP - DÉPLOIEMENT VERS GITHUB CORRIGÉ
REM Repository: dbourene/Kinjo_V1.2 (NOM CORRECT)
REM =============================================================================

echo 🚀 Déploiement vers GitHub - Repository: dbourene/Kinjo_V1.2
echo.

REM Vérifier que nous sommes dans le bon répertoire
if not exist "package.json" (
    echo ❌ Ce script doit être exécuté dans le répertoire racine du projet Kinjo
    echo 📁 Naviguez vers le dossier contenant package.json
    pause
    exit /b 1
)

echo ✅ Répertoire projet trouvé

REM Initialiser Git si nécessaire
if not exist ".git" (
    echo 📋 Initialisation de Git...
    git init
    if errorlevel 1 (
        echo ❌ Erreur Git - Vérifiez que Git est installé
        pause
        exit /b 1
    )
)

REM Configurer la branche principale
echo 📋 Configuration de la branche...
git branch -M main

REM Ajouter tous les fichiers
echo 📋 Ajout des fichiers...
git add .

REM Créer le commit
echo 📋 Création du commit...
git commit -m "🎉 Kinjo Energy Platform v1.2.0 - Production Ready

✅ Application complète d'énergie renouvelable
- Inscription producteur/consommateur (particulier/entreprise)
- Intégration API INSEE pour validation SIRET
- Gestion installations (PRM, puissance, tarification)
- Base de données Supabase sécurisée
- Interface React + TypeScript + Tailwind

🗄️ Base de données:
- Tables: producteurs, consommateurs, installations
- Politiques RLS sécurisées
- Stockage tarifs optimisé

📅 Version: 1.2.0 - 15 Janvier 2025
👨‍💻 Développeur: dbourene"

if errorlevel 1 (
    echo ⚠️ Aucun changement à commiter ou erreur de commit
)

REM Configurer le remote avec le BON nom de repository
echo 📋 Configuration du remote GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/dbourene/Kinjo_V1.2.git

REM Vérifier que le remote est correct
echo 🔗 Remote configuré: https://github.com/dbourene/Kinjo_V1.2.git

REM Pousser vers GitHub
echo 📋 Push vers GitHub...
git push -u origin main

if errorlevel 1 (
    echo ❌ Erreur lors du push
    echo.
    echo 🔧 SOLUTIONS:
    echo.
    echo 1. CRÉER LE REPOSITORY SUR GITHUB:
    echo    - Allez sur: https://github.com/new
    echo    - Nom: Kinjo_V1.2
    echo    - Description: Plateforme d'énergie renouvelable
    echo    - NE PAS initialiser avec README
    echo    - Cliquez "Create repository"
    echo.
    echo 2. PUIS RELANCEZ CE SCRIPT
    echo.
    pause
    exit /b 1
)

echo ✅ Code poussé avec succès!

REM Créer un tag
echo 📋 Création du tag v1.2.0...
git tag -a v1.2.0 -m "Version 1.2.0 - Production Ready"
git push origin v1.2.0

echo.
echo 🎉 SUCCÈS! Repository déployé:
echo 🔗 https://github.com/dbourene/Kinjo_V1.2
echo.
pause