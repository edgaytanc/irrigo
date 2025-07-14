# Este código iría en el archivo models.py de una app de Django (ej. 'core/models.py')

from django.db import models
from django.contrib.auth.models import AbstractUser

# Tarea 2.1: Definir el Modelo de Usuario con Roles
class Usuario(AbstractUser):
    """
    Modelo de Usuario extendido para incluir roles según los requisitos.
    """
    class Rol(models.TextChoices):
        ADMINISTRADOR = 'ADMINISTRADOR', 'Administrador'
        FONTANERO = 'FONTANERO', 'Fontanero'
        AGRICULTOR = 'AGRICULTOR', 'Agricultor'

    # Campo para diferenciar roles 
    rol = models.CharField(max_length=50, choices=Rol.choices)

# Tarea 2.2: Definir el Modelo de Incidencia
class Incidencia(models.Model):
    """
    Modelo para registrar cada incidencia en el sistema de riego.
    """
    class Estado(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        EN_PROCESO = 'EN_PROCESO', 'En Proceso'
        RESUELTO = 'RESUELTO', 'Resuelto'

    # Campos basados en los requisitos funcionales:
    descripcion = models.TextField(help_text="Descripción detallada del problema") # 
    foto = models.ImageField(upload_to='incidencias_fotos/', help_text="Fotografía relacionada a la incidencia") # 
    
    # Ubicación precisa del problema 
    latitud = models.DecimalField(max_digits=22, decimal_places=16)
    longitud = models.DecimalField(max_digits=22, decimal_places=16)
    
    # Estado del reporte para consulta 
    estado = models.CharField(max_length=50, choices=Estado.choices, default=Estado.PENDIENTE)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    # Relaciones entre entidades 
    # Un agricultor crea la incidencia 
    agricultor_reporta = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='incidencias_reportadas')
    # Un fontanero es asignado para resolverla 
    fontanero_asignado = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidencias_asignadas')

    def __str__(self):
        return f"Incidencia #{self.id} - {self.estado} - Reportada por {self.agricultor_reporta.username}"