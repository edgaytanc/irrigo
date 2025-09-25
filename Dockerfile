# Usa una imagen oficial de Python como imagen base
FROM python:3.12-slim

# Establece el directorio de trabajo en /app
WORKDIR /app

# Instala dependencias para que el entrypoint funcione correctamente
RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*

# Copia el archivo de requerimientos al contenedor
COPY requirements.txt .

# Instala las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la aplicación al contenedor
COPY . .

# Copia los scripts y dales permiso de ejecución
COPY create_superuser.py .
COPY entrypoint.sh .
RUN dos2unix entrypoint.sh && chmod +x entrypoint.sh

# Expone el puerto 8000
EXPOSE 8000

# Define el script de entrada
ENTRYPOINT ["./entrypoint.sh"]

# Define el comando por defecto que recibirá el entrypoint
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]