const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ConflictError, ValidationError } = require('../middleware/errorHandler');
const router = express.Router();

// Get all cows
router.get('/', auth, asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM cows WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (tag_number LIKE ? OR name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  const [cows] = await db.pool.query(query, params);
  res.json(cows);
}));

// Get single cow
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const [cows] = await db.pool.query('SELECT * FROM cows WHERE id = ?', [req.params.id]);
  
  if (cows.length === 0) {
    throw new NotFoundError('Cow not found');
  }

  res.json(cows[0]);
}));

// Create cow
router.post('/',
  auth,
  [
    body('tag_number').notEmpty().withMessage('Tag number is required'),
    body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
    }

    const { tag_number, name, breed, date_of_birth, gender, weight, status, purchase_date, purchase_price, notes } = req.body;

    // Check if tag number exists
    const [existing] = await db.pool.query('SELECT * FROM cows WHERE tag_number = ?', [tag_number]);
    if (existing.length > 0) {
      throw new ConflictError('Tag number already exists');
    }

    const [result] = await db.pool.query(
      `INSERT INTO cows (tag_number, name, breed, date_of_birth, gender, weight, status, purchase_date, purchase_price, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tag_number, name, breed, date_of_birth, gender, weight, status || 'active', purchase_date, purchase_price, notes]
    );

    const [newCow] = await db.pool.query('SELECT * FROM cows WHERE id = ?', [result.insertId]);
    res.status(201).json(newCow[0]);
  })
);

// Update cow
router.put('/:id', auth, asyncHandler(async (req, res) => {
  const { tag_number, name, breed, date_of_birth, gender, weight, status, purchase_date, purchase_price, notes } = req.body;

  // Check if cow exists
  const [existing] = await db.pool.query('SELECT * FROM cows WHERE id = ?', [req.params.id]);
  if (existing.length === 0) {
    throw new NotFoundError('Cow not found');
  }

  // Check tag number uniqueness if changed
  if (tag_number && tag_number !== existing[0].tag_number) {
    const [duplicate] = await db.pool.query('SELECT * FROM cows WHERE tag_number = ? AND id != ?', [tag_number, req.params.id]);
    if (duplicate.length > 0) {
      throw new ConflictError('Tag number already exists');
    }
  }

  await db.pool.query(
    `UPDATE cows SET tag_number = ?, name = ?, breed = ?, date_of_birth = ?, gender = ?, weight = ?, 
     status = ?, purchase_date = ?, purchase_price = ?, notes = ? WHERE id = ?`,
    [tag_number, name, breed, date_of_birth, gender, weight, status, purchase_date, purchase_price, notes, req.params.id]
  );

  const [updated] = await db.pool.query('SELECT * FROM cows WHERE id = ?', [req.params.id]);
  res.json(updated[0]);
}));

// Delete cow
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const [existing] = await db.pool.query('SELECT * FROM cows WHERE id = ?', [req.params.id]);
  if (existing.length === 0) {
    throw new NotFoundError('Cow not found');
  }

  await db.pool.query('DELETE FROM cows WHERE id = ?', [req.params.id]);
  res.json({ message: 'Cow deleted successfully' });
}));

module.exports = router;

