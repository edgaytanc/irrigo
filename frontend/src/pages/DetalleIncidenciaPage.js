// Archivo: frontend/src/pages/DetalleIncidenciaPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Container, Typography, CircularProgress, Alert, Card, CardContent, 
    CardMedia, Box, Chip, Paper, Select, MenuItem, Button, FormControl, InputLabel 
} from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const DetalleIncidenciaPage = () => {
    const { id } = useParams();
    const [incidencia, setIncidencia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estado para la lógica de roles
    const [currentUser, setCurrentUser] = useState(null);
    const [fontaneros, setFontaneros] = useState([]);
    const [selectedFontanero, setSelectedFontanero] = useState('');

    const fetchIncidencia = useCallback(async () => {
        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            const response = await axios.get(`http://127.0.0.1:8000/api/incidencias/${id}/`, {
                headers: { 'Authorization': `Bearer ${tokenData.access}` }
            });
            setIncidencia(response.data);
        } catch (err) {
            setError('No se pudo cargar la incidencia.');
            console.error(err);
        }
    }, [id]);

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem('authToken'))?.access;
            if (token) {
                const decodedToken = jwtDecode(token);
                const user = { rol: decodedToken.rol, id: decodedToken.user_id };
                setCurrentUser(user);

                await fetchIncidencia();

                if (user.rol === 'ADMINISTRADOR') {
                    try {
                        const res = await axios.get('http://127.0.0.1:8000/api/usuarios/?rol=FONTANERO', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        setFontaneros(res.data);
                    } catch (err) {
                        console.error("Error al cargar fontaneros", err);
                    }
                }
            }
            setLoading(false);
        };
        initialize();
    }, [id, fetchIncidencia]);

    const handleAssign = async () => {
        if (!selectedFontanero) {
            alert('Por favor, selecciona un fontanero.');
            return;
        }
        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            const response = await axios.patch(`http://127.0.0.1:8000/api/incidencias/${id}/assign/`, 
                { fontanero_id: selectedFontanero },
                { headers: { 'Authorization': `Bearer ${tokenData.access}` } }
            );
            setIncidencia(response.data);
            alert('Incidencia asignada con éxito');
        } catch (err) {
            console.error('Error al asignar incidencia', err);
            alert('No se pudo asignar la incidencia.');
        }
    };

    const handleUpdateStatus = async (nuevoEstado) => {
        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            const response = await axios.patch(`http://127.0.0.1:8000/api/incidencias/${id}/update_status/`, 
                { estado: nuevoEstado },
                { headers: { 'Authorization': `Bearer ${tokenData.access}` } }
            );
            setIncidencia(response.data);
            alert('Estado actualizado con éxito');
        } catch (err) {
            console.error('Error al actualizar estado', err);
            alert('No se pudo actualizar el estado.');
        }
    };

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
            
            {/* --- TARJETA DE DETALLES DE LA INCIDENCIA (CÓDIGO EXISTENTE) --- */}
            <Card elevation={3}>
                {incidencia.foto && (
                    <CardMedia
                        component="img"
                        height="400"
                        image={incidencia.foto}
                        alt={`Foto de la incidencia ${incidencia.id}`}
                        sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
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
                        <Typography variant="body1" component="p"><b>Fontanero Asignado:</b> {incidencia.fontanero_asignado_username || 'Ninguno'}</Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* --- PANEL DE ADMINISTRACIÓN (RENDERIZADO CONDICIONAL) --- */}
            {currentUser?.rol === 'ADMINISTRADOR' && (
                <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Panel de Administración</Typography>
                    <FormControl fullWidth>
                        <InputLabel id="select-fontanero-label">Asignar a Fontanero</InputLabel>
                        <Select
                            labelId="select-fontanero-label"
                            value={selectedFontanero}
                            label="Asignar a Fontanero"
                            onChange={(e) => setSelectedFontanero(e.target.value)}
                            disabled={incidencia.fontanero_asignado}
                        >
                            {fontaneros.map(f => (
                                <MenuItem key={f.id} value={f.id}>{f.username}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={handleAssign}
                        sx={{ mt: 2 }}
                        disabled={incidencia.fontanero_asignado}
                    >
                        Asignar
                    </Button>
                </Paper>
            )}

            {/* --- PANEL DE ACCIONES DEL FONTANERO (RENDERIZADO CONDICIONAL) --- */}
            {currentUser?.rol === 'FONTANERO' && currentUser.id === incidencia.fontanero_asignado && (
                <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Acciones</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            color="info" 
                            onClick={() => handleUpdateStatus('EN_PROCESO')}
                            disabled={incidencia.estado === 'EN_PROCESO' || incidencia.estado === 'RESUELTO'}
                        >
                            Marcar en Proceso
                        </Button>
                        <Button 
                            variant="contained" 
                            color="success" 
                            onClick={() => handleUpdateStatus('RESUELTO')}
                            disabled={incidencia.estado === 'RESUELTO'}
                        >
                            Marcar como Resuelto
                        </Button>
                    </Box>
                </Paper>
            )}

        </Container>
    );
};

export default DetalleIncidenciaPage;