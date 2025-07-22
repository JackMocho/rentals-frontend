// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/apiBase';
import axios from 'axios';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to the correct dashboard based on user.role
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'landlord') return <Navigate to="/landlord-dashboard" />;
    if (user.role === 'client') return <Navigate to="/client-dashboard" />;
    return <Navigate to="/" />;
  }

  // Example API call - you can remove this if not needed
  axios.get(`${API_URL}/api/rentals`);

  return children;
}