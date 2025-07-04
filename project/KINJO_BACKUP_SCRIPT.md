# 🚀 Script de Sauvegarde et Récupération - Kinjo App

## 📅 Version du 15 Janvier 2025 - 06:00 UTC

Cette version inclut toutes les corrections et fonctionnalités suivantes :
- ✅ Inscription producteur/consommateur (particulier/entreprise)
- ✅ Intégration API INSEE pour les données entreprise
- ✅ Gestion des installations avec PRM, puissance et tarification
- ✅ Stockage des tarifs dans la table `installations` (colonne `tarif_base`)
- ✅ Politiques RLS corrigées et fonctionnelles
- ✅ Insertion directe en base de données sans confirmation email
- ✅ Gestion complète du flux d'inscription producteur

---

## 🔧 Script de Récupération Complète

### 1. Création du projet

```bash
# Créer un nouveau projet Vite React TypeScript
npm create vite@latest kinjo-app -- --template react-ts
cd kinjo-app

# Installer toutes les dépendances
npm install react react-dom @supabase/supabase-js lucide-react class-variance-authority clsx tailwind-merge @fontsource/poppins react-router-dom react-phone-input-2 react-pin-input

# Installer les dépendances de développement
npm install -D @types/react @types/react-dom @vitejs/plugin-react autoprefixer postcss tailwindcss typescript eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint vite

# Initialiser Tailwind CSS
npx tailwindcss init -p
```

### 2. Configuration de l'environnement

Créer le fichier `.env` :
```env
VITE_SUPABASE_URL=https://jkpugvpeejprxyczkcqt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcHVndnBlZWpwcnh5Y3prY3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NjU1NTksImV4cCI6MjA2MzA0MTU1OX0.q6_q0TetSkY2njOdjZ3Zsq5DgfzSL9Exhn65fV04sRc
VITE_USE_MAILTRAP=true
```

### 3. Structure des fichiers principaux

Les fichiers suivants doivent être copiés depuis cette version :

#### Configuration
- `package.json` - Dépendances complètes
- `tailwind.config.js` - Configuration Tailwind avec couleurs Kinjo
- `vite.config.ts` - Configuration Vite
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` - Configuration TypeScript

#### Code source principal
- `src/App.tsx` - Router principal
- `src/index.tsx` - Point d'entrée
- `src/index.css` - Styles globaux avec Tailwind

#### Pages principales
- `src/pages/Home.tsx` - Page d'accueil avec sélection producteur/consommateur
- `src/pages/Registration.tsx` - Flux d'inscription complet (CRITIQUE)
- `src/pages/EmailConfirmation.tsx` - Gestion confirmation email

#### Services et utilitaires
- `src/lib/supabase.ts` - Client Supabase
- `src/lib/email-service.ts` - Service email avec mode test
- `src/lib/utils.ts` - Utilitaires généraux
- `src/utils/debug.ts` - Outils de debug

#### Composants UI
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/back-button.tsx`

#### Écrans spéciaux
- `src/screens/KinjoLogo/KinjoLogo.tsx`

### 4. Base de données Supabase

#### Migrations à appliquer dans l'ordre :

1. **20250517084327_yellow_pine.sql** - Tables participants de base
2. **20250606155549_yellow_paper.sql** - Configuration auth
3. **20250606164331_round_palace.sql** - Politiques RLS consommateurs
4. **20250607061748_light_meadow.sql** - Correction politiques RLS
5. **20250611045523_restless_shore.sql** - Politiques pour inscription directe
6. **20250611051625_hidden_rice.sql** - UUID par défaut
7. **20250611053520_navy_dust.sql** - Format téléphone international
8. **20250611054451_light_block.sql** - Correction contrainte téléphone
9. **20250611055259_blue_bonus.sql** - Format E.164 téléphone
10. **20250615045537_rustic_plain.sql** - Ajout colonne tarif_base
11. **20250615053143_warm_firefly.sql** - Nettoyage et politiques finales

#### Edge Functions
- `supabase/functions/insee/index.ts` - Intégration API INSEE

### 5. Assets publics

Fichiers dans le dossier `public/` :
- `Fichier 1@2x 5 (1).png` - Logo Kinjo
- `mask-group.png` - Logo alternatif
- `ENEDIS_CA_inf36kVA.png` - Guide PRM ≤36kVA
- `ENEDIS_CARDi_sup36kVA.png` - Guide PRM >36kVA

---

## 🎯 Fonctionnalités Clés de cette Version

### Inscription Producteur
1. **Sélection type** : Particulier ou Entreprise
2. **Données personnelles** : Email, nom/prénom ou contact entreprise
3. **Validation entreprise** : SIRET + API INSEE automatique
4. **Mot de passe** : Validation sécurisée
5. **Téléphone** (particuliers) : Vérification SMS simulée
6. **Installation** : PRM (14 chiffres) + Puissance (kWc) + Tarif (ct€/kWh)
7. **Sauvegarde** : Directe en base dans `producteurs` et `installations`

### Inscription Consommateur
1. **Sélection type** : Particulier ou Entreprise
2. **Données personnelles** : Identique aux producteurs
3. **Sauvegarde** : Directe en base dans `consommateurs`

### Base de Données
- **Tables principales** : `producteurs`, `consommateurs`, `installations`
- **Politiques RLS** : Sécurisées et fonctionnelles
- **Tarification** : Stockée dans `installations.tarif_base`
- **API INSEE** : Intégration automatique pour les entreprises

---

## 🚀 Commandes de Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build
```

---

## 🔍 Points de Vérification

### Après installation, vérifier :

1. **Tables Supabase** :
   ```sql
   SELECT * FROM producteurs LIMIT 5;
   SELECT * FROM installations LIMIT 5;
   SELECT * FROM consommateurs LIMIT 5;
   ```

2. **Politiques RLS** :
   ```sql
   SELECT tablename, policyname, cmd FROM pg_policies 
   WHERE tablename IN ('producteurs', 'installations', 'consommateurs');
   ```

3. **Colonnes installations** :
   ```sql
   \d installations
   -- Vérifier que tarif_base existe
   ```

4. **Test inscription** :
   - Aller sur `http://localhost:5173`
   - Tester inscription producteur entreprise
   - Vérifier données dans les tables

---

## 📋 Checklist de Récupération

- [ ] Projet Vite créé
- [ ] Dépendances installées
- [ ] Fichier `.env` configuré
- [ ] Tous les fichiers source copiés
- [ ] Migrations Supabase appliquées
- [ ] Edge function INSEE déployée
- [ ] Assets publics copiés
- [ ] Test inscription producteur OK
- [ ] Test inscription consommateur OK
- [ ] Données en base vérifiées

---

## 🆘 Dépannage

### Erreur RLS
```sql
-- Réappliquer la dernière migration
\i supabase/migrations/20250615053143_warm_firefly.sql
```

### Erreur API INSEE
```bash
# Redéployer la fonction
supabase functions deploy insee
```

### Erreur tarif_base
```sql
-- Vérifier la colonne
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'installations' AND column_name = 'tarif_base';
```

---

## 📞 Support

Cette version est stable et testée. Toutes les fonctionnalités d'inscription producteur/consommateur sont opérationnelles avec sauvegarde directe en base de données.

**Version** : 15 Janvier 2025 - 06:00 UTC  
**Status** : ✅ Production Ready  
**Dernière modification** : Correction insertion installations avec tarification