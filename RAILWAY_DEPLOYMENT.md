# 🚂 Guide de Déploiement sur Railway

**Projet**: Gressy Gestion Laiterie  
**Plateforme**: Railway.app  
**Date**: 2 Janvier 2026

---

## 📋 Prérequis

1. Compte Railway.app (gratuit)
2. Code sur GitHub
3. Railway CLI (optionnel)

---

## 🚀 Méthode 1: Déploiement via Dashboard (Recommandé)

### Étape 1: Créer un Nouveau Projet

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous / Créez un compte
3. Cliquez sur **"New Project"**
4. Sélectionnez **"Deploy from GitHub repo"**
5. Autorisez Railway à accéder à vos repos
6. Sélectionnez `BlazeRUMARIZA/gressy-gestion-laiterie`

### Étape 2: Configurer la Base de Données MySQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add MySQL"**
3. Railway créera automatiquement une base de données
4. Notez les variables d'environnement générées:
   - `MYSQL_URL`
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### Étape 3: Configurer les Variables d'Environnement

Dans le service **server**, allez dans l'onglet **"Variables"**:

```env
# Application
NODE_ENV=production
PORT=5000

# JWT Configuration (GÉNÉRER UN NOUVEAU!)
JWT_SECRET=<GÉNÉRER_AVEC_COMMANDE_CI-DESSOUS>
JWT_EXPIRE=7d

# Database (Utiliser les valeurs de Railway MySQL)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}

# CORS (Mettre votre domaine Railway)
CORS_ORIGIN=https://votre-app.up.railway.app
```

### Étape 4: Générer JWT_SECRET

Sur votre machine locale:
```bash
openssl rand -base64 32
```

Copiez le résultat dans la variable `JWT_SECRET` sur Railway.

### Étape 5: Configurer le Déploiement

1. **Settings** → **Deploy**
2. **Root Directory**: Laisser vide (ou mettre `/`)
3. **Build Command**: `npm install --prefix server`
4. **Start Command**: `node server/index.js`

Ou créer un `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Étape 6: Déployer

1. Railway détectera automatiquement les changements
2. Le déploiement se lance automatiquement
3. Surveillez les logs dans l'onglet **"Deployments"**

---

## 🚀 Méthode 2: Déploiement via Railway CLI

### Installation Railway CLI

```bash
# NPM
npm install -g @railway/cli

# Homebrew (Mac)
brew install railway

# Ou télécharger depuis https://railway.app/cli
```

### Connexion

```bash
railway login
```

### Initialiser le Projet

```bash
cd /home/rumariza/Documents/gressy-gestion-laiterie
railway init
```

### Créer MySQL

```bash
railway add --plugin mysql
```

### Configurer Variables d'Environnement

```bash
# Générer JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

# Définir les variables
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRE=7d

# Les variables MySQL sont automatiques avec le plugin
```

### Déployer

```bash
railway up
```

---

## 📝 Configuration Spécifique Railway

### 1. Créer `railway.json` (Racine du Projet)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --prefix server && npm install --prefix client && npm run build --prefix client"
  },
  "deploy": {
    "startCommand": "node server/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health-check",
    "healthcheckTimeout": 100
  }
}
```

### 2. Créer `nixpacks.toml` (Racine du Projet)

```toml
[phases.setup]
nixPkgs = ['nodejs-18_x']

[phases.install]
cmds = [
  'npm install --prefix server',
  'npm install --prefix client'
]

[phases.build]
cmds = ['npm run build --prefix client']

[start]
cmd = 'node server/index.js'
```

### 3. Modifier `package.json` du Serveur

```json
{
  "name": "gressy-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## 🔧 Configuration Base de Données Railway

Railway fournit automatiquement ces variables pour MySQL:

```javascript
// server/config/database.js - Adapter pour Railway

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Railway fournit MYSQL_URL ou variables individuelles
const pool = mysql.createPool(
  process.env.MYSQL_URL || {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'dairy_management',
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }
);

module.exports = { pool, initialize };
```

---

## 🌐 Configurer le Frontend

### Option A: Servir depuis le Backend (Recommandé)

Le backend sert déjà les fichiers statiques dans `server/index.js`:

```javascript
// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
}
```

**Build du client**:
```bash
# Avant déploiement, build le client
cd client
npm run build

# Copier dans server/public
cp -r build ../server/public
```

### Option B: Déployer Frontend Séparément

1. Créer un nouveau service Railway
2. Déployer le dossier `client/`
3. Build automatique avec Vite
4. Configurer `VITE_API_URL` pointant vers le backend

---

## 📊 Variables d'Environnement Complètes

### Backend Service (server)

```env
# Application
NODE_ENV=production
PORT=5000

# JWT
JWT_SECRET=<GÉNÉRÉ_AVEC_OPENSSL>
JWT_EXPIRE=7d

