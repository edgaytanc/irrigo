// Archivo: frontend/src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Alert, Grid, Paper, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import axios from 'axios';

const DashboardPage = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const tokenData = JSON.parse(localStorage.getItem('authToken'));
                const response = await axios.get('http://127.0.0.1:8000/api/dashboard-summary/', {
                    headers: { 'Authorization': `Bearer ${tokenData.access}` }
                });
                setSummaryData(response.data);
            } catch (err) {
                setError('No se pudo cargar el resumen del dashboard.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    if (!summaryData) return null;

    const renderAdminDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}><SummaryCard title="Incidencias Totales" value={summaryData.summary.total_incidencias} /></Grid>
            <Grid item xs={12} md={4}><SummaryCard title="Pendientes de Asignar" value={summaryData.summary.pendientes_de_asignar} /></Grid>
            <Grid item xs={12} md={4}><SummaryCard title="Usuarios Registrados" value={summaryData.summary.total_usuarios} /></Grid>
            <Grid item xs={12}><ActionCard title="Ver Todas las Incidencias" to="/incidencias" icon={<ListAltIcon />} /></Grid>
            <Grid item xs={12}><ActionCard title="Ver Estadísticas Detalladas" to="/estadisticas" icon={<BarChartIcon />} /></Grid>
        </Grid>
    );

    const renderFontaneroDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}><SummaryCard title="Incidencias Asignadas" value={summaryData.summary.total_asignadas} /></Grid>
            <Grid item xs={12} md={6}><SummaryCard title="Pendientes de Atender" value={summaryData.summary.pendientes_de_atender} color="warning.main" /></Grid>
            <Grid item xs={12}><ActionCard title="Ver Mis Incidencias Asignadas" to="/incidencias" icon={<ListAltIcon />} /></Grid>
        </Grid>
    );

    const renderAgricultorDashboard = () => (
         <Grid container spacing={3}>
            <Grid item xs={12} md={4}><SummaryCard title="Incidencias Reportadas" value={summaryData.summary.total_reportadas} /></Grid>
            <Grid item xs={12} md={4}><SummaryCard title="Pendientes" value={summaryData.summary.pendientes} color="warning.main" /></Grid>
            <Grid item xs={12} md={4}><SummaryCard title="En Proceso" value={summaryData.summary.en_proceso} color="info.main" /></Grid>
            <Grid item xs={12} md={6}><ActionCard title="Reportar Nueva Incidencia" to="/reportar" icon={<AddCircleOutlineIcon />} /></Grid>
            <Grid item xs={12} md={6}><ActionCard title="Ver Historial de Incidencias" to="/incidencias" icon={<ListAltIcon />} /></Grid>
        </Grid>
    );

    const renderDashboardByRole = () => {
        switch (summaryData.rol) {
            case 'ADMINISTRADOR': return renderAdminDashboard();
            case 'FONTANERO': return renderFontaneroDashboard();
            case 'AGRICULTOR': return renderAgricultorDashboard();
            default: return <Typography>Rol no reconocido.</Typography>;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Bienvenido, {summaryData.username}
            </Typography>
            {renderDashboardByRole()}
        </Container>
    );
};

// Componentes auxiliares para las tarjetas
const SummaryCard = ({ title, value, color = 'text.primary' }) => (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'center', alignItems: 'center' }}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>{title}</Typography>
        <Typography component="p" variant="h4" sx={{ color }}>{value}</Typography>
    </Paper>
);

const ActionCard = ({ title, to, icon }) => (
    <Paper sx={{ p: 2 }}>
        <Button component={RouterLink} to={to} variant="contained" startIcon={icon} fullWidth size="large">
            {title}
        </Button>
    </Paper>
);

export default DashboardPage;