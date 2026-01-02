const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Total cows
    const [cowStats] = await db.pool.query(`
      SELECT 
        COUNT(*) as total_cows,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_cows,
        SUM(CASE WHEN status = 'sick' THEN 1 ELSE 0 END) as sick_cows,
        SUM(CASE WHEN status = 'pregnant' THEN 1 ELSE 0 END) as pregnant_cows
      FROM cows
    `);

    // Today's milk production
    const today = new Date().toISOString().split('T')[0];
    const [todayMilk] = await db.pool.query(`
      SELECT 
        SUM(total_liters) as total_liters,
        COUNT(DISTINCT cow_id) as cows_milked
      FROM milk_production
      WHERE date = ?
    `, [today]);

    // This month's milk production
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const [monthMilk] = await db.pool.query(`
      SELECT 
        SUM(total_liters) as total_liters,
        AVG(total_liters) as avg_daily_liters,
        COUNT(DISTINCT cow_id) as active_cows
      FROM milk_production
      WHERE date >= ?
    `, [startOfMonth]);

    // Recent health issues
    const [healthIssues] = await db.pool.query(`
      SELECT COUNT(*) as count
      FROM health_records
      WHERE health_status IN ('sick', 'critical') 
      AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    // Recent feed costs
    const [feedCosts] = await db.pool.query(`
      SELECT 
        SUM(cost) as total_cost
      FROM feed_records
      WHERE date >= ?
    `, [startOfMonth]);

    // Milk production trend (last 7 days)
    const [milkTrend] = await db.pool.query(`
      SELECT 
        date,
        SUM(total_liters) as total_liters,
        COUNT(DISTINCT cow_id) as cows_milked
      FROM milk_production
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY date
      ORDER BY date ASC
    `);

    res.json({
      cows: cowStats[0],
      todayMilk: todayMilk[0],
      monthMilk: monthMilk[0],
      healthIssues: healthIssues[0],
      feedCosts: feedCosts[0],
      milkTrend: milkTrend
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

