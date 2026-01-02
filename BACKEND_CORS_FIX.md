# 🔧 Configuration Backend Railway - CORS Fix

## 🚨 Problème CORS

**Erreur :**
```
Access to XMLHttpRequest at 'https://authentic-intuition-production-ec05.up.railway.app/api/auth/login' 
from origin 'https://gressy-gestion-laiterie-projet.up.railway.app' 
has been blocked by CORS policy
```

## ✅ SOLUTION : Configurer CORS_ORIGIN dans Railway

### Railway Dashboard → Service Backend → Variables

Ajoute cette variable d'environnement :

```bash
CORS_ORIGIN=https://gressy-gestion-laiterie-projet.up.railway.app
```

⚠️ **IMPORTANT** : 
- Utilise l'URL EXACTE du frontend : `https://gressy-gestion-laiterie-projet.up.railway.app`
- PAS de `/` à la fin
- Si tu changes l'URL du frontend, mets à jour cette variable

### Alternative : Autoriser plusieurs origines

Si tu as plusieurs frontends (dev, staging, prod) :

```bash
CORS_ORIGIN=https://gressy-gestion-laiterie-projet.up.railway.app,http://localhost:3000
```

(Séparés par des virgules, sans espaces)

## 📋 Variables Backend Complètes

Voici TOUTES les variables à configurer dans **Railway Dashboard → Backend Service → Variables** :

### Environment
```bash
NODE_ENV=production
PORT=5000
```

### CORS - Frontend URL
```bash
CORS_ORIGIN=https://gressy-gestion-laiterie-projet.up.railway.app
```

### Database (Railway MySQL)
```bash
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_NAME=railway
DB_USER=<railway-mysql-user>
DB_PASSWORD=<railway-mysql-password>
```

💡 **Astuce** : Railway génère automatiquement les variables de database si tu utilises le service MySQL. Vérifie dans **MySQL Service → Variables**.

### JWT Secret
```bash
JWT_SECRET=<ton-secret-securise-genere>
```

💡 **Génère un secret fort** :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔍 Vérification du Code CORS

Le fichier `server/index.js` contient déjà la configuration CORS :

```javascript
const getCorsOrigin = () => {
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  return '*';
};

const corsOptions = {
  origin: getCorsOrigin(),
  credentials: true
};
app.use(cors(corsOptions));
```

✅ Le code est correct, il faut juste configurer la variable `CORS_ORIGIN` dans Railway.

## 🚀 Après Configuration

1. **Ajoute la variable** `CORS_ORIGIN` dans Railway Dashboard
2. **Redéploie le backend** (Railway le fait automatiquement après changement de variable)
3. **Attends 1-2 minutes** que le backend redémarre
4. **Teste à nouveau** le login depuis le frontend

## 🧪 Test CORS

Une fois le backend redéployé, teste avec curl :

```bash
curl -I -X OPTIONS \
  https://authentic-intuition-production-ec05.up.railway.app/api/auth/login \
  -H "Origin: https://gressy-gestion-laiterie-projet.up.railway.app" \
  -H "Access-Control-Request-Method: POST"
```

**Réponse attendue :**
```
HTTP/2 200
access-control-allow-origin: https://gressy-gestion-laiterie-projet.up.railway.app
access-control-allow-credentials: true
```

## ⚠️ Troubleshooting

### CORS ne fonctionne toujours pas

1. **Vérifie l'URL exacte du frontend** dans les logs Railway :
   ```
   Railway Dashboard → Frontend Service → Deployments → Domain
   ```
   Copie l'URL EXACTE et colle-la dans `CORS_ORIGIN`

2. **Vérifie les logs du backend** :
   ```
   Railway Dashboard → Backend Service → Deployments → View Logs
   ```
   Cherche des erreurs CORS ou de configuration

3. **Redéploie le backend manuellement** :
   ```
   Railway Dashboard → Backend Service → Deployments → ... → Redeploy
   ```

### L'URL du frontend a changé

Si Railway a changé l'URL du frontend de :
- `gressy-gestion-laiterie-production.up.railway.app`
- à `gressy-gestion-laiterie-projet.up.railway.app`

Alors il faut AUSSI mettre à jour :

1. **Frontend → Variables** :
   ```bash
   REACT_APP_API_URL=https://authentic-intuition-production-ec05.up.railway.app
   ```

2. **Backend → Variables** :
   ```bash
   CORS_ORIGIN=https://gressy-gestion-laiterie-projet.up.railway.app
   ```

## 📊 Checklist Backend

- [ ] Variable `CORS_ORIGIN` définie avec l'URL exacte du frontend
- [ ] Variable `NODE_ENV=production` définie
- [ ] Variables database (DB_HOST, DB_USER, DB_PASSWORD, etc.) définies
- [ ] Variable `JWT_SECRET` définie
- [ ] Backend redéployé après ajout des variables
- [ ] Logs backend ne montrent pas d'erreurs
- [ ] Test curl CORS retourne `access-control-allow-origin`

## 🎯 Résumé - 3 Étapes

1. **Railway Dashboard → Backend Service → Variables** → Ajoute :
   ```
   CORS_ORIGIN=https://gressy-gestion-laiterie-projet.up.railway.app
   ```

2. **Attends le redéploiement automatique** (1-2 minutes)

3. **Teste le login** depuis le frontend

C'est tout ! 🚀
