const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all milk records
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, cow_id } = req.query;
    let query = `
      SELECT mp.*, c.tag_number, c.name as cow_name 
      FROM milk_production mp
      LEFT JOIN cows c ON mp.cow_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND mp.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND mp.date <= ?';
      params.push(endDate);
    }

    if (cow_id) {
      query += ' AND mp.cow_id = ?';
      params.push(cow_id);
    }

    query += ' ORDER BY mp.date DESC, mp.created_at DESC';

    const [records] = await db.pool.query(query, params);
    res.json(records);
  } catch (error) {
    console.error('Get milk records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single milk record
router.get('/:id', auth, async (req, res) => {
  try {
    const [records] = await db.pool.query(
      `SELECT mp.*, c.tag_number, c.name as cow_name 
       FROM milk_production mp
       LEFT JOIN cows c ON mp.cow_id = c.id
       WHERE mp.id = ?`,
      [req.params.id]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Get milk record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create milk record
router.post('/',
  auth,
  [
    body('cow_id').isInt().withMessage('Cow ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('morning_liters').optional().isFloat({ min: 0 }),
    body('afternoon_liters').optional().isFloat({ min: 0 }),
    body('evening_liters').optional().isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { cow_id, date, morning_liters = 0, afternoon_liters = 0, evening_liters = 0, quality_score, notes } = req.body;

      // Check if cow exists
      const [cows] = await db.pool.query('SELECT * FROM cows WHERE id = ?', [cow_id]);
      if (cows.length === 0) {
        return res.status(404).json({ message: 'Cow not found' });
      }

      const [result] = await db.pool.query(
        `INSERT INTO milk_production (cow_id, date, morning_liters, afternoon_liters, evening_liters, quality_score, notes, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cow_id, date, morning_liters, afternoon_liters, evening_liters, quality_score, notes, req.user.id]
      );

      const [newRecord] = await db.pool.query(
        `SELECT mp.*, c.tag_number, c.name as cow_name 
         FROM milk_production mp
         LEFT JOIN cows c ON mp.cow_id = c.id
         WHERE mp.id = ?`,
        [result.insertId]
      );

      res.status(201).json(newRecord[0]);
    } catch (error) {
      console.error('Create milk record error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update milk record
router.put('/:id', auth, async (req, res) => {
  try {
    const { cow_id, date, morning_liters, afternoon_liters, evening_liters, quality_score, notes } = req.body;

    const [existing] = await db.pool.query('SELECT * FROM milk_production WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await db.pool.query(
      `UPDATE milk_production SET cow_id = ?, date = ?, morning_liters = ?, afternoon_liters = ?, 
       evening_liters = ?, quality_score = ?, notes = ? WHERE id = ?`,
      [cow_id, date, morning_liters, afternoon_liters, evening_liters, quality_score, notes, req.params.id]
    );

    const [updated] = await db.pool.query(
      `SELECT mp.*, c.tag_number, c.name as cow_name 
       FROM milk_production mp
       LEFT JOIN cows c ON mp.cow_id = c.id
       WHERE mp.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Update milk record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete milk record
router.delete('/:id', auth, async (req, res) => {
  try {
    const [existing] = await db.pool.query('SELECT * FROM milk_production WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await db.pool.query('DELETE FROM milk_production WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete milk record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get milk statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT 
        COUNT(DISTINCT cow_id) as total_cows,
        SUM(total_liters) as total_liters,
        AVG(total_liters) as avg_liters_per_cow,
        COUNT(*) as total_records
      FROM milk_production
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    const [stats] = await db.pool.query(query, params);
    res.json(stats[0]);
  } catch (error) {
    console.error('Get milk stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

