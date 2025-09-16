// Archivo: frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

// Importaciones de Material-UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Importación de componentes
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import ReportarIncidenciaPage from './pages/ReportarIncidenciaPage';
import ListaIncidenciasPage from './pages/ListaIncidenciasPage';
import DetalleIncidenciaPage from './pages/DetalleIncidenciaPage';
import { NotificacionProvider } from './context/NotificacionContext';
import EstadisticasPage from './pages/EstadisticasPage';
import DashboardPage from './pages/DashboardPage';

import Navbar from './components/Navbar';

// Componente temporal para el dashboard
const Dashboard = () => <h2>Bienvenido a la Plataforma</h2>;

// Creación de un tema básico para nuestra aplicación
const theme = createTheme({
  palette: {
    mode: 'light', // Puedes cambiar a 'dark' para el modo oscuro
    primary: {
      main: '#2e7d32', // Un tono de verde para el tema agrícola
    },
    secondary: {
      main: '#ffc107',
    },
  },
});

// Un componente wrapper para mostrar el Navbar solo en rutas protegidas
const Layout = ({ children }) => {
    const location = useLocation();
    const noNavbarRoutes = ['/login', '/'];
    const showNavbar = tokenExists() && !noNavbarRoutes.includes(location.pathname);
    
    return (
        <>
            {showNavbar && <Navbar />}
            {children}
        </>
    );
};

// Helper para verificar si el token existe
const tokenExists = () => !!localStorage.getItem('authToken');

function App() {
  return (
    // Proveemos el tema a toda la aplicación
    <ThemeProvider theme={theme}>
      {/* Normaliza los estilos CSS */}
      <CssBaseline />
      <Router>
        <NotificacionProvider>
        <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage/>} />
            <Route path="/reportar" element={<ReportarIncidenciaPage />} />
            <Route path="/incidencias" element={<ListaIncidenciasPage />} />
            <Route path="/incidencias/:id" element={<DetalleIncidenciaPage />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            {/* Aquí irán todas las demás rutas protegidas */}
          </Route>
        </Routes>
        </Layout>
        </NotificacionProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;