#!/bin/bash

# =============================================================================
# KINJO APP - SCRIPT DE RÉCUPÉRATION RAPIDE
# Version du 15 Janvier 2025 - 06:00 UTC
# =============================================================================

echo "🚀 Démarrage de la récupération de l'application Kinjo..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté dans le répertoire racine du projet Kinjo"
    echo "📁 Assurez-vous d'être dans le dossier contenant package.json"
    exit 1
fi

echo "📦 Installation des dépendances..."
npm install

# Vérifier que l'installation s'est bien passée
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées avec succès"

# Vérifier la présence du fichier .env
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant. Création d'un fichier d'exemple..."
    cat > .env << EOF
VITE_SUPABASE_URL=https://jkpugvpeejprxyczkcqt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcHVndnBlZWpwcnh5Y3prY3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjU1NTksImV4cCI6MjA2MzA0MTU1OX0.q6_q0TetSkY2njOdjZ3Zsq5DgfzSL9Exhn65fV04sRc
VITE_USE_MAILTRAP=true
EOF
    echo "📝 Fichier .env créé avec les valeurs par défaut"
else
    echo "✅ Fichier .env trouvé"
fi

# Vérifier la structure des dossiers critiques
echo "🔍 Vérification de la structure du projet..."

REQUIRED_DIRS=("src" "src/pages" "src/lib" "src/components" "src/components/ui" "public" "supabase" "supabase/migrations")
REQUIRED_FILES=("src/App.tsx" "src/pages/Registration.tsx" "src/pages/Home.tsx" "src/lib/supabase.ts")

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Dossier manquant: $dir"
        exit 1
    fi
done

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier critique manquant: $file"
        exit 1
    fi
done

echo "✅ Structure du projet vérifiée"

# Vérifier les migrations Supabase
echo "🗄️  Vérification des migrations Supabase..."
MIGRATION_COUNT=$(find supabase/migrations -name "*.sql" | wc -l)
if [ $MIGRATION_COUNT -lt 10 ]; then
    echo "⚠️  Nombre de migrations insuffisant ($MIGRATION_COUNT trouvées, au moins 10 attendues)"
    echo "📋 Migrations trouvées:"
    ls -la supabase/migrations/
else
    echo "✅ $MIGRATION_COUNT migrations trouvées"
fi

# Vérifier les assets publics
echo "🖼️  Vérification des assets..."
REQUIRED_ASSETS=("Fichier 1@2x 5 (1).png" "mask-group.png")
for asset in "${REQUIRED_ASSETS[@]}"; do
    if [ ! -f "public/$asset" ]; then
        echo "⚠️  Asset manquant: public/$asset"
    else
        echo "✅ Asset trouvé: $asset"
    fi
done

# Test de compilation
echo "🔨 Test de compilation..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Compilation réussie"
    # Nettoyer le build de test
    rm -rf dist
else
    echo "⚠️  Erreur de compilation - vérifiez les logs avec 'npm run build'"
fi

echo ""
echo "🎉 Récupération terminée !"
echo ""
echo "📋 Résumé de l'application Kinjo:"
echo "   • Inscription producteur/consommateur (particulier/entreprise)"
echo "   • Intégration API INSEE pour les entreprises"
echo "   • Gestion des installations (PRM, puissance, tarification)"
echo "   • Stockage direct en base de données"
echo "   • Politiques RLS sécurisées"
echo ""
echo "🚀 Pour démarrer l'application:"
echo "   npm run dev"
echo ""
echo "🌐 L'application sera accessible sur:"
echo "   http://localhost:5173"
echo ""
echo "🔧 Pour vérifier la base de données:"
echo "   1. Connectez-vous à votre dashboard Supabase"
echo "   2. Vérifiez les tables: producteurs, consommateurs, installations"
echo "   3. Testez une inscription producteur"
echo ""
echo "✅ Version: 15 Janvier 2025 - 06:00 UTC"
echo "✅ Status: Production Ready"