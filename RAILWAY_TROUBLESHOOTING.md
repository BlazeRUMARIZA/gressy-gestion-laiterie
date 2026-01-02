# 🔧 Dépannage Railway - Gressy Gestion Laiterie

## ❌ Erreur: "Cannot find module '/app/server/index.js'"

### Problème
Railway ne trouve pas le fichier `server/index.js` car il cherche à la racine.

### ✅ Solution Appliquée

**Fichiers modifiés**:

1. **railway.json** - Commande de démarrage corrigée:
```json
{
  "deploy": {
    "startCommand": "cd server && npm install && node index.js"
  }
}
```

2. **nixpacks.toml** - Configuration simplifiée:
```toml
[phases.install]
cmds = ['cd server && npm install']

[start]
cmd = 'cd server && node index.js'
```

3. **Procfile** - Créé pour compatibilité:
```
web: cd server && node index.js
```

### 🚀 Redéployer

```bash
git add .
git commit -m "Fix: Railway deployment path"
git push origin main
```

Railway redéploiera automatiquement.

---

## 🐛 Autres Erreurs Courantes

### 1. "Error: connect ECONNREFUSED" (Base de données)

**Cause**: MySQL pas encore prêt ou variables mal configurées

**Solution**:
```bash
# Vérifier les variables dans Railway Dashboard
Railway → Variables → Vérifier:
- DB_HOST ou MYSQL_HOST
- DB_USER ou MYSQL_USER
- DB_PASSWORD ou MYSQL_PASSWORD
- DB_NAME ou MYSQL_DATABASE
```

La fonction `connectWithRetry()` dans `database.js` devrait gérer ce cas.

### 2. "Invalid token" / JWT Errors

**Cause**: `JWT_SECRET` non défini

**Solution**:
```bash
# Générer un nouveau secret
openssl rand -base64 32

# Ajouter dans Railway
Railway Dashboard → Variables → JWT_SECRET=<valeur_générée>
```

### 3. "CORS blocked"

**Cause**: `CORS_ORIGIN` mal configuré

**Solution**:
```bash
# Dans Railway Dashboard → Variables
CORS_ORIGIN=${{RAILWAY_STATIC_URL}}

# Ou manuellement
CORS_ORIGIN=https://votre-app.up.railway.app
```

### 4. "Module not found" (packages npm)

**Cause**: `package.json` dans mauvais dossier

**Solution**:
```bash
# Vérifier que server/package.json existe
ls -la server/package.json

# Si manquant, créer:
cd server
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv express-validator
```

### 5. "Port already in use"

**Cause**: Railway assigne dynamiquement le port

**Solution**: Le code utilise déjà `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

✅ **Déjà correct dans le code**

---

## 📊 Vérifier les Logs Railway

### Via Dashboard
1. Railway Dashboard
2. Sélectionner votre service
3. Onglet **"Deployments"**
4. Cliquer sur le dernier déploiement
5. **"View Logs"**

### Via CLI
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Lier au projet
railway link

# Voir logs en temps réel
railway logs -f
```

---

## ✅ Checklist de Débogage

- [ ] Variables d'environnement configurées (JWT_SECRET, DB_*, etc.)
- [ ] MySQL Database ajouté dans Railway
- [ ] `server/package.json` existe avec toutes les dépendances
- [ ] `server/index.js` existe
- [ ] Logs Railway vérifiés (pas d'erreur de build)
- [ ] Health check accessible: `/api/health-check`
- [ ] Attendre 2-3 minutes que MySQL soit complètement prêt

---

## 🆘 Commandes de Diagnostic

```bash
# 1. Vérifier structure projet
ls -la server/
ls -la server/package.json
ls -la server/index.js

# 2. Tester localement d'abord
cd server
npm install
node index.js

# 3. Vérifier les logs Railway
railway logs --tail 100

# 4. Redéployer manuellement
railway up --detach

# 5. Se connecter à MySQL Railway
railway connect mysql
```

---

## 📝 Variables Requises Railway

```env
# OBLIGATOIRES
JWT_SECRET=<généré_avec_openssl>
NODE_ENV=production

# AUTO depuis MySQL (si plugin Railway MySQL installé)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}

# OPTIONNELLES
JWT_EXPIRE=7d
PORT=5000 (Railway assigne automatiquement)
CORS_ORIGIN=${{RAILWAY_STATIC_URL}}
```

---

## 🔄 Processus de Redéploiement

1. **Faire les changements** localement
2. **Commiter**:
   ```bash
   git add .
   git commit -m "Fix: description du fix"
   git push origin main
   ```
3. **Railway redéploie automatiquement** en 2-5 minutes
4. **Vérifier logs** pendant le déploiement
5. **Tester** le health check

---

## 📞 Support

Si le problème persiste:

1. **Vérifier les logs Railway** en détail
2. **Tester localement** avec Docker:
   ```bash
   docker-compose up -d
   ```
3. **Consulter la documentation**:
   - `RAILWAY_DEPLOYMENT.md`
   - `RAILWAY_QUICKSTART.md`
4. **Railway Discord**: https://discord.gg/railway

---

## ✅ État Actuel (Post-Fix)

**Fichiers modifiés**:
- ✅ `railway.json` - Chemin corrigé
- ✅ `nixpacks.toml` - Configuration simplifiée
- ✅ `Procfile` - Créé
- ✅ Ce guide de dépannage

**Prochaine étape**: Pusher sur GitHub et Railway redéploiera automatiquement.
