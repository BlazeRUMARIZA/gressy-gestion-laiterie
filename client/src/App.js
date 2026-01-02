import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cows from './pages/Cows';
import MilkProduction from './pages/MilkProduction';
import HealthRecords from './pages/HealthRecords';
import FeedRecords from './pages/FeedRecords';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cows" element={<Cows />} />
            <Route path="milk" element={<MilkProduction />} />
            <Route path="health" element={<HealthRecords />} />
            <Route path="feed" element={<FeedRecords />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

