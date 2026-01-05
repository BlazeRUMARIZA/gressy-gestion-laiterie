import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import MilkModal from '../components/MilkModal';
import { GiMilkCarton } from 'react-icons/gi';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import './DataList.css';

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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement?')) {
      try {
        await api.delete(`/api/milk/${id}`);
        fetchRecords();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRecord(null);
    fetchRecords();
  };

  const calculateStats = () => {
    const totalLiters = records.reduce((sum, r) => sum + parseFloat(r.total_liters || 0), 0);
    const avgPerRecord = records.length > 0 ? totalLiters / records.length : 0;
    return {
      totalRecords: records.length,
      totalLiters: totalLiters.toFixed(2),
      avgPerRecord: avgPerRecord.toFixed(2),
      morningTotal: records.reduce((sum, r) => sum + parseFloat(r.morning_liters || 0), 0).toFixed(2)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="modern-spinner">
        <div className="modern-spinner-icon"></div>
      </div>
    );
  }

  return (
    <div className="data-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>
          <GiMilkCarton className="header-icon" />
          Production de Lait
        </h1>
        <button onClick={handleAdd} className="btn-modern btn-modern-primary">
          <FaPlus className="btn-icon" />
          Ajouter un Enregistrement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <GiMilkCarton />
          </div>
          <div className="stat-content">
            <div className="stat-label">Enregistrements</div>
            <div className="stat-value">{stats.totalRecords}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <GiMilkCarton />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Litres</div>
            <div className="stat-value">{stats.totalLiters}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <GiMilkCarton />
          </div>
          <div className="stat-content">
            <div className="stat-label">Moyenne/Enreg.</div>
            <div className="stat-value">{stats.avgPerRecord}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <GiMilkCarton />
          </div>
          <div className="stat-content">
            <div className="stat-label">Matin Total</div>
            <div className="stat-value">{stats.morningTotal}</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">
              <FaCalendarAlt /> Date Début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">
              <FaCalendarAlt /> Date Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filter-input"
            />
          </div>
          {(startDate || endDate) && (
            <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="btn-modern btn-modern-secondary"
              >
                <FaTimes /> Effacer les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Table */}
      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vache</th>
              <th>Matin (L)</th>
              <th>Après-midi (L)</th>
              <th>Soir (L)</th>
              <th>Total (L)</th>
              <th>Qualité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <GiMilkCarton />
                    </div>
                    <div className="empty-state-title">Aucun enregistrement trouvé</div>
                    <div className="empty-state-text">
                      Commencez par ajouter un enregistrement de production
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString('fr-FR')}</td>
                  <td>{record.cow_name || record.tag_number || `Vache #${record.cow_id}`}</td>
                  <td>{parseFloat(record.morning_liters || 0).toFixed(2)}</td>
                  <td>{parseFloat(record.afternoon_liters || 0).toFixed(2)}</td>
                  <td>{parseFloat(record.evening_liters || 0).toFixed(2)}</td>
                  <td><strong>{parseFloat(record.total_liters || 0).toFixed(2)}</strong></td>
                  <td>{record.quality_score || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(record)}
                        className="btn-action btn-action-edit"
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="btn-action btn-action-delete"
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
