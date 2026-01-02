import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaTachometerAlt, 
  FaCow, 
  FaDroplet, 
  FaHeartbeat, 
  FaSeedling, 
  FaSignOutAlt, 
  FaUser,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: FaTachometerAlt, label: 'Tableau de Bord' },
    { path: '/cows', icon: FaCow, label: 'Vaches' },
    { path: '/milk', icon: FaDroplet, label: 'Production Lait' },
    { path: '/health', icon: FaHeartbeat, label: 'Santé' },
    { path: '/feed', icon: FaSeedling, label: 'Alimentation' },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h1>🐄 Gressy Laiterie</h1>
        <div className="mobile-user">
          <FaUser />
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaCow />
            </div>
            <div className="logo-text">
              <h2>Gressy</h2>
              <span>Gestion Laiterie</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={isActive(item.path) ? 'active' : ''}
                  onClick={closeSidebar}
                >
                  <Icon className="menu-icon" />
                  <span>{item.label}</span>
                  {isActive(item.path) && <div className="active-indicator"></div>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">{user?.role || 'Admin'}</span>
            </div>
          </div>
          <button onClick={logout} className="btn btn-logout">
            <FaSignOutAlt />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;


