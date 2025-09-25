# /create_superuser.py
import os
import django

# Configura Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Obtiene las credenciales desde variables de entorno
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

# Revisa si el superusuario ya existe
if not User.objects.filter(username=username).exists():
    print(f"Creando superusuario: {username}")
    User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
else:
    print(f"Superusuario '{username}' ya existe. Saltando creación.")