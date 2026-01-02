# 🚨 PROXY 502 ERROR - Solution Rapide

## Symptôme

```
OPTIONS /api/auth/login → 502 (556ms)
```

Frontend → Proxy Express → ❌ 502 → Backend

## 🔍 Diagnostic en 3 Étapes

### 1️⃣ Test Backend Direct

```bash
curl https://authentic-intuition-production-ec05.up.railway.app/api/health-check
```

**Si ça fonctionne :**
→ Backend OK, problème dans la config du proxy frontend

**Si 502 :**
→ Backend DOWN ou pas accessible

---

### 2️⃣ Vérifie Backend Status

```
Railway Dashboard → Backend Service
```

- Status = "Running" ? 
- Logs = "Server listening on..." ?
- Variables = DB_HOST, DB_USER, JWT_SECRET définies ?

---

### 3️⃣ Vérifie Frontend BACKEND_URL

```
Railway Dashboard → Frontend Service → Variables
```

Variable `BACKEND_URL` doit être :
```
https://authentic-intuition-production-ec05.up.railway.app
```

⚠️ **Exactement cette URL, sans `/` à la fin !**

---

## ✅ SOLUTIONS

### Solution A : Backend DOWN

**Si backend crashé :**

1. Backend Logs → Identifie l'erreur
2. Problème database ? → Configure DB_HOST, DB_USER, DB_PASSWORD
3. Problème JWT ? → Configure JWT_SECRET
4. Redéploie le backend

---

### Solution B : URL Backend Incorrecte

**Si backend fonctionne mais proxy 502 :**

1. Vérifie l'URL exacte : Backend Service → Settings → Networking
2. Copie l'URL publique
3. Frontend Service → Variables → `BACKEND_URL` → Colle l'URL
4. **Supprime le `/` final si présent !**
5. Redéploie frontend

---

### Solution C : Backend écoute sur localhost

**Si logs backend = "Server listening on localhost:5000" :**

Le backend doit écouter sur `0.0.0.0`, pas `localhost` !

Vérifie `server/index.js` :

```javascript
// ❌ MAL
app.listen(PORT);

// ✅ BON
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
```

---

## 🎯 Checklist Rapide

**Backend :**
- [ ] Status Railway = Running
- [ ] Logs = "Server listening on port X"
- [ ] `app.listen(PORT, '0.0.0.0')`
- [ ] Variables DB_* et JWT_SECRET définies
- [ ] Test curl direct fonctionne

**Frontend :**
- [ ] Variable `BACKEND_URL` définie
- [ ] URL exacte, sans `/` final
- [ ] Logs = "🔗 Backend API URL: https://..."

---

## 💡 Alternative : Désactiver Proxy

Si tu n'arrives pas à faire marcher le proxy, utilise les requêtes directes :

**Frontend `.env.production` :**
```bash
REACT_APP_API_URL=https://authentic-intuition-production-ec05.up.railway.app
```

**Backend Variables :**
```bash
CORS_ORIGIN=https://gressy-gestion-laiterie-projet.up.railway.app
```

Rebuild le frontend après changement `.env.production`.

---

## 📞 Infos à Partager

Pour diagnostic précis, partage :

1. **Backend Status** : Running ? Crashed ?
2. **Backend Logs** : 20 dernières lignes
3. **Frontend Variables** : Valeur de `BACKEND_URL`
4. **Test curl** : Résultat de la commande ci-dessus
5. **Frontend Logs** : Logs quand tu essaies de te connecter
