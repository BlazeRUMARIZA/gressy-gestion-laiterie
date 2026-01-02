# 🚀 CONFIGURATION RAILWAY - 2 SERVICES

## 📋 ARCHITECTURE

```
Railway Project
├── Service 1: Backend (Node.js API)
│   └── Root path: /server
├── Service 2: Frontend (React Static)
│   └── Root path: /client
└── Database: MySQL
```

---

## 🔧 ÉTAPE 1: CRÉER LE PROJET RAILWAY

### Dans Railway Dashboard:

1. **New Project** → **Deploy from GitHub repo**
2. Sélectionner votre repo: `gressy-gestion-laiterie`
3. Ne pas déployer tout de suite, cliquer sur **Cancel**

---

## 🗄️ ÉTAPE 2: AJOUTER LA BASE DE DONNÉES

### Dans le projet Railway:

1. **New** → **Database** → **Add MySQL**
2. Attendre la création (1-2 min)
3. Noter les variables générées automatiquement:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

---

## 🔙 ÉTAPE 3: DÉPLOYER LE BACKEND

### 3.1 Créer le service

1. **New** → **GitHub Repo**
2. Sélectionner: `gressy-gestion-laiterie`
3. Railway va créer un service

### 3.2 Configurer le Root Directory

1. Cliquer sur le service créé
2. **Settings** → **Root Directory**
3. Changer de `/` à `/server`
4. **Save**

### 3.3 Ajouter les variables d'environnement

Dans **Variables**:

```bash
# PORT (automatique Railway)
PORT=${{PORT}}

# JWT Configuration
JWT_SECRET=<générer avec: openssl rand -base64 32>
JWT_EXPIRE=7d

# Database (référence au service MySQL)
MYSQL_HOST=${{MySQL.MYSQLHOST}}
MYSQL_PORT=${{MySQL.MYSQLPORT}}
MYSQL_DATABASE=${{MySQL.MYSQLDATABASE}}
MYSQL_USER=${{MySQL.MYSQLUSER}}
MYSQL_PASSWORD=${{MySQL.MYSQLPASSWORD}}

# CORS
CORS_ORIGIN=${{RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

### 3.4 Générer le JWT_SECRET

```bash
openssl rand -base64 32
```

Copier le résultat et le mettre dans `JWT_SECRET`

### 3.5 Variables avancées

Railway remplace automatiquement:
- `${{MySQL.VARIABLE}}` → référence au service MySQL
- `${{RAILWAY_PUBLIC_DOMAIN}}` → votre domaine généré

---

## 🎨 ÉTAPE 4: DÉPLOYER LE FRONTEND

### 4.1 Créer le deuxième service

1. **New** → **GitHub Repo**
2. Sélectionner à nouveau: `gressy-gestion-laiterie`
3. Railway va créer un autre service

### 4.2 Configurer le Root Directory

1. Cliquer sur ce nouveau service
2. **Settings** → **Root Directory**
3. Changer de `/` à `/client`
4. **Save**

### 4.3 Ajouter les variables d'environnement

Dans **Variables** du service frontend:

```bash
# API Backend URL (référence au service backend)
REACT_APP_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api

# Build configuration
CI=false
NODE_ENV=production
```

**Important**: Remplacer `Backend` par le nom exact de votre service backend dans Railway

### 4.4 Renommer les services (recommandé)

Pour éviter la confusion:
1. Service 1 → Renommer en **backend-api**
2. Service 2 → Renommer en **frontend-react**

Cliquer sur **Settings** → **Service Name**

---

## 🔗 ÉTAPE 5: LIER LES SERVICES

### Dans le Frontend, mettre à jour REACT_APP_API_URL:

```bash
REACT_APP_API_URL=https://${{backend-api.RAILWAY_PUBLIC_DOMAIN}}/api
```

Cette syntaxe crée une référence dynamique au backend.

### Dans le Backend, mettre à jour CORS_ORIGIN:

```bash
CORS_ORIGIN=https://${{frontend-react.RAILWAY_PUBLIC_DOMAIN}}
```

---

## 🚀 ÉTAPE 6: DÉPLOIEMENT

### Railway déploie automatiquement, mais vous pouvez forcer:

1. **Deployments** → **Redeploy**
2. Surveiller les logs en temps réel

### Ordre de déploiement recommandé:

1. ✅ MySQL (déjà créé)
2. ✅ Backend (attend que MySQL soit prêt)
3. ✅ Frontend (attend que Backend soit prêt)

---

## 📊 ÉTAPE 7: VÉRIFICATION

### 7.1 Vérifier le Backend

```bash
curl https://votre-backend.up.railway.app/api/health-check
```

**Réponse attendue:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "Connected"
}
```

