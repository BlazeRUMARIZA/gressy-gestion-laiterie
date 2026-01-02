const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all feed records
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, cow_id, feed_type } = req.query;
    let query = `
      SELECT fr.*, c.tag_number, c.name as cow_name 
      FROM feed_records fr
      LEFT JOIN cows c ON fr.cow_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND fr.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND fr.date <= ?';
      params.push(endDate);
    }

    if (cow_id) {
      query += ' AND fr.cow_id = ?';
      params.push(cow_id);
    }

    if (feed_type) {
      query += ' AND fr.feed_type LIKE ?';
      params.push(`%${feed_type}%`);
    }

    query += ' ORDER BY fr.date DESC, fr.created_at DESC';

    const [records] = await db.pool.query(query, params);
    res.json(records);
  } catch (error) {
    console.error('Get feed records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single feed record
router.get('/:id', auth, async (req, res) => {
  try {
    const [records] = await db.pool.query(
      `SELECT fr.*, c.tag_number, c.name as cow_name 
       FROM feed_records fr
       LEFT JOIN cows c ON fr.cow_id = c.id
       WHERE fr.id = ?`,
      [req.params.id]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Get feed record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create feed record
router.post('/',
  auth,
  [
    body('feed_type').notEmpty().withMessage('Feed type is required'),
    body('quantity').isFloat({ min: 0 }).withMessage('Valid quantity is required'),
    body('date').isISO8601().withMessage('Valid date is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { cow_id, feed_type, quantity, unit = 'kg', date, cost, supplier, notes } = req.body;

      // Check if cow exists (if provided)
      if (cow_id) {
        const [cows] = await db.pool.query('SELECT * FROM cows WHERE id = ?', [cow_id]);
        if (cows.length === 0) {
          return res.status(404).json({ message: 'Cow not found' });
        }
      }

      const [result] = await db.pool.query(
        `INSERT INTO feed_records (cow_id, feed_type, quantity, unit, date, cost, supplier, notes, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cow_id || null, feed_type, quantity, unit, date, cost, supplier, notes, req.user.id]
      );

      const [newRecord] = await db.pool.query(
        `SELECT fr.*, c.tag_number, c.name as cow_name 
         FROM feed_records fr
         LEFT JOIN cows c ON fr.cow_id = c.id
         WHERE fr.id = ?`,
        [result.insertId]
      );

      res.status(201).json(newRecord[0]);
    } catch (error) {
      console.error('Create feed record error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update feed record
router.put('/:id', auth, async (req, res) => {
  try {
    const { cow_id, feed_type, quantity, unit, date, cost, supplier, notes } = req.body;

    const [existing] = await db.pool.query('SELECT * FROM feed_records WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await db.pool.query(
      `UPDATE feed_records SET cow_id = ?, feed_type = ?, quantity = ?, unit = ?, date = ?, cost = ?, supplier = ?, notes = ? WHERE id = ?`,
      [cow_id || null, feed_type, quantity, unit, date, cost, supplier, notes, req.params.id]
    );

    const [updated] = await db.pool.query(
      `SELECT fr.*, c.tag_number, c.name as cow_name 
       FROM feed_records fr
       LEFT JOIN cows c ON fr.cow_id = c.id
       WHERE fr.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Update feed record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete feed record
router.delete('/:id', auth, async (req, res) => {
  try {
    const [existing] = await db.pool.query('SELECT * FROM feed_records WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await db.pool.query('DELETE FROM feed_records WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete feed record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get feed statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT 
        SUM(quantity) as total_quantity,
        SUM(cost) as total_cost,
        COUNT(*) as total_records,
        COUNT(DISTINCT feed_type) as feed_types_count
      FROM feed_records
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
    console.error('Get feed stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

