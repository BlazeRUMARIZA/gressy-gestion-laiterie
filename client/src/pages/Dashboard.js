import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!stats) {
    return <div className="alert alert-error">Failed to load dashboard data</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Cows</h3>
          <div className="value">{stats.cows?.total_cows || 0}</div>
          <div className="label">Active: {stats.cows?.active_cows || 0}</div>
        </div>
        
        <div className="stat-card">
          <h3>Today's Milk</h3>
          <div className="value">{parseFloat(stats.todayMilk?.total_liters || 0).toFixed(2)} L</div>
          <div className="label">Cows Milked: {stats.todayMilk?.cows_milked || 0}</div>
        </div>
        
        <div className="stat-card">
          <h3>This Month's Milk</h3>
          <div className="value">{parseFloat(stats.monthMilk?.total_liters || 0).toFixed(2)} L</div>
          <div className="label">Avg Daily: {parseFloat(stats.monthMilk?.avg_daily_liters || 0).toFixed(2)} L</div>
        </div>
        
        <div className="stat-card">
          <h3>Health Issues (7 days)</h3>
          <div className="value">{stats.healthIssues?.count || 0}</div>
          <div className="label">Sick/Critical Cases</div>
        </div>
        
        <div className="stat-card">
          <h3>This Month Feed Cost</h3>
          <div className="value">${parseFloat(stats.feedCosts?.total_cost || 0).toFixed(2)}</div>
          <div className="label">Total Expenses</div>
        </div>
        
        <div className="stat-card">
          <h3>Sick Cows</h3>
          <div className="value">{stats.cows?.sick_cows || 0}</div>
          <div className="label">Require Attention</div>
        </div>
      </div>

      {stats.milkTrend && stats.milkTrend.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Milk Production Trend (Last 7 Days)</h2>
          </div>
          <div className="trend-chart">
            {stats.milkTrend.map((day, index) => (
              <div key={index} className="trend-item">
                <div className="trend-date">{new Date(day.date).toLocaleDateString()}</div>
                <div className="trend-bar-container">
                  <div
                    className="trend-bar"
                    style={{
                      width: `${(day.total_liters / Math.max(...stats.milkTrend.map(d => d.total_liters))) * 100}%`
                    }}
                  >
                    {parseFloat(day.total_liters).toFixed(1)}L
                  </div>
                </div>
                <div className="trend-cows">{day.cows_milked} cows</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