### 7.2 Vérifier le Frontend

```bash
curl https://votre-frontend.up.railway.app
```

Devrait retourner le HTML de votre app React.

### 7.3 Tester l'authentification

```bash
curl -X POST https://votre-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 🔍 LOGS ET DEBUGGING

### Voir les logs en temps réel:

1. Cliquer sur le service (backend ou frontend)
2. **Deployments** → Cliquer sur le dernier déploiement
3. **View Logs**

### Logs Backend importants:

```
✅ Server running on port 5000
✅ Database connected successfully
✅ MySQL Connection Pool Ready
```

### Logs Frontend importants:

```
✅ Build complete
✅ Serving static files from /build
```

---

## 🌐 DOMAINES PERSONNALISÉS (OPTIONNEL)

### Pour chaque service:

1. **Settings** → **Domains**
2. **Custom Domain** → Ajouter votre domaine
3. Configurer les DNS:
   - Type: `CNAME`
   - Name: `api` (pour backend) ou `app` (pour frontend)
   - Value: `votre-service.up.railway.app`

Exemple:
- Backend: `api.votredomaine.com`
- Frontend: `app.votredomaine.com`

---

## 🔄 DÉPLOIEMENT CONTINU

Railway redéploie automatiquement à chaque push sur `main`.

### Pour désactiver:

**Settings** → **Deploy Triggers** → Désactiver si nécessaire

---

## 📝 RÉSUMÉ DES FICHIERS CRÉÉS

### Backend (`/server`):
- ✅ `railway.json` - Configuration Railway
- ✅ `nixpacks.toml` - Configuration build
- ✅ `Procfile` - Commande de démarrage

### Frontend (`/client`):
- ✅ `railway.json` - Configuration Railway
- ✅ `nixpacks.toml` - Configuration build
- ✅ `Procfile` - Commande de démarrage
- ✅ `.env.production` - Variables d'environnement

---

## ⚠️ TROUBLESHOOTING COMMUN

### Backend ne se connecte pas à MySQL:

```bash
# Vérifier les variables d'environnement
# Dans Railway Dashboard → Service Backend → Variables
# Vérifier que les variables MySQL sont correctement référencées
```

### Frontend ne peut pas contacter le Backend:

```bash
# Vérifier REACT_APP_API_URL dans les variables du frontend
# Doit pointer vers: https://backend-api.up.railway.app/api
# Vérifier CORS_ORIGIN dans les variables du backend
```

### Build frontend échoue:

```bash
# Logs typiques:
# "Treating warnings as errors because process.env.CI = true"
# Solution: Vérifier que CI=false dans les variables du frontend
```

### "Cannot find module" error:

```bash
# Vérifier Root Directory:
# Backend → doit être /server
# Frontend → doit être /client
```

---

## 🎯 CHECKLIST FINALE

### Backend:
- [ ] Root Directory = `/server`
- [ ] `JWT_SECRET` configuré
- [ ] Variables MySQL référencées
- [ ] `CORS_ORIGIN` configuré
- [ ] Health check répond

### Frontend:
- [ ] Root Directory = `/client`
- [ ] `REACT_APP_API_URL` référence le backend
- [ ] `CI=false` configuré
- [ ] Build successful
- [ ] App accessible

### Base de données:
- [ ] MySQL service créé
- [ ] Variables exposées
- [ ] Backend connecté

---

## 🚀 COMMANDES RAPIDES

### Push et déployer:

```bash
git add .
git commit -m "feat: Railway deployment configuration"
git push origin main
```

Railway déploie automatiquement.

### Rollback si problème:

Dans Railway → **Deployments** → Trouver un déploiement qui marche → **Redeploy**

---

## 📞 SUPPORT

- Documentation Railway: https://docs.railway.app
- Community Discord: https://discord.gg/railway

---

**✅ Vous êtes maintenant prêt pour un déploiement Railway en 2 services !**
