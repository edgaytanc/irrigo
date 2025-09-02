// Archivo: frontend/src/components/Navbar.js

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge, Menu, MenuItem, ListItemText, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useNotificaciones } from '../context/NotificacionContext'; // Importamos el hook

const Navbar = () => {
    const navigate = useNavigate();
    const { notificaciones, noLeidasCount, marcarComoLeida } = useNotificaciones(); // Usamos el contexto
    const [anchorEl, setAnchorEl] = useState(null);

    const token = JSON.parse(localStorage.getItem('authToken'))?.access;
    let user = null;
    if (token) {
        user = jwtDecode(token);
    }

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotificacionClick = (notificacion) => {
        handleMenuClose();
        if (!notificacion.leida) {
            marcarComoLeida(notificacion.id);
        }
        if (notificacion.incidencia) {
            navigate(`/incidencias/${notificacion.incidencia}`);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Gestión de Riego
                </Typography>
                
                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user.rol === 'AGRICULTOR' && (
                            <Button color="inherit" component={RouterLink} to="/reportar">
                                Reportar Incidencia
                            </Button>
                        )}
                        <Button color="inherit" component={RouterLink} to="/incidencias">
                            Ver Incidencias
                        </Button>
                        
                        <IconButton color="inherit" onClick={handleMenuOpen} sx={{ mx: 1 }}>
                            <Badge badgeContent={noLeidasCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            MenuListProps={{ sx: { width: 350 } }}
                        >
                            {notificaciones.length > 0 ? (
                                notificaciones.slice(0, 5).map((n, index) => (
                                    <MenuItem 
                                        key={n.id} 
                                        onClick={() => handleNotificacionClick(n)} 
                                        sx={{ 
                                            backgroundColor: n.leida ? 'transparent' : 'action.hover',
                                            whiteSpace: 'normal' 
                                        }}
                                    >
                                        <ListItemText 
                                            primary={n.mensaje} 
                                            secondary={new Date(n.fecha_creacion).toLocaleString()} 
                                        />
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No hay notificaciones</MenuItem>
                            )}
                        </Menu>
                        
                        <Button color="inherit" onClick={handleLogout}>
                            Cerrar Sesión
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;