import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FaUser, FaLock, FaSignInAlt, FaInfoCircle } from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-wrapper">
            <GiCow className="logo-icon" />
          </div>
          <h1>Gressy Gestion Laiterie</h1>
          <p className="subtitle">Système de Gestion de Ferme Laitière</p>
        </div>
        
        {error && (
          <div className="alert alert-error">
            <FaInfoCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaUser className="label-icon" />
              Nom d'utilisateur
            </label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Entrez votre nom d'utilisateur"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>
              <FaLock className="label-icon" />
              Mot de passe
            </label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Connexion en cours...
              </>
            ) : (
              <>
                <FaSignInAlt className="btn-icon" />
                Se connecter
              </>
            )}
          </button>
        </form>
        
        <div className="login-info">
          <FaInfoCircle className="info-icon" />
          <div className="info-content">
            <p className="info-title">Identifiants par défaut :</p>
            <div className="credentials">
              <p><strong>Nom d'utilisateur:</strong> admin</p>
              <p><strong>Mot de passe:</strong> admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


