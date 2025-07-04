# 🚀 Commandes Manuelles Corrigées pour GitHub

## ⚠️ IMPORTANT: Nom du Repository

Votre repository s'appelle **`Kinjo_V1.2`** (pas `kinjo-energy-platform`)

## 📋 Étapes Correctes

### 1. Aller dans votre projet
```cmd
cd "C:\Users\cdbou\Documents\hello_real\kinjo\20250606_project-bolt-sb1-baembaby\20250606_Kinjo_V1"
```

### 2. Créer le repository sur GitHub (SI PAS DÉJÀ FAIT)
1. **Allez sur** : https://github.com/new
2. **Nom** : `Kinjo_V1.2` (EXACTEMENT ce nom)
3. **Description** : `Plateforme d'énergie renouvelable`
4. **NE PAS** cocher "Initialize with README"
5. **Cliquez** "Create repository"

### 3. Commandes Git avec le BON nom
```cmd
REM Initialiser Git
git init

REM Configurer la branche
git branch -M main

REM Ajouter tous les fichiers
git add .

REM Créer le commit
git commit -m "Initial commit - Kinjo Energy Platform"

REM IMPORTANT: Utiliser le BON nom de repository
git remote add origin https://github.com/dbourene/Kinjo_V1.2.git

REM Pousser vers GitHub
git push -u origin main
```

## 🔧 Si le repository existe déjà

Si vous avez déjà créé `Kinjo_V1.2` sur GitHub :

```cmd
REM Supprimer l'ancien remote (si il existe)
git remote remove origin

REM Ajouter le bon remote
git remote add origin https://github.com/dbourene/Kinjo_V1.2.git

REM Pousser
git push -u origin main
```

## ✅ Vérification

Après le push, vérifiez :
- **URL** : https://github.com/dbourene/Kinjo_V1.2
- **Fichiers** : src/, supabase/, package.json visibles
- **Commit** : Message visible dans l'historique

## 🆘 Script Automatique Corrigé

Utilisez le nouveau script `PUSH_TO_GITHUB_FIXED.bat` qui utilise le bon nom de repository.

## 📞 Si ça ne marche toujours pas

Dites-moi :
1. Le repository `Kinjo_V1.2` existe-t-il sur GitHub ?
2. Quelle erreur exacte obtenez-vous ?
3. Êtes-vous dans le bon dossier projet ?