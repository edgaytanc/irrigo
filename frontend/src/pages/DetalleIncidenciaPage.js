// Archivo: frontend/src/pages/DetalleIncidenciaPage.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container, Typography, CircularProgress, Alert, Card, CardContent,
    CardMedia, Box, Chip, Paper, Select, MenuItem, Button, FormControl, InputLabel,
    List, ListItem, ListItemText, TextField
} from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useSnackbar } from '../context/SnackbarContext';

const DetalleIncidenciaPage = () => {
    const { id } = useParams();
    const { showSnackbar } = useSnackbar();
    const [incidencia, setIncidencia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    // Estado para el panel de admin
    const [fontaneros, setFontaneros] = useState([]);
    const [selectedFontanero, setSelectedFontanero] = useState('');

    // --- NUEVO ESTADO PARA LA SOLUCIÓN ---
    const [solucion, setSolucion] = useState('');

    // Estado para el chat
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatSocket = useRef(null);
    const chatLogRef = useRef(null);

    const fetchIncidencia = useCallback(async () => {
        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            const response = await axios.get(`/api/incidencias/${id}/`, {
                headers: { 'Authorization': `Bearer ${tokenData.access}` }
            });
            setIncidencia(response.data);
        } catch (err) {
            setError('No se pudo cargar la incidencia.');
            console.error(err);
        }
    }, [id]);

    useEffect(() => {
        let isMounted = true;
        const initialize = async () => {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem('authToken'))?.access;
            if (token) {
                const decodedToken = jwtDecode(token);
                const user = { rol: decodedToken.rol, id: decodedToken.user_id, username: decodedToken.username };
                if (isMounted) setCurrentUser(user);

                await fetchIncidencia();

                // Carga el historial del chat
                try {
                    const chatRes = await axios.get(`/api/incidencias/${id}/mensajes/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (isMounted) setChatMessages(chatRes.data);
                } catch (err) {
                    console.log("No se pudo cargar el historial del chat (puede ser por permisos).");
                }

                if (user.rol === 'ADMINISTRADOR') {
                    try {
                        const res = await axios.get('/api/usuarios/?rol=FONTANERO', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (isMounted) setFontaneros(res.data);
                    } catch (err) {
                        console.error("Error al cargar fontaneros", err);
                    }
                }

                // --- INICIO DE LA LÓGICA CRÍTICA DEL WEBSOCKET ---
            // Determina el protocolo (ws o wss) y el host dinámicamente
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/chat/${id}/?token=${token}`;
            
            console.log(`Conectando al WebSocket en: ${wsUrl}`); // Útil para depurar
            chatSocket.current = new WebSocket(wsUrl);

            // Manejador para cuando se recibe un mensaje
            chatSocket.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (isMounted) {
                    setChatMessages(prev => [...prev, { 
                        autor_username: data.user, 
                        contenido: data.message, 
                        fecha_envio: data.fecha 
                    }]);
                }
            };

            // Manejador para cuando la conexión se cierra
            chatSocket.current.onclose = () => {
                console.log('Socket de chat cerrado');
            };

            // Manejador para cualquier error en la conexión
            chatSocket.current.onerror = (err) => {
                console.error('Error de WebSocket:', err);
            };
            // --- FIN DE LA LÓGICA CRÍTICA DEL WEBSOCKET ---
        }
        if (isMounted) setLoading(false);
    };

        initialize();

        return () => {
            isMounted = false;
            if (chatSocket.current) {
                chatSocket.current.close();
            }
        };
    }, [id, fetchIncidencia]);

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleAssign = async () => {
        if (!selectedFontanero) {
            showSnackbar('Por favor, selecciona un fontanero.', 'warning');
            return;
        }
        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            const response = await axios.patch(`/api/incidencias/${id}/assign/`, { fontanero_id: selectedFontanero }, { headers: { 'Authorization': `Bearer ${tokenData.access}` } });
            setIncidencia(response.data);
            showSnackbar('Incidencia asignada con éxito', 'success');
        } catch (err) {
            console.error('Error al asignar incidencia', err);
            showSnackbar('No se pudo asignar la incidencia.', 'error');
        }
    };

    const handleUpdateStatus = async (nuevoEstado) => {
        if (nuevoEstado === 'RESUELTO' && !solucion.trim()) {
            showSnackbar('Por favor, describe la solución antes de marcar la incidencia como resuelta.', 'warning');
            return;
        }

        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            const payload = {
                estado: nuevoEstado,
                solucion: nuevoEstado === 'RESUELTO' ? solucion : undefined
            };
            const response = await axios.patch(`/api/incidencias/${id}/update_status/`, payload, {
                headers: { 'Authorization': `Bearer ${tokenData.access}` }
            });
            setIncidencia(response.data);
            setSolucion('');
            showSnackbar('Estado actualizado con éxito', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'No se pudo actualizar el estado.';
            showSnackbar(errorMessage, 'error');
            console.error('Error al actualizar estado', err);
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;
        chatSocket.current.send(JSON.stringify({ 'message': newMessage }));
        setNewMessage('');
    };

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    if (!incidencia || !currentUser) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDIENTE': return 'warning';
            case 'EN_PROCESO': return 'info';
            case 'RESUELTO': return 'success';
            default: return 'default';
        }
    };
    const markerPosition = [incidencia.latitud, incidencia.longitud];
    const esParticipanteChat = currentUser.rol === 'ADMINISTRADOR' || currentUser.id === incidencia.agricultor_reporta || currentUser.id === incidencia.fontanero_asignado;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Detalle de Incidencia #{incidencia.id}
            </Typography>

            <Card elevation={3}>
                <CardContent>
                    <Chip
                        label={incidencia.estado}
                        color={getStatusColor(incidencia.estado)}
                        sx={{ mb: 2, cursor: 'pointer' }}
                        onClick={() => console.log("Chip clickeado")}
                    />
                    <Typography variant="h6" component="p" color="text.secondary" paragraph>{incidencia.descripcion}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" gutterBottom><b>Ubicación</b></Typography>
                            <Box sx={{ height: { xs: '300px', md: '400px' }, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                                <MapContainer center={markerPosition} zoom={15} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                    <Marker position={markerPosition}></Marker>
                                </MapContainer>
                            </Box>
                        </Box>
                        {incidencia.foto && (
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" gutterBottom><b>Fotografía</b></Typography>
                                <Box component="img" sx={{ width: '100%', height: { xs: '300px', md: '400px' }, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider', backgroundColor: '#f5f5f5' }} src={incidencia.foto} alt={`Foto de la incidencia ${incidencia.id}`} />
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ mt: 3, borderTop: '1px solid #e0e0e0', pt: 2 }}>
                        <Typography variant="body1" component="p" gutterBottom><b>Reportado por:</b> {incidencia.agricultor_reporta_username}</Typography>
                        <Typography variant="body1" component="p" gutterBottom><b>Fecha de reporte:</b> {new Date(incidencia.fecha_creacion).toLocaleString()}</Typography>
                        <Typography variant="body1" component="p" gutterBottom><b>Coordenadas:</b> {incidencia.latitud}, {incidencia.longitud}</Typography>
                        <Typography variant="body1" component="p"><b>Fontanero Asignado:</b> {incidencia.fontanero_asignado_username || 'Ninguno'}</Typography>
                    </Box>
                    {incidencia.solucion && (
                        <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                            <Typography variant="subtitle1" gutterBottom><b>Descripción de la Solución:</b></Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{incidencia.solucion}</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

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
                            disabled={!!incidencia.fontanero_asignado}
                        >
                            {fontaneros.map(f => (<MenuItem key={f.id} value={f.id}>{f.username}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={handleAssign} sx={{ mt: 2 }} disabled={!!incidencia.fontanero_asignado}>Asignar</Button>
                </Paper>
            )}

            {currentUser?.rol === 'FONTANERO' && currentUser.id === incidencia.fontanero_asignado && (
                <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Acciones</Typography>
                    {incidencia.estado !== 'RESUELTO' && (
                        <TextField
                            label="Describe la solución aplicada"
                            multiline
                            rows={4}
                            fullWidth
                            value={solucion}
                            onChange={(e) => setSolucion(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" color="info" onClick={() => handleUpdateStatus('EN_PROCESO')} disabled={incidencia.estado === 'EN_PROCESO' || incidencia.estado === 'RESUELTO'}>Marcar en Proceso</Button>
                        <Button variant="contained" color="success" onClick={() => handleUpdateStatus('RESUELTO')} disabled={incidencia.estado === 'RESUELTO'}>Marcar como Resuelto</Button>
                    </Box>
                </Paper>
            )}

            {esParticipanteChat && (
                <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Chat de la Incidencia</Typography>
                    <Box ref={chatLogRef} sx={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
                        <List>
                            {chatMessages.map((msg, index) => (
                                <ListItem key={index} sx={{ justifyContent: msg.autor_username === currentUser.username ? 'flex-end' : 'flex-start' }}>
                                    <Paper elevation={1} sx={{ p: 1.5, maxWidth: '70%', bgcolor: msg.autor_username === currentUser.username ? 'primary.light' : 'background.paper' }}>
                                        <ListItemText primary={msg.contenido} secondary={`${msg.autor_username} - ${new Date(msg.fecha_envio).toLocaleTimeString()}`} />
                                    </Paper>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField fullWidth variant="outlined" label="Escribe un mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                        <Button variant="contained" onClick={handleSendMessage}>Enviar</Button>
                    </Box>
                </Paper>
            )}
        </Container>
    );
};

export default DetalleIncidenciaPage;