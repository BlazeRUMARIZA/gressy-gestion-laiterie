import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import CowModal from '../components/CowModal';
import { GiCow } from 'react-icons/gi';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import './DataList.css';

const Cows = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCow, setEditingCow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCows = useCallback(async () => {
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
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchCows();
  }, [fetchCows]);

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
          <GiCow className="header-icon" />
          Gestion des Vaches
        </h1>
        <button onClick={handleAdd} className="btn-modern btn-modern-primary">
          <FaPlus className="btn-icon" />
          Ajouter une Vache
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <GiCow />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Vaches</div>
            <div className="stat-value">{cows.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <GiCow />
          </div>
          <div className="stat-content">
            <div className="stat-label">Actives</div>
            <div className="stat-value">{cows.filter(c => c.status === 'active').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <GiCow />
          </div>
          <div className="stat-content">
            <div className="stat-label">Malades</div>
            <div className="stat-value">{cows.filter(c => c.status === 'sick').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <GiCow />
          </div>
          <div className="stat-content">
            <div className="stat-label">Enceintes</div>
            <div className="stat-value">{cows.filter(c => c.status === 'pregnant').length}</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">
              <FaSearch /> Rechercher
            </label>
            <input
              type="text"
              placeholder="Numéro de tag ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">
              <FaFilter /> Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="sick">Malade</option>
              <option value="pregnant">Enceinte</option>
              <option value="sold">Vendue</option>
              <option value="deceased">Décédée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Numéro Tag</th>
              <th>Nom</th>
              <th>Race</th>
              <th>Genre</th>
              <th>Statut</th>
              <th>Poids (kg)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cows.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <GiCow />
                    </div>
                    <div className="empty-state-title">Aucune vache trouvée</div>
                    <div className="empty-state-text">
                      Commencez par ajouter votre première vache
                    </div>
                  </div>
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
                    <span className={`modern-badge ${cow.status}`}>
                      {cow.status === 'active' && '● Active'}
                      {cow.status === 'sick' && '● Malade'}
                      {cow.status === 'pregnant' && '● Enceinte'}
                      {cow.status === 'sold' && '● Vendue'}
                      {cow.status === 'deceased' && '● Décédée'}
                    </span>
                  </td>
                  <td>{cow.weight || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(cow)}
                        className="btn-action btn-action-edit"
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(cow.id)}
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
        <CowModal
          cow={editingCow}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Cows;
