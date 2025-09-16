// Archivo: frontend/src/pages/LandingPage.js

import React from 'react';
import { Container, Typography, Card, CardContent, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 4 }}>
            <Box
                component="img"
                src="/img/logo.jpg" // Ruta al logo en la carpeta public
                alt="Logo ACMA"
                sx={{
                    width: { xs: 200, sm: 200 },
                    height: { xs: 200, sm: 200 },
                    objectFit: 'contain',
                    borderRadius: '50%',
                    boxShadow: 3,
                    mb: 3
                }}
            />
            <Card elevation={3}>
                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom 
                        sx={{ color: 'primary.main', fontWeight: 'bold' }}
                    >
                        ASOCIACIÓN CIVIL COORDINADORA MAYA AKATEKO
                    </Typography>
                    <Typography variant="body2" sx={{ my: 2, textAlign: 'left', lineHeight: 1.7 }}>
                        <strong>ACMA</strong> fue fundada en 1992 en San Miguel Acatán, Huehuetenango, por un grupo de líderes comunitarios que, tras vivir el conflicto armado, decidieron impulsar el desarrollo integral del pueblo Akateko.
                    </Typography>
                    <Typography variant="body2" sx={{ my: 2, textAlign: 'left', lineHeight: 1.7 }}>
                        Legalizada en 1997, ACMA ha trabajado con instituciones como FIDA y proyectos internacionales para promover la conservación del suelo, reforestación, agricultura sostenible y desarrollo comunitario.
                    </Typography>
                    <Typography variant="body2" sx={{ my: 2, textAlign: 'left', lineHeight: 1.7 }}>
                        En 2000 inauguró su proyecto de mini riego, que hoy celebra 25 años de impacto positivo en la comunidad.
                    </Typography>
                </CardContent>
            </Card>
            <Button 
                variant="contained" 
                size="large"
                sx={{ mt: 4 }}
                onClick={() => navigate('/login')}
            >
                Entrar al Sistema
            </Button>
        </Container>
    );
};

export default LandingPage;