# 🚀 Kinjo App - Checklist de Déploiement

## Version du 15 Janvier 2025 - 06:00 UTC

### ✅ Pré-requis Vérifiés

- [x] **Application fonctionnelle** : Inscription producteur/consommateur OK
- [x] **Base de données** : Tables et politiques RLS configurées
- [x] **API INSEE** : Edge function déployée et testée
- [x] **Assets** : Images et logos présents
- [x] **Tests** : Flux d'inscription validé

---

## 📋 Checklist de Récupération

### 1. Environnement de Développement

- [ ] Node.js installé (v18+)
- [ ] Git configuré
- [ ] Accès au projet Supabase
- [ ] Clés API Supabase disponibles

### 2. Récupération du Code

```bash
# Option A: Utiliser le script automatique
chmod +x QUICK_RECOVERY.sh
./QUICK_RECOVERY.sh

# Option B: Installation manuelle
npm install
```

### 3. Configuration

- [ ] Fichier `.env` créé avec les bonnes valeurs
- [ ] Variables Supabase configurées
- [ ] Mode test activé (`VITE_USE_MAILTRAP=true`)

### 4. Base de Données

- [ ] Toutes les migrations appliquées (11 migrations)
- [ ] Tables créées : `producteurs`, `consommateurs`, `installations`
- [ ] Colonne `tarif_base` présente dans `installations`
- [ ] Politiques RLS activées et fonctionnelles
- [ ] Edge function INSEE déployée

### 5. Tests Fonctionnels

- [ ] Page d'accueil accessible (`http://localhost:5173`)
- [ ] Sélection producteur/consommateur fonctionne
- [ ] Inscription producteur particulier complète
- [ ] Inscription producteur entreprise complète
- [ ] Inscription consommateur particulier complète
- [ ] Inscription consommateur entreprise complète
- [ ] Données sauvegardées en base
- [ ] API INSEE fonctionne pour les SIRET

### 6. Vérification Base de Données

```sql
-- Exécuter le script de vérification
\i DATABASE_VERIFICATION.sql
```

Vérifier que :
- [ ] Tables existent avec bonne structure
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS présentes (6+ par table)
- [ ] Index de performance créés
- [ ] Contraintes de validation actives

### 7. Assets et Ressources

- [ ] Logo Kinjo présent (`public/Fichier 1@2x 5 (1).png`)
- [ ] Images ENEDIS présentes pour guides PRM
- [ ] Fonts Poppins et Parkisans chargées
- [ ] Styles Tailwind appliqués

---

## 🔧 Commandes Utiles

### Développement
```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Construire pour la production
npm run preview      # Prévisualiser le build de production
```

### Base de Données
```bash
# Vérifier les migrations
ls -la supabase/migrations/

# Appliquer une migration spécifique
supabase db reset

# Vérifier les politiques RLS
supabase db diff
```

### Debug
```bash
# Logs détaillés dans la console du navigateur
# Activer les outils de développement
# Vérifier l'onglet Network pour les appels API
```

---

## 🚨 Points d'Attention

### Erreurs Communes

1. **RLS Policies** : Si erreur d'accès, vérifier les politiques
2. **API INSEE** : Vérifier que la fonction edge est déployée
3. **Tarif Base** : S'assurer que la colonne existe dans `installations`
4. **Phone Format** : Vérifier les contraintes E.164

### Solutions Rapides

```sql
-- Réappliquer les politiques RLS
\i supabase/migrations/20250615053143_warm_firefly.sql

-- Vérifier la colonne tarif_base
ALTER TABLE installations ADD COLUMN IF NOT EXISTS tarif_base numeric(10,2);

-- Redéployer la fonction INSEE
supabase functions deploy insee
```

---

## 📊 Métriques de Succès

### Fonctionnalités Validées ✅

- **Inscription Producteur Particulier** : Email → Nom → Mot de passe → Téléphone → SMS → Installation → Sauvegarde
- **Inscription Producteur Entreprise** : Email → SIRET → Contact → Mot de passe → Installation → Sauvegarde
- **Inscription Consommateur** : Flux similaire sans installation
- **API INSEE** : Récupération automatique des données entreprise
- **Stockage** : Données correctement sauvegardées dans les bonnes tables
- **Sécurité** : RLS policies fonctionnelles

### Données Stockées ✅

- **Producteurs** : Informations personnelles/entreprise + contact
- **Installations** : PRM (14 chiffres) + Puissance (kWc) + Tarif (ct€/kWh)
- **Consommateurs** : Informations personnelles/entreprise + contact

---

## 🎯 Prochaines Étapes

Après validation de cette version :

1. **Tests utilisateurs** : Faire tester le flux complet
2. **Optimisations** : Performance et UX
3. **Fonctionnalités** : Tableau de bord, gestion des contrats
4. **Déploiement** : Production avec domaine personnalisé

---

## 📞 Support

Cette version est stable et prête pour la production. Toutes les fonctionnalités critiques sont implémentées et testées.

**Contact** : Pour toute question sur cette version
**Documentation** : Voir `KINJO_BACKUP_SCRIPT.md` pour les détails techniques
**Logs** : Activer la console développeur pour le debugging