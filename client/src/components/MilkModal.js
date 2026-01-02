import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const MilkModal = ({ record, cows, onClose }) => {
  const [formData, setFormData] = useState({
    cow_id: '',
    date: new Date().toISOString().split('T')[0],
    morning_liters: 0,
    afternoon_liters: 0,
    evening_liters: 0,
    quality_score: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({
        cow_id: record.cow_id || '',
        date: record.date || new Date().toISOString().split('T')[0],
        morning_liters: record.morning_liters || 0,
        afternoon_liters: record.afternoon_liters || 0,
        evening_liters: record.evening_liters || 0,
        quality_score: record.quality_score || '',
        notes: record.notes || ''
      });
    }
  }, [record]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (record) {
        await api.put(`/api/milk/${record.id}`, formData);
      } else {
        await api.post('/api/milk', formData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{record ? 'Edit Milk Record' : 'Add Milk Record'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cow *</label>
            <select
              name="cow_id"
              value={formData.cow_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a cow</option>
              {cows.map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.tag_number} - {cow.name || 'Unnamed'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Morning (Liters)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="morning_liters"
                value={formData.morning_liters}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Afternoon (Liters)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="afternoon_liters"
                value={formData.afternoon_liters}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Evening (Liters)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="evening_liters"
                value={formData.evening_liters}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Quality Score</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              name="quality_score"
              value={formData.quality_score}
              onChange={handleChange}
              placeholder="0-10"
            />
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilkModal;

