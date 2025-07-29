// Archivo: src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Importaciones de MUI
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user && user.role && user.role.toUpperCase() === 'ADMINISTRADOR';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Irrigo
        </Typography>

        <Box>
          <Button color="inherit" component={Link} to="/incidents">
            Incidencias
          </Button>
          {isAdmin && (
            <Button color="inherit" component={Link} to="/admin/users">
              Usuarios
            </Button>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;