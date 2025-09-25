#!/bin/sh

# Salir inmediatamente si un comando falla
set -e

# Aplicar migraciones de la base de datos
echo "Aplicando migraciones de la base de datos..."
python manage.py migrate

# Crear el superusuario (si no existe)
echo "Revisando/Creando superusuario..."
python create_superuser.py

# Ejecuta el comando principal del contenedor (el que está en CMD)
exec "$@"