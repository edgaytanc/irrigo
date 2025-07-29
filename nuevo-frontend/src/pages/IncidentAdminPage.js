// Archivo: src/pages/IncidentAdminPage.js

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
// --- 1. ASEGÚRATE DE IMPORTAR EL FORMULARIO ---
import IncidentForm from '../components/IncidentForm';

// Importaciones de MUI y sus íconos
import {
  Container, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const IncidentAdminPage = () => {
  const [incidents, setIncidents] = useState([]);
  // Estados para controlar el modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIncidents = async () => {
    try {
      const response = await api.get('/incidencias/');
      const data = response.data.results || response.data;
      if (Array.isArray(data)) {
        setIncidents(data);
      }
    } catch (error) {
      console.error("Error cargando incidencias", error);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleDelete = async (incidentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) {
      await api.delete(`/incidencias/${incidentId}/`);
      fetchIncidents();
    }
  };
  
  // Funciones para abrir y cerrar el modal
  const handleOpenModal = (incident = null) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedIncident(null);
    setIsModalOpen(false);
    fetchIncidents();
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Gestión de Incidencias
          </Typography>
          {/* --- 2. CORRECCIÓN CLAVE AQUÍ: AÑADIMOS EL onClick --- */}
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Crear Incidencia
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Reportado Por</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((inc) => (
                <TableRow key={inc.id} hover>
                  <TableCell>{inc.id}</TableCell>
                  <TableCell>{inc.descripcion}</TableCell>
                  <TableCell>{inc.estado}</TableCell>
                  <TableCell>{inc.reporta_nombre || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenModal(inc)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(inc.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* --- 3. AÑADIMOS EL COMPONENTE DEL FORMULARIO MODAL --- */}
        <IncidentForm
          incident={selectedIncident}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      </Container>
    </>
  );
};

export default IncidentAdminPage;