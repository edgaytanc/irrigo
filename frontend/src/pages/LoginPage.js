// Archivo: frontend/src/pages/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';

// Importaciones de componentes de Material-UI
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // La lógica de submit sigue siendo exactamente la misma
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password
            });
            localStorage.setItem('authToken', JSON.stringify(response.data));
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Usuario o contraseña incorrectos. Inténtalo de nuevo.');
            console.error('Error de autenticación:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Iniciar Sesión
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Nombre de Usuario"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Muestra el mensaje de error si existe */}
                    {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                    >
                        {loading ? 'Ingresando...' : 'Entrar'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;