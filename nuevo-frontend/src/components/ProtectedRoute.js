// Archivo: src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // 1. Obtenemos el token y el objeto de usuario de localStorage
  const token = localStorage.getItem('access_token');
  const userString = localStorage.getItem('user');
  
  // 2. La primera y más importante barrera: si no hay token, no hay acceso.
  if (!token) {
    console.log("ProtectedRoute: No se encontró token. Redirigiendo a /login.");
    return <Navigate to="/login" />;
  }

  // 3. Si hay token, pero no hay objeto de usuario, algo está mal.
  // Esto puede pasar si el login falla a mitad de camino.
  if (!userString) {
    console.log("ProtectedRoute: Se encontró token pero no objeto de usuario. Limpiando y redirigiendo a /login.");
    localStorage.clear(); // Limpiamos para evitar inconsistencias
    return <Navigate to="/login" />;
  }

  // 4. Si todo existe, parseamos el usuario y verificamos el rol
  const user = JSON.parse(userString);

  // Si la ruta requiere roles específicos y el rol del usuario no está incluido, no pasa.
  // La comprobación user.role && ... previene errores si el objeto user no tiene la propiedad 'role'.
  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role.toUpperCase()))) {
    console.log(`ProtectedRoute: Rol '${user.role}' no autorizado. Redirigiendo a la página principal.`);
    // Lo redirigimos a /incidents, que es la página por defecto para usuarios logueados
    return <Navigate to="/incidents" />;
  }

  // 5. Si todas las verificaciones pasan, el usuario puede acceder a la ruta.
  return <Outlet />;
};

export default ProtectedRoute;