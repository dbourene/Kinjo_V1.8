#!/bin/bash

# =============================================================================
# SCRIPT DE CRÉATION AUTOMATIQUE DU REPOSITORY GITHUB KINJO
# =============================================================================

echo "🚀 Création du repository GitHub pour Kinjo Energy Platform..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté dans le répertoire racine du projet Kinjo"
    exit 1
fi

# Demander les informations GitHub
read -p "📝 Nom d'utilisateur GitHub: " GITHUB_USERNAME
read -p "📝 Nom du repository (défaut: kinjo-energy-platform): " REPO_NAME
REPO_NAME=${REPO_NAME:-kinjo-energy-platform}

echo "📋 Configuration:"
echo "   • Utilisateur: $GITHUB_USERNAME"
echo "   • Repository: $REPO_NAME"
echo "   • URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"

read -p "✅ Continuer? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

# Créer .gitignore si il n'existe pas
if [ ! -f ".gitignore" ]; then
    echo "📝 Création du .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Supabase
.supabase/
EOF
fi

# Créer .env.example si il n'existe pas
if [ ! -f ".env.example" ]; then
    echo "📝 Création du .env.example..."
    cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Email Configuration (pour tests)
VITE_USE_MAILTRAP=true
EOF
fi

# Créer README.md si il n'existe pas ou le mettre à jour
echo "📝 Création/Mise à jour du README.md..."
cat > README.md << EOF
# 🌱 Kinjo - Plateforme d'Énergie Renouvelable

Plateforme de connexion entre producteurs et consommateurs d'énergie renouvelable.

## ✨ Fonctionnalités

- 🏭 **Inscription Producteurs** : Particuliers et entreprises avec gestion des installations
- 🏠 **Inscription Consommateurs** : Gestion complète des profils
- 🏢 **Validation Entreprises** : Intégration API INSEE pour validation SIRET automatique
- ⚡ **Gestion Installations** : PRM (14 chiffres), puissance (kWc), tarification (ct€/kWh)
- 🔒 **Sécurité** : Politiques Row Level Security (RLS) Supabase
- 📱 **Interface Moderne** : React + TypeScript + Tailwind CSS

## 🚀 Installation Rapide

\`\`\`bash
# Cloner le repository
git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
cd $REPO_NAME

# Installation automatique
chmod +x QUICK_RECOVERY.sh
./QUICK_RECOVERY.sh

# Démarrer l'application
npm run dev
\`\`\`

## 📊 Architecture

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Vite** comme bundler

### Backend
- **Supabase** : Base de données PostgreSQL
- **Edge Functions** : API INSEE pour validation entreprises
- **Row Level Security** : Sécurité au niveau des lignes

### Tables Principales
- \`producteurs\` : Données des producteurs d'énergie
- \`consommateurs\` : Données des consommateurs
- \`installations\` : Installations de production (PRM, puissance, tarifs)

## 🔧 Configuration

1. Copier \`.env.example\` vers \`.env\`
2. Configurer les variables Supabase
3. Appliquer les migrations SQL (11 migrations)
4. Déployer les edge functions

### Variables d'Environnement

\`\`\`env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_MAILTRAP=true  # Mode test pour les emails
\`\`\`

## 📚 Documentation

- [📋 Script de Récupération](docs/KINJO_BACKUP_SCRIPT.md)
- [✅ Checklist Déploiement](docs/DEPLOYMENT_CHECKLIST.md)
- [🗄️ Vérification Base de Données](docs/DATABASE_VERIFICATION.sql)
- [🚀 Déploiement GitHub](DEPLOY_TO_GITHUB.md)

## 🎯 Fonctionnalités Détaillées

### Inscription Producteur
1. **Sélection type** : Particulier ou Entreprise
2. **Validation entreprise** : SIRET + récupération automatique des données INSEE
3. **Contact** : Informations personnelles ou contact entreprise
4. **Installation** : 
   - PRM (Point de Référence et de Mesure) - 14 chiffres
   - Puissance en kWc (kilowatts-crête)
   - Tarif de vente en ct€/kWh
5. **Sauvegarde** : Directe en base dans \`producteurs\` et \`installations\`

### Inscription Consommateur
1. **Profil** : Particulier ou Entreprise
2. **Validation** : Même système que producteurs
3. **Sauvegarde** : Table \`consommateurs\`

### Sécurité
- **RLS Policies** : Chaque utilisateur ne voit que ses données
- **Validation** : Contraintes sur formats email, téléphone, SIRET, PRM
- **API Sécurisée** : Edge functions pour appels externes

## 🎯 Version Actuelle

**v1.0.0** - Production Ready (15 Janvier 2025)

✅ **Fonctionnalités Validées:**
- Flux d'inscription producteur/consommateur complet
- Intégration API INSEE fonctionnelle
- Base de données sécurisée avec RLS
- Gestion installations avec tarification
- Tests complets validés

## 🛠️ Développement

\`\`\`bash
# Démarrer en mode développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
\`\`\`

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation dans \`docs/\`
2. Vérifier les issues GitHub
3. Utiliser le script de vérification \`DATABASE_VERIFICATION.sql\`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit les changements (\`git commit -m 'Add AmazingFeature'\`)
4. Push vers la branche (\`git push origin feature/AmazingFeature\`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier \`LICENSE\` pour plus de détails.

---

**Développé avec ❤️ pour l'énergie renouvelable**
EOF

# Initialiser Git si ce n'est pas déjà fait
if [ ! -d ".git" ]; then
    echo "🔧 Initialisation de Git..."
    git init
fi

# Ajouter tous les fichiers
echo "📦 Ajout des fichiers..."
git add .

# Commit initial
echo "💾 Commit initial..."
git commit -m "🎉 Initial commit - Kinjo Energy Platform v1.0.0

✅ Fonctionnalités incluses:
- Inscription producteur/consommateur (particulier/entreprise)
- Intégration API INSEE pour validation SIRET
- Gestion installations (PRM, puissance, tarification)
- Base de données Supabase avec RLS sécurisé
- Stockage tarifs dans table installations
- Flux d'inscription complet et testé

📊 Tables: producteurs, consommateurs, installations
🔒 Sécurité: Politiques RLS complètes
🏭 Installation: PRM + Puissance + Tarif
🏢 Entreprises: Validation SIRET automatique
📱 Interface: React + TypeScript + Tailwind

🎯 Version: 1.0.0 - Production Ready
📅 Date: 15 Janvier 2025"

# Configurer la branche principale
git branch -M main

# Ajouter le remote GitHub
echo "🔗 Configuration du remote GitHub..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Créer le repository sur GitHub:"
echo "      https://github.com/new"
echo "      Nom: $REPO_NAME"
echo "      Description: Plateforme d'énergie renouvelable - Connexion producteurs/consommateurs"
echo ""
echo "   2. Pousser le code:"
echo "      git push -u origin main"
echo ""
echo "   3. Créer un tag de version:"
echo "      git tag -a v1.0.0 -m 'Version 1.0.0 - Production Ready'"
echo "      git push origin v1.0.0"
echo ""
echo "🌐 URL du repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "📋 Fichiers créés/mis à jour:"
echo "   • README.md"
echo "   • .gitignore"
echo "   • .env.example"
echo "   • Configuration Git"
echo ""
echo "🎉 Votre projet Kinjo est prêt pour GitHub !"
EOF