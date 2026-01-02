import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>🐄 Dairy Management</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/cows" className={isActive('/cows') ? 'active' : ''}>
              🐮 Cows
            </Link>
          </li>
          <li>
            <Link to="/milk" className={isActive('/milk') ? 'active' : ''}>
              🥛 Milk Production
            </Link>
          </li>
          <li>
            <Link to="/health" className={isActive('/health') ? 'active' : ''}>
              🏥 Health Records
            </Link>
          </li>
          <li>
            <Link to="/feed" className={isActive('/feed') ? 'active' : ''}>
              🌾 Feed Records
            </Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <span>{user?.username}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={logout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

