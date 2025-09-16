// Archivo: frontend/src/components/Navbar.js

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNotificaciones } from '../context/NotificacionContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { notificaciones, noLeidasCount, marcarComoLeida } = useNotificaciones();
    
    // Estado para manejar los menús desplegables
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);

    // Hooks de Material-UI para la responsividad
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const token = JSON.parse(localStorage.getItem('authToken'))?.access;
    let user = null;
    if (token) {
        user = jwtDecode(token);
    }

    const handleLogout = () => {
        handleMenuClose();
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);
    const handleMenuClose = () => setMenuAnchorEl(null);

    const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
    const handleNotifClose = () => setNotifAnchorEl(null);

    const handleNotificacionClick = (notificacion) => {
        handleNotifClose();
        if (!notificacion.leida) {
            marcarComoLeida(notificacion.id);
        }
        if (notificacion.incidencia) {
            navigate(`/incidencias/${notificacion.incidencia}`);
        }
    };

    const renderNavLinks = (isMobileMenu = false) => {
        const commonProps = isMobileMenu 
            ? { component: RouterLink, onClick: handleMenuClose }
            : { color: "inherit", component: RouterLink };

        return (
            <>
                {user.rol === 'ADMINISTRADOR' && <Button {...commonProps} to="/estadisticas">Estadísticas</Button>}
                {user.rol === 'AGRICULTOR' && <Button {...commonProps} to="/reportar">Reportar Incidencia</Button>}
                <Button {...commonProps} to="/incidencias">Ver Incidencias</Button>
            </>
        );
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component={RouterLink} 
                    to="/dashboard"
                    sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
                >
                    Gestión de Riego
                </Typography>
                
                {user && (
                    isMobile ? (
                        <>
                            {/* --- VISTA MÓVIL --- */}
                            <IconButton color="inherit" onClick={handleMenuOpen}>
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={menuAnchorEl}
                                open={Boolean(menuAnchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem component={RouterLink} to="/dashboard" onClick={handleMenuClose}>Dashboard</MenuItem>
                                {renderNavLinks(true)}
                                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            {/* --- VISTA DE ESCRITORIO --- */}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {renderNavLinks()}
                                <Button color="inherit" onClick={handleLogout}>Cerrar Sesión</Button>
                            </Box>
                        </>
                    )
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;