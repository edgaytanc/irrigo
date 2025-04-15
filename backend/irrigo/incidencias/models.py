from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class Usuario(AbstractUser):
    ROL_CHOICES = [
        ('AGRICULTOR', 'Agricultor'),
        ('FONTANERO', 'Fontanero'),
        ('ADMINISTRADOR', 'Administrador'),
    ]
    rol = models.CharField(max_length=20, choices=ROL_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"


class Incidencia(models.Model):
    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROGRESO', 'En progreso'),
        ('RESUELTA', 'Resuelta'),
    ]
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='incidencias')
    descripcion = models.TextField()
    foto = models.ImageField(upload_to='fotos_incidencias/', null=True, blank=True)
    ubicacion = models.CharField(max_length=255)  # Puedes usar lat/lng o dirección
    estado = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Incidencia de {self.usuario.username} - {self.estado}"
    

class HistorialIncidencia(models.Model):
    incidencia = models.ForeignKey(Incidencia, on_delete=models.CASCADE, related_name='historial')
    estado = models.CharField(max_length=20, choices=Incidencia.ESTADOS)
    observacion = models.TextField(null=True, blank=True)
    actualizado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    fecha_actualizacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Historial {self.incidencia.id} - {self.estado}"