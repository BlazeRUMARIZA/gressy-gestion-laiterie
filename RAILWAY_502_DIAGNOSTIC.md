# 🚨 DIAGNOSTIC RAILWAY 502 - GUIDE COMPLET

## État Actuel

### Symptômes
- ✅ Serveur démarre: "Server is running on port 8080"
- ❌ Railway arrête le container: "Stopping Container"
- ❌ Erreurs 502 Bad Gateway persistantes
- ❌ Health check ne fonctionne pas correctement

### Architecture Actuelle
```
client/
├── server.js           ✅ (Express avec /health)
├── package.json        ✅ (sans serve)
├── nixpacks.toml       ✅ (node server.js)
├── railway.json        ✅ (healthcheckPath: /health)
└── Procfile           ✅ (web: node server.js)
```

## 🔍 Causes Possibles

### 1. Railway ne détecte pas le health check
- Configuration railway.json pas reconnue
- Health check timeout trop court
- Port binding issue

### 2. Fichier build/ manquant
- npm run build échoue
- Dossier build vide
- Express ne trouve pas les fichiers statiques

### 3. Configuration Railway Dashboard
- Health check path non configuré dans l'UI
- Root Directory incorrect
- Variables d'environnement manquantes

## ✅ SOLUTIONS À APPLIQUER

### Solution 1: Vérifier Railway Dashboard

#### Dans Railway Dashboard → Service Frontend → Settings:

**A. Deploy Settings:**
```
Root Directory: /client
Builder: Nixpacks
```

**B. Health Check (si disponible dans UI):**
```
Health Check Path: /health
Health Check Timeout: 100
Health Check Interval: 10
```

**C. Variables:**
```
NODE_ENV=production
PORT=${{PORT}}
REACT_APP_API_URL=https://[backend-url].up.railway.app/api
```

### Solution 2: Forcer un Rebuild Complet

1. Railway Dashboard → Service Frontend
2. Settings → General
3. Tout en bas → **"Delete Service"** puis recréer OU
4. Deployments → **"Redeploy"** (bouton ...)

### Solution 3: Simplifier server.js (plus robuste)

Remplacer le contenu actuel par une version ultra-simple qui log tout:

```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check - MUST be first
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Another health check variant
app.get('/healthz', (req, res) => {
  console.log('Healthz check called');
  res.status(200).send('OK');
});

// Root health check
app.get('/api/health', (req, res) => {
  console.log('API Health check called');
  res.status(200).json({ status: 'healthy' });
});

// Serve static files
const buildPath = path.join(__dirname, 'build');
console.log('Build path:', buildPath);

app.use(express.static(buildPath, {
  maxAge: '1d',
  etag: true,
  index: false // Important: don't auto-serve index.html
}));

// SPA routing - catch all
app.get('*', (req, res) => {
  console.log('Serving index.html for:', req.path);
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('✅ Server is running on port', PORT);
  console.log('🌐 Access at: http://localhost:' + PORT);
  console.log('🏥 Health check: http://localhost:' + PORT + '/health');
  console.log('📁 Build path:', buildPath);
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

### Solution 4: Configuration Railway.json Alternative

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

(Retirer healthcheckPath si Railway ne le supporte pas via JSON)

### Solution 5: Utiliser un server.js minimal sans framework

Si Express pose problème, version ultra-minimale avec http natif:

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const buildDir = path.join(__dirname, 'build');

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Health checks
  if (req.url === '/health' || req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  
  // Serve index.html for all routes
  const indexPath = path.join(buildDir, 'index.html');
  fs.readFile(indexPath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading index.html');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
```

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Étape 1: Vérifier Railway Dashboard
1. Root Directory = `/client` (PAS `/client/src`)
2. Builder = `Nixpacks`
3. Aucune variable ne force un autre port

### Étape 2: Vérifier les Logs Railway
Chercher dans les logs:
- ❌ "ENOENT: no such file 'build/index.html'" → build folder manquant
- ❌ "Error: listen EADDRINUSE" → Port déjà utilisé
- ❌ "MODULE_NOT_FOUND" → Problème de dépendances
- ✅ "Server is running" → Bon signe mais pas suffisant

### Étape 3: Rebuild avec Logs Verbeux
Mettre à jour nixpacks.toml:
```toml
[phases.build]
cmds = ['npm run build', 'ls -la build/']

[start]
cmd = 'node server.js'
```

### Étape 4: Test Local
Avant de push:
```bash
cd client
npm run build
node server.js
# Dans un autre terminal:
curl http://localhost:3000/health
curl http://localhost:3000/
```

### Étape 5: Alternative - Déployer Frontend Statique Séparément
Si tout échoue, utiliser Vercel ou Netlify pour le frontend:
- Vercel/Netlify s'occupent du serving
- Configuration automatique
- Moins de problèmes qu'avec Railway + Express

## 📞 SUPPORT

Si aucune solution ne fonctionne:

1. **Partager les logs complets** de Railway (Build + Deploy)
2. **Vérifier** que le dossier `build/` est créé pendant le build
3. **Tester** avec un simple `index.html` statique d'abord
4. **Considérer** une alternative comme Vercel pour le frontend

## 🔄 CHECKLIST FINALE

- [ ] Root Directory = `/client` dans Railway
- [ ] Builder = `Nixpacks`
- [ ] `npm run build` réussit localement
- [ ] Dossier `build/` contient des fichiers
- [ ] `node server.js` fonctionne localement
- [ ] `/health` retourne 200 OK localement
- [ ] Pas de SIGTERM dans les logs après "Server running"
- [ ] Variables d'environnement correctes
- [ ] Aucun conflit de port

---

**Date:** 2026-01-02
**Statut:** En diagnostic
**Prochaine étape:** Appliquer Solution 3 (server.js robuste) + rebuild
