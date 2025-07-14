// Archivo: frontend/src/pages/ReportarIncidenciaPage.js

import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const ReportarIncidenciaPage = () => {
    const [descripcion, setDescripcion] = useState('');
    const [foto, setFoto] = useState(null);
    const [latitud, setLatitud] = useState('');
    const [longitud, setLongitud] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const obtenerUbicacion = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitud(position.coords.latitude);
                    setLongitud(position.coords.longitude);
                },
                () => {
                    setError('No se pudo obtener la ubicación. Ingrésala manualmente.');
                }
            );
        } else {
            setError('La geolocalización no es soportada por este navegador.');
        }
    };

    const handleFileChange = (e) => {
        setFoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const formData = new FormData();
        formData.append('descripcion', descripcion);

        // --- INICIO DE LA CORRECCIÓN ---
        // Convertimos los valores a números de punto flotante para asegurar el formato correcto.
        // Usamos parseFloat para manejar el texto y toFixed para limitar los decimales,
        // lo que también garantiza que el separador decimal sea un punto (.).
        try {
            const lat = parseFloat(latitud);
            const lon = parseFloat(longitud);

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error('Latitud o Longitud no son números válidos.');
            }

            formData.append('latitud', lat.toFixed(16));
            formData.append('longitud', lon.toFixed(16));
        } catch (parseError) {
            setError('Error en el formato de coordenadas. Usa solo números y un punto decimal.');
            setLoading(false);
            return; // Detenemos el envío si el formato es incorrecto
        }
        // --- FIN DE LA CORRECCIÓN ---

        if (foto) {
            formData.append('foto', foto);
        }

        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            const response = await axios.post('http://127.0.0.1:8000/api/incidencias/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${tokenData.access}`
                }
            });
            setSuccess(`Incidencia reportada con éxito (ID: ${response.data.id}).`);
            setDescripcion('');
            setFoto(null);
            setLatitud('');
            setLongitud('');
        } catch (err) {
            setError('Error al reportar la incidencia. Verifica todos los campos.');
            if (err.response && err.response.data) {
                console.error('Detalles del error del servidor:', err.response.data);
            } else {
                console.error('Error de red o de otro tipo:', err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="md">
            <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">Reportar Nueva Incidencia</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    <TextField
                        label="Descripción del Problema"
                        multiline
                        rows={4}
                        fullWidth
                        required
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField label="Latitud" fullWidth required value={latitud} onChange={(e) => setLatitud(e.target.value)} />
                        <TextField label="Longitud" fullWidth required value={longitud} onChange={(e) => setLongitud(e.target.value)} />
                        <Button variant="outlined" onClick={obtenerUbicacion} startIcon={<AddLocationAltIcon />}>
                            GPS
                        </Button>
                    </Box>
                    <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                        Subir Foto
                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </Button>
                    {foto && <Typography variant="body2" sx={{ mt: 1 }}>Archivo seleccionado: {foto.name}</Typography>}

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Enviar Reporte'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default ReportarIncidenciaPage;