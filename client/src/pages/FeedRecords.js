import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import FeedModal from '../components/FeedModal';

const FeedRecords = () => {
  const [records, setRecords] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCows();
    fetchRecords();
  }, [startDate, endDate]);

  const fetchCows = async () => {
    try {
      const response = await api.get('/api/cows');
      setCows(response.data);
    } catch (error) {
      console.error('Error fetching cows:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/api/feed', { params });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

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
        await api.delete(`/api/feed/${id}`);
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
          <h2 className="card-title">Feed Records</h2>
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
                <th>Feed Type</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Cost</th>
                <th>Supplier</th>
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
                    <td>{record.cow_name || record.tag_number || 'General'}</td>
                    <td>{record.feed_type}</td>
                    <td>{parseFloat(record.quantity).toFixed(2)}</td>
                    <td>{record.unit}</td>
                    <td>{record.cost ? `$${parseFloat(record.cost).toFixed(2)}` : '-'}</td>
                    <td>{record.supplier || '-'}</td>
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
        <FeedModal
          record={editingRecord}
          cows={cows}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default FeedRecords;

