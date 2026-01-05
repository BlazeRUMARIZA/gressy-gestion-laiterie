import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import MilkModal from '../components/MilkModal';

const MilkProduction = () => {
  const [records, setRecords] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchCows = useCallback(async () => {
    try {
      const response = await api.get('/api/cows?status=active');
      setCows(response.data);
    } catch (error) {
      console.error('Error fetching cows:', error);
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/api/milk', { params });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchCows();
    fetchRecords();
  }, [fetchCows, fetchRecords]);

  const handleAdd = () => {
    setEditingRecord(null);
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/api/milk/${id}`);
        fetchRecords();
      } catch (error) {
        alert('Error deleting record');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRecord(null);
    fetchRecords();
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Milk Production Records</h2>
          <button onClick={handleAdd} className="btn btn-primary">
            + Add Record
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '10px' }}
          />
          <input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '10px' }}
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Cow</th>
                <th>Morning (L)</th>
                <th>Afternoon (L)</th>
                <th>Evening (L)</th>
                <th>Total (L)</th>
                <th>Quality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.cow_name || record.tag_number || `Cow #${record.cow_id}`}</td>
                    <td>{parseFloat(record.morning_liters || 0).toFixed(2)}</td>
                    <td>{parseFloat(record.afternoon_liters || 0).toFixed(2)}</td>
                    <td>{parseFloat(record.evening_liters || 0).toFixed(2)}</td>
                    <td><strong>{parseFloat(record.total_liters || 0).toFixed(2)}</strong></td>
                    <td>{record.quality_score || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(record)}
                        className="btn btn-secondary"
                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <MilkModal
          record={editingRecord}
          cows={cows}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default MilkProduction;

