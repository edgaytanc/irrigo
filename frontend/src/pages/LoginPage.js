// Archivo: frontend/src/pages/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importaciones de componentes de Material-UI
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert, Grid, Paper } from '@mui/material';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/token/', {
                username,
                password
            });
            localStorage.setItem('authToken', JSON.stringify(response.data));
            navigate('/dashboard');
        } catch (err) {
            setError('Usuario o contraseña incorrectos. Inténtalo de nuevo.');
            console.error('Error de autenticación:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="lg" sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            py: 4
        }}>
            <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                Bienvenidos a Irrigo
            </Typography>

            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: '900px', borderRadius: '16px' }}>
                {/* --- CAMBIO 1: Aumentamos el espaciado entre columnas de 4 a 8 --- */}
                <Grid container spacing={8} alignItems="center">
                    
                    {/* --- Columna Izquierda: Formulario de Login --- */}
                    {/* --- CAMBIO 2: Añadimos padding horizontal para más aire --- */}
                    <Grid item xs={12} md={6} sx={{ px: { xs: 0, md: 2 } }}>
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <TextField
                                id="email"
                                label="Email / Nombre de Usuario"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                variant="filled"
                                sx={{
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: '#f0f4f0',
                                        borderRadius: '8px',
                                        '&:before, &:after': { borderBottom: 'none' },
                                        '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
                                    }
                                }}
                            />
                            <TextField
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                variant="filled"
                                sx={{
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: '#f0f4f0',
                                        borderRadius: '8px',
                                        '&:before, &:after': { borderBottom: 'none' },
                                        '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
                                    }
                                }}
                            />

                            {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    mt: 2,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    backgroundColor: '#66bb6a',
                                    '&:hover': {
                                        backgroundColor: '#57a05a'
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                            </Button>
                        </Box>
                    </Grid>

                    {/* --- Columna Derecha: Logo de la ONG --- */}
                    <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src="/img/logo.jpg"
                            alt="Logo ACMA"
                            sx={{
                                maxWidth: '100%',
                                height: 'auto',
                                maxHeight: '300px',
                                borderRadius: '16px'
                            }}
                        />
                    </Grid>

                </Grid>
            </Paper>
        </Container>
    );
};

export default LoginPage;