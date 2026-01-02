import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const HealthModal = ({ record, cows, onClose }) => {
  const [formData, setFormData] = useState({
    cow_id: '',
    date: new Date().toISOString().split('T')[0],
    health_status: 'healthy',
    diagnosis: '',
    treatment: '',
    veterinarian: '',
    cost: '',
    next_checkup_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({
        cow_id: record.cow_id || '',
        date: record.date || new Date().toISOString().split('T')[0],
        health_status: record.health_status || 'healthy',
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || '',
        veterinarian: record.veterinarian || '',
        cost: record.cost || '',
        next_checkup_date: record.next_checkup_date || '',
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
        await api.put(`/api/health/${record.id}`, formData);
      } else {
        await api.post('/api/health', formData);
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
          <h2 className="modal-title">{record ? 'Edit Health Record' : 'Add Health Record'}</h2>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
            
            <div className="form-group">
              <label>Health Status *</label>
              <select
                name="health_status"
                value={formData.health_status}
                onChange={handleChange}
                required
              >
                <option value="healthy">Healthy</option>
                <option value="sick">Sick</option>
                <option value="recovering">Recovering</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Diagnosis</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Treatment</label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Veterinarian</label>
              <input
                type="text"
                name="veterinarian"
                value={formData.veterinarian}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Cost</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Next Checkup Date</label>
            <input
              type="date"
              name="next_checkup_date"
              value={formData.next_checkup_date}
              onChange={handleChange}
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

export default HealthModal;

