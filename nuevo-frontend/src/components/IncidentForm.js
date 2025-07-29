// Archivo: src/components/IncidentForm.js

import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Importaciones de MUI (se mantiene igual)
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const IncidentForm = ({ incident, open, onClose }) => {
  const [formData, setFormData] = useState({
    descripcion: '',
    latitud: '',
    longitud: '',
    estado: 'PENDIENTE',
  });
  
  // --- 1. AÑADIMOS UN NUEVO ESTADO PARA EL ARCHIVO DE LA FOTO ---
  const [selectedFile, setSelectedFile] = useState(null);

  const isEditing = !!incident;

  useEffect(() => {
    if (open) { // Resetear el formulario cada vez que se abre
      if (isEditing) {
        setFormData({
          descripcion: incident.descripcion,
          latitud: incident.latitud,
          longitud: incident.longitud,
          estado: incident.estado,
        });
      } else {
        setFormData({ descripcion: '', latitud: '', longitud: '', estado: 'PENDIENTE' });
      }
      setSelectedFile(null); // Limpiar el archivo seleccionado
    }
  }, [incident, open, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 2. NUEVA FUNCIÓN PARA MANEJAR LA SELECCIÓN DEL ARCHIVO ---
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // --- 3. MODIFICAMOS handleSubmit PARA USAR FormData ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Creamos un objeto FormData para poder enviar archivos
    const dataToSend = new FormData();
    dataToSend.append('descripcion', formData.descripcion);
    dataToSend.append('latitud', formData.latitud);
    dataToSend.append('longitud', formData.longitud);
    dataToSend.append('estado', formData.estado);
    
    // Adjuntamos la foto solo si se ha seleccionado una
    if (selectedFile) {
      dataToSend.append('foto', selectedFile);
    } else if (!isEditing) {
      // Si se está creando una nueva incidencia, la foto es obligatoria
      alert("Por favor, selecciona una foto para la incidencia.");
      return;
    }

    try {
      if (isEditing) {
        // En edición, la foto es opcional. El backend no la actualizará si no se envía.
        await api.patch(`/incidencias/${incident.id}/`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/incidencias/', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onClose(); // Cierra el modal y la página principal se refrescará
    } catch (error) {
      console.error('Error saving incident:', error.response?.data);
      alert('Error al guardar la incidencia: ' + JSON.stringify(error.response?.data));
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditing ? 'Editar Incidencia' : 'Crear Nueva Incidencia'}</DialogTitle>
      <DialogContent>
        {/* Los campos de texto se mantienen igual */}
        <TextField autoFocus margin="dense" name="descripcion" label="Descripción" type="text" fullWidth multiline rows={4} variant="standard" value={formData.descripcion} onChange={handleChange} required />
        <TextField margin="dense" name="latitud" label="Latitud" type="text" fullWidth variant="standard" value={formData.latitud} onChange={handleChange} required />
        <TextField margin="dense" name="longitud" label="Longitud" type="text" fullWidth variant="standard" value={formData.longitud} onChange={handleChange} required />

        {/* --- 4. NUEVO BOTÓN PARA CARGAR LA FOTO --- */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            component="label" // Esto permite que el botón actúe como una etiqueta de input
            startIcon={<PhotoCamera />}
          >
            Cargar Fotografía
            {/* El input real está oculto, pero el botón lo activa */}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
              {selectedFile.name}
            </Typography>
          )}
        </Box>

        {isEditing && (
          <FormControl fullWidth margin="dense" variant="standard" sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Estado</InputLabel>
            <Select labelId="status-select-label" name="estado" value={formData.estado} onChange={handleChange}>
              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
              <MenuItem value="EN_PROCESO">En Proceso</MenuItem>
              <MenuItem value="RESUELTA">Resuelta</MenuItem>
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentForm;