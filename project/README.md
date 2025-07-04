# Kinjo - Plateforme d'Énergie Renouvelable

## 🧪 Mode Test pour les Emails

Pour éviter les limitations d'envoi d'emails de Supabase (2 emails/heure), vous pouvez activer le mode test :

### Configuration rapide :

1. **Créer le fichier `.env.local`** :
```bash
# Mode test - simule les emails sans les envoyer
VITE_USE_MAILTRAP=true

# Gardez vos vraies valeurs Supabase
VITE_SUPABASE_ANON_KEY=votre_clé
VITE_SUPABASE_URL=votre_url
```

2. **Redémarrer le serveur** :
```bash
npm run dev
```

### 🎯 Comment ça marche :

- **Mode TEST** (`VITE_USE_MAILTRAP=true`) :
  - ✅ Aucun email réel envoyé
  - ✅ Bouton de test automatique
  - ✅ Tests illimités
  - ✅ Simulation complète du processus

- **Mode PRODUCTION** (`VITE_USE_MAILTRAP=false` ou absent) :
  - 📧 Emails réels via Supabase
  - ⚠️ Limité à 2 emails/heure

### 🔄 Basculer entre les modes :

```bash
# Activer le mode test
echo "VITE_USE_MAILTRAP=true" >> .env.local

# Désactiver le mode test (production)
echo "VITE_USE_MAILTRAP=false" >> .env.local
```

### 🧪 Test du processus complet :

1. **Inscription entreprise** → Email simulé
2. **Clic sur "Tester la confirmation"** → Redirection automatique
3. **Vérification** → Insertion en base de données
4. **Succès** → Compte créé

---

## Getting started

> **Prerequisites:**
> The following steps require [NodeJS](https://nodejs.org/en/) to be installed on your system, so please
> install it beforehand if you haven't already.

To get started with your project, you'll first need to install the dependencies with:

```
npm install
```

Then, you'll be able to run a development version of the project with:

```
npm run dev
```

After a few seconds, your project should be accessible at the address
[http://localhost:5173/](http://localhost:5173/)

If you are satisfied with the result, you can finally build the project for release with:

```
npm run build
```