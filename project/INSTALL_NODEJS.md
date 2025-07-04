# 🚀 Installation Node.js sur Windows

## Méthode 1 : Installation officielle (Recommandée)

### 1. Télécharger Node.js
- Allez sur : https://nodejs.org/
- Cliquez sur **"Download Node.js (LTS)"** (version recommandée)
- Choisissez **"Windows Installer (.msi)"** pour votre architecture (64-bit ou 32-bit)

### 2. Installer Node.js
- Double-cliquez sur le fichier `.msi` téléchargé
- Suivez l'assistant d'installation :
  - ✅ Acceptez les termes de licence
  - ✅ Gardez le chemin d'installation par défaut
  - ✅ **IMPORTANT** : Cochez "Add to PATH" (ajouter au PATH)
  - ✅ Cochez "Install npm package manager"

### 3. Vérifier l'installation
Ouvrez une **nouvelle** invite de commande (cmd) et tapez :
```cmd
node --version
npm --version
```

Si vous voyez des numéros de version, c'est installé ! 🎉

## Méthode 2 : Via Chocolatey (Alternative)

Si vous avez Chocolatey installé :
```cmd
choco install nodejs
```

## Méthode 3 : Via winget (Windows 10/11)

```cmd
winget install OpenJS.NodeJS
```

## ⚠️ Important après installation

1. **Fermez toutes les fenêtres de commande ouvertes**
2. **Ouvrez une nouvelle invite de commande**
3. **Naviguez vers votre projet** :
```cmd
cd C:\Users\cdbou\Documents\hello_real\kinjo\20250606_project-bolt-sb1-baembaby\20250606_Kinjo_V1
```

4. **Testez npm** :
```cmd
npm --version
```

5. **Installez les dépendances** :
```cmd
npm install
```

6. **Lancez l'application** :
```cmd
npm run dev
```

## 🔧 Si ça ne marche toujours pas

### Vérifier le PATH
```cmd
echo %PATH%
```
Vous devriez voir quelque chose comme `C:\Program Files\nodejs\` dans la liste.

### Redémarrer l'ordinateur
Parfois nécessaire pour que les variables d'environnement soient prises en compte.

### Réinstaller en mode administrateur
- Clic droit sur l'installateur → "Exécuter en tant qu'administrateur"