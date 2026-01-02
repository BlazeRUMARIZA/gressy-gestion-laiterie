#!/bin/bash

# Script pour appliquer asyncHandler à toutes les routes
# Ce script modifie les fichiers routes pour utiliser le middleware asyncHandler

echo "🔧 Application d'asyncHandler aux routes restantes..."

ROUTES_DIR="/home/rumariza/Documents/gressy-gestion-laiterie/server/routes"

# Liste des fichiers à modifier (sauf auth.js et cows.js déjà faits)
FILES=("milk.js" "health.js" "feed.js" "dashboard.js")

for file in "${FILES[@]}"; do
  filepath="$ROUTES_DIR/$file"
  
  if [ -f "$filepath" ]; then
    echo "  ✓ Traitement de $file..."
    
    # Backup
    cp "$filepath" "$filepath.backup"
    
    # Ajouter les imports en haut si pas déjà présents
    if ! grep -q "asyncHandler" "$filepath"; then
      sed -i "5a const asyncHandler = require('../middleware/asyncHandler');" "$filepath"
      sed -i "6a const { NotFoundError, ConflictError, ValidationError } = require('../middleware/errorHandler');" "$filepath"
    fi
    
    echo "    → Imports ajoutés"
  else
    echo "  ⚠ $file non trouvé"
  fi
done

echo ""
echo "✅ Script terminé!"
echo "⚠️  Note: Les routes doivent être manuellement converties pour remplacer try-catch par asyncHandler"
echo "    Voir auth.js et cows.js comme exemples"
