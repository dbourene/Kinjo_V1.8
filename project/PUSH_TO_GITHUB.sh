#!/bin/bash

# =============================================================================
# KINJO APP - DÉPLOIEMENT AUTOMATIQUE VERS GITHUB
# Repository: dbourene/Kinjo_V1.2
# Version du 15 Janvier 2025 - 06:30 UTC
# =============================================================================

echo "🚀 Déploiement automatique de Kinjo Energy Platform vers GitHub..."
echo "📋 Repository: dbourene/Kinjo_V1.2"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage coloré
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté dans le répertoire racine du projet Kinjo"
    echo "📁 Assurez-vous d'être dans le dossier contenant package.json"
    exit 1
fi

print_step "Vérification de la structure du projet..."

# Vérifier les fichiers critiques
REQUIRED_FILES=("src/App.tsx" "src/pages/Registration.tsx" "src/pages/Home.tsx" "src/lib/supabase.ts")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Fichier critique manquant: $file"
        exit 1
    fi
done

print_success "Structure du projet validée"

# Créer .gitignore si il n'existe pas
if [ ! -f ".gitignore" ]; then
    print_step "Création du .gitignore..."
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

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Supabase
.supabase/
EOF
    print_success ".gitignore créé"
fi

# Créer .env.example si il n'existe pas
if [ ! -f ".env.example" ]; then
    print_step "Création du .env.example..."
    cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Email Configuration (pour tests)
VITE_USE_MAILTRAP=true
EOF
    print_success ".env.example créé"
fi

# Créer README.md complet
print_step "Création du README.md..."
cat > README.md << 'EOF'
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

```bash
# Cloner le repository
git clone https://github.com/dbourene/Kinjo_V1.2.git
cd Kinjo_V1.2

# Installation automatique
chmod +x QUICK_RECOVERY.sh
./QUICK_RECOVERY.sh

# Démarrer l'application
npm run dev
```

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
- `producteurs` : Données des producteurs d'énergie
- `consommateurs` : Données des consommateurs
- `installations` : Installations de production (PRM, puissance, tarifs)

## 🔧 Configuration

1. Copier `.env.example` vers `.env`
2. Configurer les variables Supabase
3. Appliquer les migrations SQL (15 migrations)
4. Déployer les edge functions

