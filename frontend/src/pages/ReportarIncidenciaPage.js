// Archivo: frontend/src/pages/ReportarIncidenciaPage.js

import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Typography, TextField, Button, 
    CircularProgress, Alert, Paper 
} from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';

function ChangeMapView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

function MapaInteractivo({ initialPosition, onLocationChange }) {
    const [markerPosition, setMarkerPosition] = useState(initialPosition);

    useEffect(() => {
        setMarkerPosition(initialPosition);
    }, [initialPosition]);
    
    useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setMarkerPosition(newPos);
            onLocationChange(newPos.lat, newPos.lng);
        },
    });

    return markerPosition ? <Marker position={markerPosition}></Marker> : null;
}

const ReportarIncidenciaPage = () => {
    const DEFAULT_CENTER = [14.6349, -90.5069]; // Ubicación por defecto

    const [descripcion, setDescripcion] = useState('');
    const [foto, setFoto] = useState(null);
    const [latitud, setLatitud] = useState('');
    const [longitud, setLongitud] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [mapPosition, setMapPosition] = useState(DEFAULT_CENTER);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMapPosition([latitude, longitude]);
            },
            () => {
                console.log("No se pudo obtener la ubicación. Usando ubicación por defecto.");
            }
        );
    }, []);

    const obtenerUbicacion = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLatitud(latitude.toFixed(16));
                    setLongitud(longitude.toFixed(16));
                    setMapPosition([latitude, longitude]);
                },
                () => {
                    setError('No se pudo obtener la ubicación. Ingrésala manualmente o márcala en el mapa.');
                }
            );
        } else {
            setError('La geolocalización no es soportada por este navegador.');
        }
    };
    
    const handleLocationChange = (lat, lng) => {
        setLatitud(lat.toFixed(16));
        setLongitud(lng.toFixed(16));
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
            return;
        }

        if (foto) {
            formData.append('foto', foto);
        }

        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            const response = await axios.post('/api/incidencias/', formData, {
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
            setMapPosition(DEFAULT_CENTER);
        } catch (err) {
            setError('Error al reportar la incidencia. Verifica todos los campos.');
            console.error('Detalles del error del servidor:', err.response?.data || err.message);
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
                    
                    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Ubicación de la Incidencia
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Haz clic en el mapa para colocar un marcador o usa el botón GPS para mayor precisión.
                        </Typography>
                        <Box sx={{ height: { xs: '300px', md: '400px' }, width: '100%', mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                            <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <ChangeMapView center={mapPosition} />
                                <MapaInteractivo 
                                    initialPosition={latitud && longitud ? [latitud, longitud] : null}
                                    onLocationChange={handleLocationChange} 
                                />
                            </MapContainer>
                        </Box>
                    </Paper>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField 
                            label="Latitud" 
                            fullWidth 
                            required 
                            value={latitud} 
                            InputProps={{ readOnly: true }} 
                        />
                        <TextField 
                            label="Longitud" 
                            fullWidth 
                            required 
                            value={longitud} 
                            InputProps={{ readOnly: true }} 
                        />
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