// Archivo: frontend/src/components/Navbar.js

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
    const navigate = useNavigate();
    const token = JSON.parse(localStorage.getItem('authToken'))?.access;
    let user = null;
    if (token) {
        user = jwtDecode(token);
    }

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Gestión de Riego
                </Typography>
                
                {user && (
                    <Box>
                        {user.rol === 'AGRICULTOR' && (
                            <Button color="inherit" component={RouterLink} to="/reportar">Reportar Incidencia</Button>
                        )}
                        <Button color="inherit" component={RouterLink} to="/incidencias">Ver Incidencias</Button>
                        <Button color="inherit" onClick={handleLogout}>Cerrar Sesión</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;