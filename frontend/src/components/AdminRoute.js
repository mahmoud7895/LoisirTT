import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Vérifie si l'utilisateur est admin

  if (!isAdmin) {
    return <Navigate to="/login" />; // Redirige vers la page de connexion si l'utilisateur n'est pas admin
  }

  return children; // Affiche le composant enfant si l'utilisateur est admin
};

export default AdminRoute;