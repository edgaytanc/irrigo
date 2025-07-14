// Archivo: frontend/src/pages/DetalleIncidenciaPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Box, Chip } from '@mui/material';
import axios from 'axios';

const DetalleIncidenciaPage = () => {
    const { id } = useParams();
    const [incidencia, setIncidencia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // ... (La lógica de fetch es la misma)
        const fetchIncidencia = async () => {
            try {
                const tokenData = JSON.parse(localStorage.getItem('authToken'));
                const response = await axios.get(`http://127.0.0.1:8000/api/incidencias/${id}/`, {
                    headers: { 'Authorization': `Bearer ${tokenData.access}` }
                });
                setIncidencia(response.data);
            } catch (err) {
                setError('No se pudo cargar la incidencia.');
            } finally {
                setLoading(false);
            }
        };
        fetchIncidencia();
    }, [id]);

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    if (!incidencia) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDIENTE': return 'warning';
            case 'EN_PROCESO': return 'info';
            case 'RESUELTO': return 'success';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Detalle de Incidencia #{incidencia.id}
            </Typography>
            <Card elevation={3}>
                {incidencia.foto && (
                    <CardMedia
                        component="img"
                        height="400"
                        image={incidencia.foto}
                        alt={`Foto de la incidencia ${incidencia.id}`}
                        sx={{ objectFit: 'contain' }}
                    />
                )}
                <CardContent>
                    <Chip label={incidencia.estado} color={getStatusColor(incidencia.estado)} sx={{ mb: 2 }} />
                    <Typography variant="h6" component="p" color="text.secondary" paragraph>
                        {incidencia.descripcion}
                    </Typography>
                    <Box sx={{ mt: 3, borderTop: '1px solid #e0e0e0', pt: 2 }}>
                        <Typography variant="body1" component="p" gutterBottom><b>Reportado por:</b> {incidencia.agricultor_reporta_username}</Typography>
                        <Typography variant="body1" component="p" gutterBottom><b>Fecha de reporte:</b> {new Date(incidencia.fecha_creacion).toLocaleString()}</Typography>
                        <Typography variant="body1" component="p" gutterBottom><b>Coordenadas:</b> {incidencia.latitud}, {incidencia.longitud}</Typography>
                        <Typography variant="body1" component="p"><b>Fontanero Asignado:</b> {incidencia.fontanero_asignado || 'Ninguno'}</Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default DetalleIncidenciaPage;