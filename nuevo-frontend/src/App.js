// Archivo: src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UserAdminPage from './pages/UserAdminPage';
import IncidentAdminPage from './pages/IncidentAdminPage';
import ProtectedRoute from './components/ProtectedRoute';

// --- AÑADE ESTAS IMPORTACIONES DE MUI ---
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Creemos un tema básico (puedes personalizarlo más adelante)
const darkTheme = createTheme({
  palette: {
    mode: 'light', // Puedes cambiarlo a 'light' si lo prefieres 'dark
  },
});

function App() {
  return (
    // Envolvemos toda la aplicación con el ThemeProvider de MUI
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Normaliza los estilos del navegador */}
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'FONTANERO', 'AGRICULTOR']} />}>
            <Route path="/incidents" element={<IncidentAdminPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
            <Route path="/admin/users" element={<UserAdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;