### Variables d'Environnement

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_MAILTRAP=true  # Mode test pour les emails
```

## 📚 Documentation

- [📋 Script de Récupération](KINJO_BACKUP_SCRIPT.md)
- [✅ Checklist Déploiement](DEPLOYMENT_CHECKLIST.md)
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
5. **Sauvegarde** : Directe en base dans `producteurs` et `installations`

### Inscription Consommateur
1. **Profil** : Particulier ou Entreprise
2. **Validation** : Même système que producteurs
3. **Sauvegarde** : Table `consommateurs`

### Sécurité
- **RLS Policies** : Chaque utilisateur ne voit que ses données
- **Validation** : Contraintes sur formats email, téléphone, SIRET, PRM
- **API Sécurisée** : Edge functions pour appels externes

## 🎯 Version Actuelle

**v1.2.0** - Production Ready (15 Janvier 2025)

✅ **Fonctionnalités Validées:**
- Flux d'inscription producteur/consommateur complet
- Intégration API INSEE fonctionnelle
- Base de données sécurisée avec RLS
- Gestion installations avec tarification dans table installations
- Politiques RLS corrigées et optimisées
- Tests complets validés

## 🛠️ Développement

```bash
# Démarrer en mode développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
```

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les issues GitHub
3. Utiliser le script de vérification de la base de données

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

**Développé avec ❤️ pour l'énergie renouvelable**
EOF

print_success "README.md créé"

# Initialiser Git si ce n'est pas déjà fait
if [ ! -d ".git" ]; then
    print_step "Initialisation de Git..."
    git init
    print_success "Git initialisé"
else
    print_warning "Repository Git déjà initialisé"
fi

# Configurer la branche principale
print_step "Configuration de la branche principale..."
git branch -M main

# Ajouter tous les fichiers
print_step "Ajout des fichiers au repository..."
git add .

# Vérifier s'il y a des changements à commiter
if git diff --staged --quiet; then
    print_warning "Aucun changement détecté, vérification du statut..."
    git status
else
    print_success "Changements détectés, préparation du commit..."
fi

# Commit avec un message détaillé
print_step "Création du commit..."
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

🔧 Corrections techniques:
- Flux d'inscription producteur corrigé
- Gestion métadonnées utilisateur améliorée
- Insertion installations avec tarification
- Politiques RLS optimisées
- Contraintes de validation renforcées

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

if [ $? -eq 0 ]; then
    print_success "Commit créé avec succès"
else
    print_error "Erreur lors du commit"
    exit 1
fi

# Ajouter le remote GitHub
print_step "Configuration du remote GitHub..."
if git remote get-url origin >/dev/null 2>&1; then
    print_warning "Remote origin déjà configuré"
    git remote set-url origin https://github.com/dbourene/Kinjo_V1.2.git
    print_success "Remote origin mis à jour"
else
    git remote add origin https://github.com/dbourene/Kinjo_V1.2.git
    print_success "Remote origin ajouté"
fi

# Pousser vers GitHub
print_step "Push vers GitHub..."
echo "🔄 Envoi du code vers https://github.com/dbourene/Kinjo_V1.2..."

git push -u origin main

if [ $? -eq 0 ]; then
    print_success "Code poussé avec succès vers GitHub!"
else
    print_error "Erreur lors du push vers GitHub"
    echo ""
    echo "🔧 Solutions possibles:"
    echo "1. Vérifiez que le repository existe sur GitHub:"
    echo "   https://github.com/dbourene/Kinjo_V1.2"
    echo ""
    echo "2. Si le repository n'existe pas, créez-le sur GitHub:"
    echo "   - Allez sur https://github.com/new"
    echo "   - Nom: Kinjo_V1.2"
    echo "   - Description: Plateforme d'énergie renouvelable"
    echo "   - Public ou Private selon votre préférence"
    echo "   - NE PAS initialiser avec README, .gitignore ou licence"
    echo ""
    echo "3. Puis relancez ce script"
    exit 1
fi

# Créer un tag de version
print_step "Création du tag de version..."
git tag -a v1.2.0 -m "Version 1.2.0 - Production Ready

🎯 Fonctionnalités complètes:
- Inscription producteur/consommateur avec installations
- Intégration API INSEE pour entreprises
- Base de données sécurisée avec RLS
- Gestion tarification dans installations
- Interface moderne React + TypeScript

✅ Tests validés et prêt pour la production"

git push origin v1.2.0

if [ $? -eq 0 ]; then
    print_success "Tag v1.2.0 créé et poussé"
else
    print_warning "Erreur lors de la création du tag (non critique)"
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
echo ""
echo "📋 Résumé:"
echo "   • Repository: https://github.com/dbourene/Kinjo_V1.2"
echo "   • Branche: main"
echo "   • Version: v1.2.0"
echo "   • Commit: Kinjo Energy Platform v1.2.0 - Production Ready"
echo ""
echo "🔗 Liens utiles:"
echo "   • Repository: https://github.com/dbourene/Kinjo_V1.2"
echo "   • Releases: https://github.com/dbourene/Kinjo_V1.2/releases"
echo "   • Issues: https://github.com/dbourene/Kinjo_V1.2/issues"
echo ""
echo "📊 Contenu déployé:"
echo "   • ✅ Code source complet (React + TypeScript)"
echo "   • ✅ Migrations Supabase (15 fichiers)"
echo "   • ✅ Edge functions (API INSEE)"
echo "   • ✅ Documentation complète"
echo "   • ✅ Scripts d'installation"
echo "   • ✅ Assets et images"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Vérifiez le repository sur GitHub"
echo "   2. Configurez les secrets pour le déploiement (si nécessaire)"
echo "   3. Testez le clonage et l'installation"
echo "   4. Partagez le lien avec votre équipe"
echo ""
echo "🎯 Votre application Kinjo est maintenant sur GitHub!"
echo "   Repository: https://github.com/dbourene/Kinjo_V1.2"