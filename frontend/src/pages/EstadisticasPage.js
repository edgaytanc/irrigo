// Archivo: frontend/src/pages/EstadisticasPage.js

import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Alert, Grid, Paper, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const EstadisticasPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const tokenData = JSON.parse(localStorage.getItem('authToken'));
                const response = await axios.get('http://127.0.0.1:8000/api/estadisticas/', {
                    headers: { 'Authorization': `Bearer ${tokenData.access}` }
                });
                setStats(response.data);
            } catch (err) {
                setError('No se pudieron cargar las estadísticas. Asegúrate de tener permisos de administrador.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    if (!stats) return null;

    const COLORS = { PENDIENTE: '#ffc107', EN_PROCESO: '#03a9f4', RESUELTO: '#4caf50' };
    const pieData = stats.incidencias_por_estado.map(item => ({
        name: item.estado,
        value: item.total
    }));

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Estadísticas del Sistema
            </Typography>
            <Grid container spacing={3}>
                {/* Tarjeta de Total de Incidencias */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 180, justifyContent: 'center', alignItems: 'center' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Total de Incidencias
                        </Typography>
                        <Typography component="p" variant="h3">
                            {stats.total_incidencias}
                        </Typography>
                    </Paper>
                </Grid>
                {/* Tarjeta de Tiempo de Resolución */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 180, justifyContent: 'center', alignItems: 'center' }}>
                         <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Tiempo Promedio de Resolución
                        </Typography>
                        <Typography component="p" variant="h3">
                            {stats.tiempo_promedio_resolucion_horas}
                        </Typography>
                        <Typography color="text.secondary">horas</Typography>
                    </Paper>
                </Grid>
                {/* Tarjeta de Top Fontaneros */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 180 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Top Fontaneros
                        </Typography>
                        <Box>
                            {stats.top_fontaneros.map((fontanero, index) => (
                                <Typography key={index} variant="body1">
                                    {index + 1}. {fontanero.username} ({fontanero.incidencias_resueltas} resueltas)
                                </Typography>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
                 {/* Gráfico de Incidencias por Estado */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Distribución de Incidencias por Estado
                        </Typography>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default EstadisticasPage;