#!/bin/bash

# 🚂 Script de Préparation pour Déploiement Railway
# Ce script prépare le projet pour le déploiement sur Railway

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚂 Préparation du Déploiement Railway"
echo "======================================"
echo ""

# 1. Générer JWT Secret
echo "1️⃣  Génération du JWT Secret..."
JWT_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✓ JWT Secret généré${NC}"
echo ""
echo "🔑 Votre JWT_SECRET:"
echo "   $JWT_SECRET"
echo ""
echo "⚠️  IMPORTANT: Copiez ce secret et ajoutez-le dans Railway:"
echo "   Railway Dashboard → Variables → JWT_SECRET"
echo ""

# 2. Vérifier fichiers nécessaires
echo "2️⃣  Vérification des fichiers de configuration..."

if [ -f "railway.json" ]; then
    echo -e "${GREEN}✓ railway.json présent${NC}"
else
    echo -e "${YELLOW}⚠ railway.json manquant${NC}"
fi

if [ -f "nixpacks.toml" ]; then
    echo -e "${GREEN}✓ nixpacks.toml présent${NC}"
else
    echo -e "${YELLOW}⚠ nixpacks.toml manquant${NC}"
fi

if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓ .gitignore présent${NC}"
else
    echo -e "${YELLOW}⚠ .gitignore manquant${NC}"
fi

# 3. Vérifier .env n'est pas commité
echo ""
echo "3️⃣  Vérification sécurité .env..."
if grep -q ".env" .gitignore; then
    echo -e "${GREEN}✓ .env protégé dans .gitignore${NC}"
else
    echo -e "${YELLOW}⚠ .env non protégé - AJOUTER À .gitignore${NC}"
fi

# 4. Vérifier structure projet
echo ""
echo "4️⃣  Vérification structure projet..."

if [ -d "server" ]; then
    echo -e "${GREEN}✓ Dossier server/ présent${NC}"
else
    echo -e "${YELLOW}⚠ Dossier server/ manquant${NC}"
fi

if [ -d "client" ]; then
    echo -e "${GREEN}✓ Dossier client/ présent${NC}"
else
    echo -e "${YELLOW}⚠ Dossier client/ manquant${NC}"
fi

if [ -f "server/index.js" ]; then
    echo -e "${GREEN}✓ server/index.js présent${NC}"
else
    echo -e "${YELLOW}⚠ server/index.js manquant${NC}"
fi

# 5. Créer template .env.railway
echo ""
echo "5️⃣  Création du template .env.railway..."

cat > .env.railway.template << 'EOF'
# Configuration Railway - NE PAS COMMITER CE FICHIER AVEC DES VRAIES VALEURS!
# Copier ces variables dans Railway Dashboard → Variables

# Application
NODE_ENV=production
PORT=5000

# JWT Configuration
JWT_SECRET=<COLLER_LE_SECRET_GÉNÉRÉ_CI-DESSUS>
JWT_EXPIRE=7d

# Database (Railway fournit ces variables automatiquement)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}

# Alternative: Utiliser MYSQL_URL directement
# MYSQL_URL=${{MySQL.MYSQL_URL}}

# CORS
CORS_ORIGIN=${{RAILWAY_STATIC_URL}}
EOF

echo -e "${GREEN}✓ .env.railway.template créé${NC}"

# 6. Instructions Git
echo ""
echo "6️⃣  Prêt pour Git..."
echo ""
echo "Exécutez les commandes suivantes:"
echo ""
echo "  git add ."
echo "  git commit -m \"Préparation déploiement Railway\""
echo "  git push origin main"
echo ""

# 7. Récapitulatif
echo "======================================"
echo "📋 RÉCAPITULATIF"
echo "======================================"
echo ""
echo "✅ Actions Complétées:"
echo "   • JWT Secret généré"
echo "   • Fichiers de configuration vérifiés"
echo "   • Template .env.railway créé"
echo ""
echo "⚠️  Actions Requises sur Railway:"
echo ""
echo "1. Créer un projet Railway depuis GitHub"
echo "   → https://railway.app/new"
echo ""
echo "2. Ajouter MySQL Database"
echo "   → New → Database → MySQL"
echo ""
echo "3. Configurer les Variables (copier depuis .env.railway.template)"
echo "   → Service → Variables → Add Variables"
echo ""
echo "4. Ajouter JWT_SECRET:"
echo "   JWT_SECRET=$JWT_SECRET"
echo ""
echo "5. Déployer automatiquement via Git push"
echo "   ou manuellement: railway up"
echo ""
echo "6. Tester le déploiement:"
echo "   curl https://votre-app.up.railway.app/api/health-check"
echo ""
echo "📚 Documentation complète: RAILWAY_DEPLOYMENT.md"
echo ""
