// Archivo: frontend/src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Alert, Grid, Paper, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

// Importamos los iconos que usaremos
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
// import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EngineeringIcon from '@mui/icons-material/Engineering';

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
        <>
            <Typography variant="h5" component="h2" gutterBottom>Panel de Administrador</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}><SummaryCard title="Incidencias Totales" value={summaryData.summary.total_incidencias} icon={<ListAltIcon color="primary" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid item xs={12} sm={6} md={4}><SummaryCard title="Pendientes de Asignar" value={summaryData.summary.pendientes_de_asignar} icon={<HourglassEmptyIcon color="warning" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid item xs={12} sm={6} md={4}><SummaryCard title="Usuarios Registrados" value={summaryData.summary.total_usuarios} icon={<PeopleIcon color="secondary" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid item xs={12} md={6}><ActionCard title="Ver Todas las Incidencias" to="/incidencias" /></Grid>
                <Grid item xs={12} md={6}><ActionCard title="Ver Estadísticas Detalladas" to="/estadisticas" /></Grid>
            </Grid>
        </>
    );

    const renderFontaneroDashboard = () => (
        <>
            <Typography variant="h5" component="h2" gutterBottom>Panel de Fontanero</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}><SummaryCard title="Incidencias Asignadas" value={summaryData.summary.total_asignadas} icon={<AssignmentTurnedInIcon color="primary" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid item xs={12} sm={6}><SummaryCard title="Pendientes de Atender" value={summaryData.summary.pendientes_de_atender} icon={<PendingActionsIcon color="warning" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid item xs={12}><ActionCard title="Ver Mis Incidencias Asignadas" to="/incidencias" icon={<EngineeringIcon />} /></Grid>
            </Grid>
        </>
    );

    const renderAgricultorDashboard = () => (
        <>
            <Typography variant="h5" component="h2" gutterBottom>Panel de Agricultor</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}><SummaryCard title="Incidencias Reportadas" value={summaryData.summary.total_reportadas} icon={<ListAltIcon color="primary" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid item xs={12} sm={4}><SummaryCard title="Pendientes" value={summaryData.summary.pendientes} icon={<HourglassEmptyIcon color="warning" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid item xs={12} sm={4}><SummaryCard title="En Proceso" value={summaryData.summary.en_proceso} icon={<EngineeringIcon color="info" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid item xs={12} md={6}><ActionCard title="Reportar Nueva Incidencia" to="/reportar" icon={<AddCircleOutlineIcon />} /></Grid>
                <Grid item xs={12} md={6}><ActionCard title="Ver Historial de Incidencias" to="/incidencias" icon={<ListAltIcon />} /></Grid>
            </Grid>
        </>
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
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Bienvenido, {summaryData.username}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Este es el resumen de tu actividad en el sistema.
                </Typography>
            </Box>
            {renderDashboardByRole()}
        </Container>
    );
};

// --- Componentes Auxiliares con Estilos Mejorados ---

const SummaryCard = ({ title, value, icon }) => (
    <Paper 
        elevation={3}
        sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderRadius: '12px',
            height: '100%'
        }}
    >
        <Box>
            <Typography color="text.secondary" gutterBottom>{title}</Typography>
            <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>{value}</Typography>
        </Box>
        {icon}
    </Paper>
);

const ActionCard = ({ title, to, icon }) => (
    <Paper 
        elevation={3}
        sx={{ 
            borderRadius: '12px',
            '&:hover': {
                boxShadow: 6, // Aumenta la sombra al pasar el mouse
            }
        }}
    >
        <Button 
            component={RouterLink} 
            to={to} 
            variant="contained" 
            startIcon={icon}
            fullWidth 
            sx={{ 
                py: 2,
                fontSize: '1.1rem',
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 'bold',
            }}
        >
            {title}
        </Button>
    </Paper>
);

export default DashboardPage;