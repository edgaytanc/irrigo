from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ROL_CHOICES = [
        ('AGRICULTOR', 'Agricultor'),
        ('FONTANERO', 'Fontanero'),
        ('ADMINISTRADOR', 'Administrador'),
    ]
    rol = models.CharField(max_length=20, choices=ROL_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"
