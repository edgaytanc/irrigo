// Archivo: frontend/src/context/NotificacionContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const NotificacionContext = createContext();

export const useNotificaciones = () => useContext(NotificacionContext);

export const NotificacionProvider = ({ children }) => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidasCount, setNoLeidasCount] = useState(0);

    const fetchNotificaciones = useCallback(async () => {
        const tokenData = JSON.parse(localStorage.getItem('authToken'));
        if (!tokenData) return;

        try {
            const response = await axios.get('/api/notificaciones/', {
                headers: { 'Authorization': `Bearer ${tokenData.access}` }
            });
            setNotificaciones(response.data);
            const count = response.data.filter(n => !n.leida).length;
            setNoLeidasCount(count);
        } catch (error) {
            console.error("Error al cargar notificaciones", error);
        }
    }, []);

    useEffect(() => {
        fetchNotificaciones(); // Carga inicial
        const interval = setInterval(fetchNotificaciones, 30000); // Polling cada 30 segundos
        return () => clearInterval(interval);
    }, [fetchNotificaciones]);

    const marcarComoLeida = async (id) => {
        try {
            const tokenData = JSON.parse(localStorage.getItem('authToken'));
            await axios.patch(`/api/notificaciones/${id}/marcar_leida/`, {}, {
                headers: { 'Authorization': `Bearer ${tokenData.access}` }
            });
            fetchNotificaciones(); // Recargar notificaciones
        } catch (error) {
            console.error("Error al marcar como leída", error);
        }
    };

    return (
        <NotificacionContext.Provider value={{ notificaciones, noLeidasCount, marcarComoLeida }}>
            {children}
        </NotificacionContext.Provider>
    );
};