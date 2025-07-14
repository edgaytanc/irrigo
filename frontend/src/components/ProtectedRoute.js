// Archivo: frontend/src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('authToken');

    // Si no hay token, redirige al login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Si hay token, muestra el contenido de la ruta
    return <Outlet />;
};

export default ProtectedRoute;