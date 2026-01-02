const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all health records
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, cow_id, health_status } = req.query;
    let query = `
      SELECT hr.*, c.tag_number, c.name as cow_name 
      FROM health_records hr
      LEFT JOIN cows c ON hr.cow_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND hr.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND hr.date <= ?';
      params.push(endDate);
    }

    if (cow_id) {
      query += ' AND hr.cow_id = ?';
      params.push(cow_id);
    }

    if (health_status) {
      query += ' AND hr.health_status = ?';
      params.push(health_status);
    }

    query += ' ORDER BY hr.date DESC, hr.created_at DESC';

    const [records] = await db.pool.query(query, params);
    res.json(records);
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single health record
router.get('/:id', auth, async (req, res) => {
  try {
    const [records] = await db.pool.query(
      `SELECT hr.*, c.tag_number, c.name as cow_name 
       FROM health_records hr
       LEFT JOIN cows c ON hr.cow_id = c.id
       WHERE hr.id = ?`,
      [req.params.id]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create health record
router.post('/',
  auth,
  [
    body('cow_id').isInt().withMessage('Cow ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('health_status').isIn(['healthy', 'sick', 'recovering', 'critical']).withMessage('Invalid health status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { cow_id, date, health_status, diagnosis, treatment, veterinarian, cost, next_checkup_date, notes } = req.body;

      // Check if cow exists
      const [cows] = await db.pool.query('SELECT * FROM cows WHERE id = ?', [cow_id]);
      if (cows.length === 0) {
        return res.status(404).json({ message: 'Cow not found' });
      }

      const [result] = await db.pool.query(
        `INSERT INTO health_records (cow_id, date, health_status, diagnosis, treatment, veterinarian, cost, next_checkup_date, notes, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cow_id, date, health_status, diagnosis, treatment, veterinarian, cost, next_checkup_date, notes, req.user.id]
      );

      const [newRecord] = await db.pool.query(
        `SELECT hr.*, c.tag_number, c.name as cow_name 
         FROM health_records hr
         LEFT JOIN cows c ON hr.cow_id = c.id
         WHERE hr.id = ?`,
        [result.insertId]
      );

      res.status(201).json(newRecord[0]);
    } catch (error) {
      console.error('Create health record error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update health record
router.put('/:id', auth, async (req, res) => {
  try {
    const { cow_id, date, health_status, diagnosis, treatment, veterinarian, cost, next_checkup_date, notes } = req.body;

    const [existing] = await db.pool.query('SELECT * FROM health_records WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await db.pool.query(
      `UPDATE health_records SET cow_id = ?, date = ?, health_status = ?, diagnosis = ?, treatment = ?, 
       veterinarian = ?, cost = ?, next_checkup_date = ?, notes = ? WHERE id = ?`,
      [cow_id, date, health_status, diagnosis, treatment, veterinarian, cost, next_checkup_date, notes, req.params.id]
    );

    const [updated] = await db.pool.query(
      `SELECT hr.*, c.tag_number, c.name as cow_name 
       FROM health_records hr
       LEFT JOIN cows c ON hr.cow_id = c.id
       WHERE hr.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete health record
router.delete('/:id', auth, async (req, res) => {
  try {
    const [existing] = await db.pool.query('SELECT * FROM health_records WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await db.pool.query('DELETE FROM health_records WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

