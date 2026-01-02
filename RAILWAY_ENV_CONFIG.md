# 🚀 Configuration Railway - Variables d'Environnement

## Service Frontend (React)
**URL:** https://gressy-gestion-laiterie-production.up.railway.app/

### Variables à configurer dans Railway Dashboard:
```bash
# Build
CI=false
NODE_ENV=production
GENERATE_SOURCEMAP=false

# Backend API Connection
REACT_APP_API_URL=https://authentic-intuition-production-ec05.up.railway.app
```

## Service Backend (Node.js API)
**URL:** https://authentic-intuition-production-ec05.up.railway.app/

### Variables à configurer dans Railway Dashboard:
```bash
# Environment
NODE_ENV=production
PORT=5000

# Frontend CORS
FRONTEND_URL=https://gressy-gestion-laiterie-production.up.railway.app

# Database (si MySQL Railway)
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>

# JWT Secret
JWT_SECRET=<votre-secret-securise>
```

## 📋 Étapes de Configuration Railway

### 1. Service Frontend
1. Aller dans **Railway Dashboard → Frontend Service → Variables**
2. Ajouter chaque variable une par une :
   - `CI` = `false`
   - `NODE_ENV` = `production`
   - `GENERATE_SOURCEMAP` = `false`
   - `REACT_APP_API_URL` = `https://authentic-intuition-production-ec05.up.railway.app`

### 2. Service Backend
1. Aller dans **Railway Dashboard → Backend Service → Variables**
2. Ajouter chaque variable une par une :
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `FRONTEND_URL` = `https://gressy-gestion-laiterie-production.up.railway.app`
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (depuis Railway MySQL)
   - `JWT_SECRET` (générer un secret fort)

### 3. Vérification
- ✅ Frontend health check: https://gressy-gestion-laiterie-production.up.railway.app/health
- ✅ Backend health check: https://authentic-intuition-production-ec05.up.railway.app/api/health (ou /health)

## 🔗 Architecture des Services

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (React + Express Proxy)                              │
│  https://gressy-gestion-laiterie-production.up.railway.app/   │
│                                                                 │
│  Routes:                                                        │
│  - / → React SPA                                               │
│  - /health → Frontend health check                             │
│  - /api/* → Proxy vers Backend                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    (Proxy /api/*)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Backend (Node.js + Express API)                               │
│  https://authentic-intuition-production-ec05.up.railway.app/   │
│                                                                 │
│  Routes:                                                        │
│  - /api/auth/* → Authentication                                │
│  - /api/cows/* → Cows management                               │
│  - /api/milk/* → Milk production                               │
│  - /api/feed/* → Feed records                                  │
│  - /api/health/* → Health records                              │
│  - /api/dashboard/* → Dashboard stats                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    (Database Connection)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  MySQL Database (Railway)                                       │
│  Tables: users, cows, milk_production, feed_records, etc.      │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 CORS Configuration (Backend)

Dans le fichier `server/index.js`, assure-toi que le CORS est configuré :

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## 🧪 Tests Post-Déploiement

1. **Frontend accessible** : Ouvrir https://gressy-gestion-laiterie-production.up.railway.app/
2. **Health check frontend** : `curl https://gressy-gestion-laiterie-production.up.railway.app/health`
3. **Health check backend** : `curl https://authentic-intuition-production-ec05.up.railway.app/api/health`
4. **Test login** : Essayer de se connecter depuis le frontend
5. **Vérifier logs** : Railway Dashboard → Logs pour chaque service

## ⚠️ Troubleshooting

### Frontend 502 Error
- Vérifier que `server.js` démarre correctement dans les logs
- Vérifier que le health check `/health` répond
- Vérifier Root Directory = `/client` dans Settings

### Backend 502 Error
- Vérifier que le serveur écoute sur `0.0.0.0` et non `localhost`
- Vérifier la variable `PORT` dans Railway
- Vérifier les connexions à la base de données

### CORS Errors
- Vérifier `FRONTEND_URL` dans le backend
- Vérifier que le backend a `cors` configuré correctement
- Vérifier que les requêtes passent par `/api/*` (proxy)

## 📝 Notes Importantes

1. **Pas de trailing slash** : Les URLs ne doivent PAS avoir de `/` à la fin dans les variables
2. **HTTPS obligatoire** : Railway utilise HTTPS par défaut
3. **Health checks** : Timeout de 100 secondes configuré dans `railway.json`
4. **Proxy automatique** : Toutes les requêtes `/api/*` du frontend sont automatiquement proxiées vers le backend
