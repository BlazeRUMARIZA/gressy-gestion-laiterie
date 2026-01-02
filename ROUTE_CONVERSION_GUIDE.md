# 🔄 Guide de Conversion des Routes Restantes

Ce guide explique comment convertir les routes `milk.js`, `health.js`, `feed.js`, et `dashboard.js` pour utiliser asyncHandler.

## 📝 Pattern de Conversion

### Étape 1: Ajouter les imports

```javascript
// En haut du fichier, après les imports existants
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ConflictError, ValidationError } = require('../middleware/errorHandler');
```

### Étape 2: Convertir une route GET simple

**AVANT:**
```javascript
router.get('/', auth, async (req, res) => {
  try {
    const [records] = await db.pool.query('SELECT * FROM table');
    res.json(records);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
```

**APRÈS:**
```javascript
router.get('/', auth, asyncHandler(async (req, res) => {
  const [records] = await db.pool.query('SELECT * FROM table');
  res.json(records);
}));
```

### Étape 3: Convertir une route avec validation

**AVANT:**
```javascript
router.get('/:id', auth, async (req, res) => {
  try {
    const [records] = await db.pool.query('SELECT * FROM table WHERE id = ?', [req.params.id]);
    
    if (records.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
```

**APRÈS:**
```javascript
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const [records] = await db.pool.query('SELECT * FROM table WHERE id = ?', [req.params.id]);
  
  if (records.length === 0) {
    throw new NotFoundError('Record not found');
  }

  res.json(records[0]);
}));
```

### Étape 4: Convertir une route POST avec validation

**AVANT:**
```javascript
router.post('/',
  auth,
  [body('field').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [existing] = await db.pool.query('SELECT * FROM table WHERE field = ?', [value]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Already exists' });
      }

      const [result] = await db.pool.query('INSERT INTO table ...', [...]);
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);
```

**APRÈS:**
```javascript
router.post('/',
  auth,
  [body('field').notEmpty()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
    }

    const [existing] = await db.pool.query('SELECT * FROM table WHERE field = ?', [value]);
    if (existing.length > 0) {
      throw new ConflictError('Already exists');
    }

    const [result] = await db.pool.query('INSERT INTO table ...', [...]);
    res.status(201).json({ id: result.insertId });
  })
);
```

## 🎯 Table de Correspondance des Erreurs

| Situation | Code Status | Classe à Utiliser |
|-----------|-------------|-------------------|
| Ressource non trouvée | 404 | `NotFoundError` |
| Validation échouée | 400 | `ValidationError` |
| Ressource existe déjà | 409 | `ConflictError` |
| Non autorisé | 401 | `UnauthorizedError` |
| Accès interdit | 403 | `ForbiddenError` |
| Erreur générique | Custom | `new AppError(message, statusCode)` |

## 📦 Script de Conversion Automatique

```bash
#!/bin/bash
# convert-routes.sh

FILE=$1

if [ -z "$FILE" ]; then
  echo "Usage: ./convert-routes.sh path/to/route.js"
  exit 1
fi

echo "🔄 Conversion de $FILE..."

# Backup
cp "$FILE" "$FILE.backup"

# Ajouter imports si pas présents
if ! grep -q "asyncHandler" "$FILE"; then
  sed -i '5a const asyncHandler = require('"'"'../middleware/asyncHandler'"'"');' "$FILE"
  sed -i '6a const { NotFoundError, ConflictError, ValidationError } = require('"'"'../middleware/errorHandler'"'"');' "$FILE"
  echo "  ✓ Imports ajoutés"
fi

echo "  ⚠️  Conversion manuelle requise pour les blocs try-catch"
echo "  📖 Voir ROUTE_CONVERSION_GUIDE.md pour les patterns"
echo ""
echo "✅ Fichier backup créé: $FILE.backup"
```

## 🧪 Tester Après Conversion

```bash
# 1. Vérifier syntaxe
node -c server/routes/milk.js

# 2. Démarrer serveur
npm start

# 3. Tester endpoint
curl http://localhost:5000/api/milk

# 4. Tester erreur 404
curl http://localhost:5000/api/milk/999999

# 5. Vérifier format erreur
# Attendu: {"status":"fail","message":"Record not found"}
```

## 📋 Checklist par Route

### milk.js
- [ ] Ajouter imports asyncHandler et classes d'erreurs
- [ ] Convertir GET /
- [ ] Convertir GET /:id
- [ ] Convertir POST /
- [ ] Convertir PUT /:id
- [ ] Convertir DELETE /:id
- [ ] Convertir GET /stats/summary
- [ ] Tester tous les endpoints

### health.js
- [ ] Ajouter imports asyncHandler et classes d'erreurs
- [ ] Convertir GET /
- [ ] Convertir GET /:id
- [ ] Convertir POST /
- [ ] Convertir PUT /:id
- [ ] Convertir DELETE /:id
- [ ] Tester tous les endpoints

### feed.js
- [ ] Ajouter imports asyncHandler et classes d'erreurs
- [ ] Convertir GET /
- [ ] Convertir GET /:id
- [ ] Convertir POST /
- [ ] Convertir PUT /:id
- [ ] Convertir DELETE /:id
- [ ] Convertir GET /stats/summary
- [ ] Tester tous les endpoints

### dashboard.js
- [ ] Ajouter imports asyncHandler et classes d'erreurs
- [ ] Convertir toutes les routes GET
- [ ] Tester tous les endpoints

## 💡 Conseils

1. **Convertir un fichier à la fois** - Plus facile à déboguer
2. **Tester après chaque conversion** - Assurer que tout fonctionne
3. **Garder les backups** - En cas de problème
4. **Utiliser git** - Commit après chaque fichier converti

## 🚨 Pièges Courants

### ❌ Piège 1: Oublier d'enlever le try-catch
```javascript
// ❌ MAUVAIS - asyncHandler + try-catch
router.get('/', asyncHandler(async (req, res) => {
  try {  // ← À enlever !
    const [data] = await db.pool.query('...');
    res.json(data);
  } catch (error) {
    // ...
  }
}));
```

### ❌ Piège 2: Continuer à utiliser return res.status()
```javascript
// ❌ MAUVAIS
if (!record) {
  return res.status(404).json({ message: 'Not found' });
}

// ✅ BON
if (!record) {
  throw new NotFoundError('Record not found');
}
```

### ❌ Piège 3: Oublier la parenthèse de asyncHandler
```javascript
// ❌ MAUVAIS
router.get('/', auth, asyncHandler(async (req, res) => {
  // ...
});  // ← Manque une parenthèse !

// ✅ BON
router.get('/', auth, asyncHandler(async (req, res) => {
  // ...
}));  // ← Deux parenthèses
```

## 📞 Aide

En cas de problème:
1. Vérifier la syntaxe avec `node -c fichier.js`
2. Comparer avec `auth.js` ou `cows.js` (déjà convertis)
3. Vérifier les logs du serveur
4. Restaurer le backup si nécessaire: `cp fichier.js.backup fichier.js`

---

**Temps estimé**: 15-20 minutes par fichier  
**Difficulté**: ⭐⭐ (Facile à Moyen)
