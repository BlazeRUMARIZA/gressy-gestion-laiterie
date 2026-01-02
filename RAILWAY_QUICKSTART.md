# ⚡ Déploiement Railway - Guide Rapide

**Temps estimé**: 10 minutes ⏱️

---

## 🚀 Étapes Rapides

### 1. Préparer Localement (2 min)

```bash
cd /home/rumariza/Documents/gressy-gestion-laiterie

# Exécuter le script de préparation
./prepare-railway.sh

# Copier le JWT_SECRET affiché
```

### 2. Pousser sur GitHub (1 min)

```bash
git add .
git commit -m "Préparation déploiement Railway"
git push origin main
```

### 3. Créer Projet Railway (3 min)

1. Aller sur https://railway.app/new
2. **"Deploy from GitHub repo"**
3. Sélectionner `BlazeRUMARIZA/gressy-gestion-laiterie`
4. Railway commence le déploiement automatiquement

### 4. Ajouter MySQL (1 min)

1. Dans votre projet Railway: **"+ New"**
2. **"Database"** → **"Add MySQL"**
3. Attendre que MySQL soit prêt (icône verte)

### 5. Configurer Variables (2 min)

Dans le service **server** → **Variables**:

```env
JWT_SECRET=<COLLER_LE_SECRET_DU_SCRIPT>
JWT_EXPIRE=7d
CORS_ORIGIN=${{RAILWAY_STATIC_URL}}
```

Les variables DB sont **automatiques** grâce à Railway !

### 6. Redéployer (1 min)

1. **Deployments** → **View Logs**
2. Attendre que le déploiement se termine
3. Vérifier qu'il n'y a pas d'erreurs

### 7. Tester (1 min)

```bash
# Copier l'URL de votre app (ex: https://xyz.up.railway.app)
curl https://votre-app.up.railway.app/api/health-check
```

**Résultat attendu**: `{"status":"OK","message":"Server is running"}`

---

## 🎉 C'est Tout !

Votre application est en ligne ! 

**URL**: https://votre-app.up.railway.app

---

## 📝 Post-Déploiement

### Changer le Mot de Passe Admin

1. Ouvrir https://votre-app.up.railway.app
2. Login: `admin` / `admin123`
3. Changer le mot de passe immédiatement

### Configurer Custom Domain (Optionnel)

1. **Settings** → **Networking**
2. **Custom Domain** → Ajouter `votredomaine.com`
3. Configurer DNS selon instructions Railway

---

## 🐛 Problèmes Courants

### ❌ "Cannot connect to database"

**Solution**: Attendre 2-3 minutes que MySQL soit complètement prêt, puis redéployer.

### ❌ "Invalid token"

**Solution**: Vérifier que `JWT_SECRET` est bien défini dans les variables.

### ❌ "CORS error"

**Solution**: Mettre à jour `CORS_ORIGIN` avec l'URL Railway complète.

---

## 📞 Aide

- **Logs**: Railway Dashboard → Deployments → View Logs
- **Variables**: Railway Dashboard → Variables
- **Documentation complète**: Voir `RAILWAY_DEPLOYMENT.md`

---

## 💰 Coût

- **Plan Gratuit**: $5 crédit/mois (suffisant pour tester)
- **Plan Hobby**: $5/mois (recommandé pour production)

---

**Besoin d'aide ?** Consultez `RAILWAY_DEPLOYMENT.md` pour le guide complet.
