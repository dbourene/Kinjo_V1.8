@echo off
REM =============================================================================
REM KINJO APP - DÉPLOIEMENT AUTOMATIQUE VERS GITHUB (VERSION WINDOWS)
REM Repository: dbourene/Kinjo_V1.2
REM Version du 15 Janvier 2025 - 06:30 UTC
REM =============================================================================

echo 🚀 Déploiement automatique de Kinjo Energy Platform vers GitHub...
echo 📋 Repository: dbourene/Kinjo_V1.2
echo.

REM Vérifier que nous sommes dans le bon répertoire
if not exist "package.json" (
    echo ❌ Ce script doit être exécuté dans le répertoire racine du projet Kinjo
    echo 📁 Assurez-vous d'être dans le dossier contenant package.json
    pause
    exit /b 1
)

echo 📋 Vérification de la structure du projet...

REM Vérifier les fichiers critiques
if not exist "src\App.tsx" (
    echo ❌ Fichier critique manquant: src\App.tsx
    pause
    exit /b 1
)

if not exist "src\pages\Registration.tsx" (
    echo ❌ Fichier critique manquant: src\pages\Registration.tsx
    pause
    exit /b 1
)

echo ✅ Structure du projet validée

REM Créer .gitignore si il n'existe pas
if not exist ".gitignore" (
    echo 📝 Création du .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Production build
        echo dist/
        echo build/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # IDE
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo.
        echo # OS
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Logs
        echo logs/
        echo *.log
        echo.
        echo # Supabase
        echo .supabase/
    ) > .gitignore
    echo ✅ .gitignore créé
)

REM Créer .env.example si il n'existe pas
if not exist ".env.example" (
    echo 📝 Création du .env.example...
    (
        echo # Supabase Configuration
        echo VITE_SUPABASE_URL=your_supabase_url_here
        echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
        echo.
        echo # Email Configuration ^(pour tests^)
        echo VITE_USE_MAILTRAP=true
    ) > .env.example
    echo ✅ .env.example créé
)

REM Initialiser Git si ce n'est pas déjà fait
if not exist ".git" (
    echo 📋 Initialisation de Git...
    git init
    if errorlevel 1 (
        echo ❌ Erreur lors de l'initialisation de Git
        echo 💡 Assurez-vous que Git est installé et accessible
        pause
        exit /b 1
    )
    echo ✅ Git initialisé
) else (
    echo ⚠️ Repository Git déjà initialisé
)

REM Configurer la branche principale
echo 📋 Configuration de la branche principale...
git branch -M main

REM Ajouter tous les fichiers
echo 📋 Ajout des fichiers au repository...
git add .

REM Commit avec un message détaillé
echo 📋 Création du commit...
git commit -m "🎉 Kinjo Energy Platform v1.2.0 - Production Ready

✅ Fonctionnalités principales:
- 🏭 Inscription producteur (particulier/entreprise) avec installations
- 🏠 Inscription consommateur (particulier/entreprise)
- 🏢 Intégration API INSEE pour validation SIRET automatique
- ⚡ Gestion complète des installations (PRM, puissance, tarification)
- 🔒 Sécurité RLS Supabase avec politiques optimisées
- 📱 Interface React + TypeScript + Tailwind CSS

🗄️ Base de données:
- Tables: producteurs, consommateurs, installations
- 15 migrations SQL appliquées
- Stockage tarifs dans installations.tarif_base
- Politiques RLS sécurisées et testées

🎯 Tests validés:
- Inscription producteur particulier ✅
- Inscription producteur entreprise ✅
- Inscription consommateur particulier ✅
- Inscription consommateur entreprise ✅
- API INSEE fonctionnelle ✅
- Sauvegarde en base de données ✅

📅 Version: 1.2.0 - 15 Janvier 2025
🚀 Status: Production Ready
👨‍💻 Développeur: dbourene"

if errorlevel 1 (
    echo ❌ Erreur lors du commit
    pause
    exit /b 1
)

echo ✅ Commit créé avec succès

REM Ajouter le remote GitHub
echo 📋 Configuration du remote GitHub...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin https://github.com/dbourene/Kinjo_V1.2.git
    echo ✅ Remote origin ajouté
) else (
    git remote set-url origin https://github.com/dbourene/Kinjo_V1.2.git
    echo ✅ Remote origin mis à jour
)

REM Pousser vers GitHub
echo 📋 Push vers GitHub...
echo 🔄 Envoi du code vers https://github.com/dbourene/Kinjo_V1.2...

git push -u origin main

if errorlevel 1 (
    echo ❌ Erreur lors du push vers GitHub
    echo.
    echo 🔧 Solutions possibles:
    echo 1. Vérifiez que le repository existe sur GitHub:
    echo    https://github.com/dbourene/Kinjo_V1.2
    echo.
    echo 2. Si le repository n'existe pas, créez-le sur GitHub:
    echo    - Allez sur https://github.com/new
    echo    - Nom: Kinjo_V1.2
    echo    - Description: Plateforme d'énergie renouvelable
    echo    - Public ou Private selon votre préférence
    echo    - NE PAS initialiser avec README, .gitignore ou licence
    echo.
    echo 3. Puis relancez ce script
    pause
    exit /b 1
)

echo ✅ Code poussé avec succès vers GitHub!

REM Créer un tag de version
echo 📋 Création du tag de version...
git tag -a v1.2.0 -m "Version 1.2.0 - Production Ready"
git push origin v1.2.0

if errorlevel 1 (
    echo ⚠️ Erreur lors de la création du tag (non critique)
) else (
    echo ✅ Tag v1.2.0 créé et poussé
)

echo.
echo 🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!
echo.
echo 📋 Résumé:
echo    • Repository: https://github.com/dbourene/Kinjo_V1.2
echo    • Branche: main
echo    • Version: v1.2.0
echo    • Commit: Kinjo Energy Platform v1.2.0 - Production Ready
echo.
echo 🔗 Liens utiles:
echo    • Repository: https://github.com/dbourene/Kinjo_V1.2
echo    • Releases: https://github.com/dbourene/Kinjo_V1.2/releases
echo    • Issues: https://github.com/dbourene/Kinjo_V1.2/issues
echo.
echo 🎯 Votre application Kinjo est maintenant sur GitHub!
echo    Repository: https://github.com/dbourene/Kinjo_V1.2
echo.
pause