# Database (Auto depuis Railway MySQL)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}

# CORS
CORS_ORIGIN=${{RAILWAY_STATIC_URL}}

# Optional: Si vous utilisez MYSQL_URL
MYSQL_URL=${{MySQL.MYSQL_URL}}
```

### Frontend Service (client) - Si séparé

```env
VITE_API_URL=${{server.RAILWAY_STATIC_URL}}
```

---

## 🔒 Sécurité sur Railway

### 1. Secrets Manager

Utilisez les variables Railway au lieu de `.env`:
- Jamais commiter `.env`
- Toutes les variables dans Railway Dashboard
- Rotation des secrets régulière

### 2. Private Networking

```bash
# Activer Private Networking pour MySQL
# Dashboard → MySQL Service → Settings → Enable Private Network
```

Ensuite utiliser `${{MySQL.PRIVATE_URL}}` au lieu de l'URL publique.

### 3. Custom Domain + HTTPS

1. **Settings** → **Networking**
2. **Custom Domain** → Ajouter votre domaine
3. Railway configure automatiquement HTTPS

---

## 🧪 Tester le Déploiement

### 1. Health Check

```bash
curl https://votre-app.up.railway.app/api/health-check
```

### 2. Login Test

```bash
curl -X POST https://votre-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Vérifier Logs

```bash
# Via CLI
railway logs

# Ou dans Dashboard → Deployments → View Logs
```

---

## 🐛 Troubleshooting

### Erreur: "Cannot connect to database"

**Solution 1**: Vérifier variables DB
```bash
railway variables
```

**Solution 2**: Attendre que MySQL soit prêt
```javascript
// Ajouter retry logic dans database.js
const connectWithRetry = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connected');
      return;
    } catch (err) {
      console.log(`Retry ${i + 1}/${retries}...`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  throw new Error('Failed to connect to database');
};
```

### Erreur: "Module not found"

**Solution**: Vérifier `buildCommand`
```json
{
  "build": {
    "buildCommand": "npm install --prefix server"
  }
}
```

### Erreur: "Port already in use"

**Solution**: Railway assigne automatiquement le port via `$PORT`
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Erreur: "CORS blocked"

**Solution**: Mettre à jour CORS_ORIGIN
```bash
railway variables set CORS_ORIGIN="https://votre-app.up.railway.app"
```

---

## 💰 Coûts Railway

### Plan Gratuit
- $5 de crédit gratuit/mois
- Parfait pour développement/staging
- Sleeps après 24h d'inactivité

### Plan Hobby ($5/mois)
- $5 de crédit + $5/mois inclus
- Pas de sleep
- Parfait pour petits projets

### Plan Pro ($20/mois)
- $20 de crédit/mois
- Support prioritaire
- Pour production

**Estimation coût projet**:
- Backend: ~$3-5/mois
- MySQL: ~$2-3/mois
- **Total: ~$5-8/mois**

---

## 📋 Checklist Déploiement Railway

### Préparation
- [ ] Code pushé sur GitHub
- [ ] Compte Railway créé
- [ ] JWT_SECRET généré

### Configuration Railway
- [ ] Projet Railway créé
- [ ] MySQL ajouté
- [ ] Variables d'environnement configurées
- [ ] Build command configuré
- [ ] Start command configuré

### Déploiement
- [ ] Premier déploiement lancé
- [ ] Logs vérifiés (pas d'erreur)
- [ ] Health check fonctionne
- [ ] Login fonctionne
- [ ] Base de données accessible

### Post-Déploiement
- [ ] Changer mot de passe admin
- [ ] Configurer custom domain (optionnel)
- [ ] Activer Private Networking
- [ ] Configurer monitoring
- [ ] Backup base de données

---

## 🚀 Commandes Railway Utiles

```bash
# Voir logs en temps réel
railway logs -f

# Ouvrir le projet dans le navigateur
railway open

# Voir toutes les variables
railway variables

# Définir une variable
railway variables set KEY=value

# Supprimer une variable
railway variables delete KEY

# Se connecter à MySQL
railway connect mysql

# Redéployer
railway up --detach

# Voir le status
railway status

# Lier à un projet existant
railway link
```

---

## 📚 Ressources

- [Documentation Railway](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Examples](https://github.com/railwayapp/examples)
- [Railway Discord](https://discord.gg/railway)

---

## ✅ Résumé

1. **Créer projet Railway** depuis GitHub
2. **Ajouter MySQL** database
3. **Configurer variables** d'environnement
4. **Générer JWT_SECRET** sécurisé
5. **Déployer** et vérifier logs
6. **Tester** les endpoints
7. **Configurer** custom domain (optionnel)

**C'est tout ! Votre application est en production ! 🎉**

---

**Temps estimé**: 15-30 minutes  
**Difficulté**: ⭐⭐ (Facile)  
**Coût**: ~$5-8/mois
