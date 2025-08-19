// Archivo: frontend/src/pages/ReportarIncidenciaPage.js

import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Typography, TextField, Button, 
    CircularProgress, Alert, Paper 
} from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

// --- NUEVAS IMPORTACIONES PARA EL MAPA ---
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';

// --- NUEVO COMPONENTE PARA CAMBIAR LA VISTA DEL MAPA DINÁMICAMENTE ---
// React-Leaflet no re-centra el mapa si la prop 'center' cambia,
// por lo que este componente nos ayuda a hacerlo programáticamente.
function ChangeMapView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

// --- COMPONENTE PARA EL MAPA INTERACTIVO (CON LIGERAS MEJORAS) ---
function MapaInteractivo({ initialPosition, onLocationChange }) {
    const [markerPosition, setMarkerPosition] = useState(initialPosition);

    // useEffect para sincronizar el marcador si la posición inicial cambia (ej. con el botón GPS)
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
    // Coordenadas iniciales por defecto (Ciudad de Guatemala)
    const DEFAULT_CENTER = [14.6349, -90.5069];

    const [descripcion, setDescripcion] = useState('');
    const [foto, setFoto] = useState(null);
    const [latitud, setLatitud] = useState('');
    const [longitud, setLongitud] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    // --- NUEVO ESTADO PARA LA POSICIÓN DEL MAPA Y EL MARCADOR ---
    const [mapPosition, setMapPosition] = useState(DEFAULT_CENTER);

    // --- USEEFFECT PARA OBTENER LA UBICACIÓN AL CARGAR LA PÁGINA ---
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Centra el mapa en la ubicación del usuario
                setMapPosition([latitude, longitude]);
            },
            () => {
                // Si el usuario no da permiso, el mapa se queda en la ubicación por defecto
                console.log("No se pudo obtener la ubicación. Usando ubicación por defecto.");
            }
        );
    }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente


    const obtenerUbicacion = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Actualiza tanto los campos del formulario como la posición del mapa
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
            setMapPosition(DEFAULT_CENTER); // Resetea el mapa a la posición por defecto
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
                    
                    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Ubicación de la Incidencia
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Haz clic en el mapa para colocar un marcador o usa el botón GPS para mayor precisión.
                        </Typography>
                        <Box sx={{ height: '400px', width: '100%', mb: 2, borderRadius: 1, overflow: 'hidden' }}>
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