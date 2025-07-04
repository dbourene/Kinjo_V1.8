# 🚀 Commandes Manuelles pour Déploiement GitHub

## 📍 Étapes à Suivre

### 1. Naviguer vers votre projet
```cmd
cd "C:\Users\cdbou\Documents\hello_real\kinjo\20250606_project-bolt-sb1-baembaby\20250606_Kinjo_V1"
```

### 2. Vérifier que vous êtes au bon endroit
```cmd
dir package.json
dir src
dir supabase
```

### 3. Créer le repository sur GitHub AVANT de continuer
1. **Allez sur** : https://github.com/new
2. **Nom** : `Kinjo_V1.2`
3. **Description** : `Plateforme d'énergie renouvelable - Connexion producteurs/consommateurs`
4. **Public ou Private** selon votre préférence
5. **NE PAS** cocher "Initialize with README", ".gitignore", ou "licence"
6. **Cliquez** sur "Create repository"

### 4. Exécuter les commandes Git manuellement

```cmd
REM Initialiser Git (si pas déjà fait)
git init

REM Configurer la branche principale
git branch -M main

REM Ajouter tous les fichiers
git add .

REM Créer le commit
git commit -m "Initial commit - Kinjo Energy Platform v1.2.0"

REM Ajouter le remote GitHub
git remote add origin https://github.com/dbourene/Kinjo_V1.2.git

REM Pousser vers GitHub
git push -u origin main

REM Créer un tag de version
git tag -a v1.2.0 -m "Version 1.2.0 - Production Ready"
git push origin v1.2.0
```

## 🔧 Alternative : Utiliser le Script Windows

Utilisez le fichier `PUSH_TO_GITHUB.bat` que je viens de créer :

```cmd
REM Exécuter le script Windows
PUSH_TO_GITHUB.bat
```

## ⚠️ Si Git n'est pas installé

Téléchargez et installez Git pour Windows :
- **URL** : https://git-scm.com/download/win
- **Installation** : Suivez l'assistant avec les options par défaut
- **Redémarrez** votre invite de commandes après installation

## 🆘 En cas d'erreur

### Erreur "git n'est pas reconnu"
```cmd
REM Vérifier l'installation de Git
git --version

REM Si erreur, ajouter Git au PATH ou réinstaller
```

### Erreur d'authentification GitHub
```cmd
REM Configurer vos identifiants Git
git config --global user.name "dbourene"
git config --global user.email "votre.email@example.com"
```

### Repository déjà existant
```cmd
REM Si le repository existe déjà, utiliser force push (ATTENTION)
git push -f origin main
```

## ✅ Vérification finale

Après le déploiement, vérifiez :
1. **Repository accessible** : https://github.com/dbourene/Kinjo_V1.2
2. **Fichiers présents** : src/, supabase/, package.json, etc.
3. **Commit visible** avec le bon message
4. **Tag v1.2.0** dans les releases

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Copiez-collez l'erreur exacte
2. Indiquez à quelle étape ça bloque
3. Je vous donnerai la solution spécifique !