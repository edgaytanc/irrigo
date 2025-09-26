// Archivo: frontend/src/pages/ListaIncidenciasPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, List, ListItem, ListItemButton, ListItemText, CircularProgress, Alert, Paper, Divider, Box, ButtonGroup, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ListaIncidenciasPage = () => {
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState(''); // Estado para el filtro

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('authToken'))?.access;
        if (token) {
            const decodedToken = jwtDecode(token);
            setCurrentUser({ rol: decodedToken.rol });
        }
    }, []);

    const fetchIncidencias = useCallback(async () => {
        setLoading(true);
        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            
            // Construimos los parámetros de la URL
            const params = new URLSearchParams();
            if (filtroEstado) {
                params.append('estado', filtroEstado);
            }
            
            const response = await axios.get(`/api/incidencias/`, {
                headers: { 'Authorization': `Bearer ${tokenData.access}` },
                params: params // Añadimos los parámetros a la petición
            });
            setIncidencias(response.data);
        } catch (err) {
            setError('No se pudieron cargar las incidencias.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filtroEstado]); // El hook se re-ejecutará si el filtro cambia

    useEffect(() => {
        fetchIncidencias();
    }, [fetchIncidencias]);

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Historial de Incidencias
            </Typography>

            {/* --- PANEL DE FILTROS PARA EL ADMINISTRADOR --- */}
            {currentUser?.rol === 'ADMINISTRADOR' && (
                <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Filtrar por Estado</Typography>
                    <ButtonGroup variant="outlined" aria-label="filtro de estado">
                        <Button onClick={() => setFiltroEstado('')} variant={filtroEstado === '' ? 'contained' : 'outlined'}>Todos</Button>
                        <Button onClick={() => setFiltroEstado('PENDIENTE')} variant={filtroEstado === 'PENDIENTE' ? 'contained' : 'outlined'}>Pendientes</Button>
                        <Button onClick={() => setFiltroEstado('EN_PROCESO')} variant={filtroEstado === 'EN_PROCESO' ? 'contained' : 'outlined'}>En Proceso</Button>
                        <Button onClick={() => setFiltroEstado('RESUELTO')} variant={filtroEstado === 'RESUELTO' ? 'contained' : 'outlined'}>Resueltos</Button>
                    </ButtonGroup>
                </Paper>
            )}

            <Paper elevation={3}>
                <List sx={{ padding: 0 }}>
                    {incidencias.length > 0 ? (
                        incidencias.map((inc, index) => (
                            <React.Fragment key={inc.id}>
                                <ListItem disablePadding>
                                    {/* --- CÓDIGO DEL LISTITEM QUE FALTABA --- */}
                                    <ListItemButton component={RouterLink} to={`/incidencias/${inc.id}`}>
                                        <ListItemText
                                            primary={`Incidencia #${inc.id} - Estado: ${inc.estado}`}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                                                        {inc.descripcion.substring(0, 150)}...
                                                    </Typography>
                                                    Reportado por: {inc.agricultor_reporta_username} el {new Date(inc.fecha_creacion).toLocaleDateString()}
                                                </>
                                            }
                                        />
                                    </ListItemButton>
                                    {/* --- FIN DEL CÓDIGO QUE FALTABA --- */}
                                </ListItem>
                                {index < incidencias.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No se encontraron incidencias con los filtros seleccionados." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Container>
    );
};

export default ListaIncidenciasPage;