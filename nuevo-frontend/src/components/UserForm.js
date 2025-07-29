// Archivo: src/components/UserForm.js

import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Importaciones de MUI
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const UserForm = ({ user, open, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rol: 'AGRICULTOR', // <-- CAMBIO AQUÍ
  });

  const isEditing = !!user;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        rol: user.rol, // <-- CAMBIO AQUÍ
      });
    } else {
      setFormData({ username: '', email: '', password: '', rol: 'AGRICULTOR' }); // <-- CAMBIO AQUÍ
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (isEditing && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }

    try {
      if (isEditing) {
        await api.patch(`/usuarios/${user.id}/`, dataToSubmit);
      } else {
        await api.post('/usuarios/', dataToSubmit);
      }
      onClose();
    } catch (error) {
      console.error('Error saving user:', error.response?.data);
      alert('Error al guardar el usuario: ' + JSON.stringify(error.response?.data));
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="username"
          label="Nombre de Usuario"
          type="text"
          fullWidth
          variant="standard"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="email"
          label="Email"
          type="email"
          fullWidth
          variant="standard"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="password"
          label={isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
          type="password"
          fullWidth
          variant="standard"
          value={formData.password}
          onChange={handleChange}
          required={!isEditing}
        />
        <FormControl fullWidth margin="dense" variant="standard">
          <InputLabel id="rol-select-label">Rol</InputLabel>
          <Select
            labelId="rol-select-label"
            name="rol" // <-- CAMBIO AQUÍ
            value={formData.rol} // <-- CAMBIO AQUÍ
            onChange={handleChange}
          >
            <MenuItem value="ADMINISTRADOR">Administrador</MenuItem>
            <MenuItem value="FONTANERO">Fontanero</MenuItem>
            <MenuItem value="AGRICULTOR">Agricultor</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;