// Archivo: frontend/src/pages/ListaIncidenciasPage.js

import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemButton, ListItemText, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const ListaIncidenciasPage = () => {
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // ... (La lógica de fetch es la misma)
        const fetchIncidencias = async () => {
            try {
                const tokenData = JSON.parse(localStorage.getItem('authToken'));
                const response = await axios.get('http://127.0.0.1:8000/api/incidencias/', {
                    headers: { 'Authorization': `Bearer ${tokenData.access}` }
                });
                setIncidencias(response.data);
            } catch (err) {
                setError('No se pudieron cargar las incidencias.');
            } finally {
                setLoading(false);
            }
        };
        fetchIncidencias();
    }, []);

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Historial de Incidencias
            </Typography>
            <Paper elevation={3}>
                <List sx={{ padding: 0 }}>
                    {incidencias.map((inc, index) => (
                        <React.Fragment key={inc.id}>
                            <ListItem disablePadding>
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
                            </ListItem>
                            {index < incidencias.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default ListaIncidenciasPage;