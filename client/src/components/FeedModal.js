import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const FeedModal = ({ record, cows, onClose }) => {
  const [formData, setFormData] = useState({
    cow_id: '',
    feed_type: '',
    quantity: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    supplier: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({
        cow_id: record.cow_id || '',
        feed_type: record.feed_type || '',
        quantity: record.quantity || '',
        unit: record.unit || 'kg',
        date: record.date || new Date().toISOString().split('T')[0],
        cost: record.cost || '',
        supplier: record.supplier || '',
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
        await api.put(`/api/feed/${record.id}`, formData);
      } else {
        await api.post('/api/feed', formData);
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
          <h2 className="modal-title">{record ? 'Edit Feed Record' : 'Add Feed Record'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cow (Optional - leave blank for general feed)</label>
            <select
              name="cow_id"
              value={formData.cow_id}
              onChange={handleChange}
            >
              <option value="">General Feed</option>
              {cows.map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.tag_number} - {cow.name || 'Unnamed'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Feed Type *</label>
            <input
              type="text"
              name="feed_type"
              value={formData.feed_type}
              onChange={handleChange}
              required
              placeholder="e.g., Hay, Silage, Concentrate"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="kg">kg</option>
                <option value="tons">tons</option>
                <option value="bags">bags</option>
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
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
            
            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              />
            </div>
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

export default FeedModal;

