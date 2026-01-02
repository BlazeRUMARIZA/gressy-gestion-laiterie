import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CowModal from '../components/CowModal';

const Cows = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCow, setEditingCow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCows();
  }, [searchTerm, statusFilter]);

  const fetchCows = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/api/cows', { params });
      setCows(response.data);
    } catch (error) {
      console.error('Error fetching cows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCow(null);
    setShowModal(true);
  };

  const handleEdit = (cow) => {
    setEditingCow(cow);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cow?')) {
      try {
        await api.delete(`/api/cows/${id}`);
        fetchCows();
      } catch (error) {
        alert('Error deleting cow');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCow(null);
    fetchCows();
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Cows Management</h2>
          <button onClick={handleAdd} className="btn btn-primary">
            + Add Cow
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search by tag number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '10px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="sick">Sick</option>
            <option value="pregnant">Pregnant</option>
            <option value="sold">Sold</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tag Number</th>
                <th>Name</th>
                <th>Breed</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Weight (kg)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cows.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No cows found
                  </td>
                </tr>
              ) : (
                cows.map((cow) => (
                  <tr key={cow.id}>
                    <td>{cow.tag_number}</td>
                    <td>{cow.name || '-'}</td>
                    <td>{cow.breed || '-'}</td>
                    <td>{cow.gender}</td>
                    <td>
                      <span className={`status-badge status-${cow.status}`}>
                        {cow.status}
                      </span>
                    </td>
                    <td>{cow.weight || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(cow)}
                        className="btn btn-secondary"
                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cow.id)}
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
        <CowModal
          cow={editingCow}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Cows;

