# Proyecto de Gestión de Incidencias de Riego "Irrigo"

## Información General

**Irrigo** es una aplicación web diseñada para solucionar la problemática de la gestión y seguimiento de incidencias en sistemas de riego. Esta plataforma centraliza el reporte de problemas por parte de los agricultores y facilita su asignación y resolución por parte de fontaneros, todo bajo la supervisión de un administrador.

El proyecto está construido como un Producto Mínimo Viable (MVP) y utiliza las siguientes tecnologías:

* **Backend:** Desarrollado con **Django** y **Django REST Framework**, ofreciendo una API robusta para la gestión de usuarios, roles e incidencias.
* **Frontend:** Construido con **React**, proporcionando una interfaz de usuario moderna e interactiva para los diferentes roles de usuario.

El sistema define tres roles de usuario principales:
* **Agricultor:** Puede reportar nuevas incidencias, adjuntando descripción, ubicación GPS y fotografías.
* **Fontanero:** Recibe incidencias asignadas, puede actualizar su estado (en proceso, resuelto) y visualizar los detalles para su reparación.
* **Administrador:** Tiene una visión completa del sistema, puede gestionar usuarios y asignar las incidencias reportadas a los fontaneros disponibles.

---

## Instalación

Sigue estos pasos para clonar e instalar el proyecto en tu entorno local.

### 1. Clonar el Repositorio

Abre tu terminal y clona el repositorio desde GitHub:

```bash
git clone [https://github.com/edgaytanc/irrigo.git](https://github.com/edgaytanc/irrigo.git)
cd irrigo
```

### 2. Configurar el backend (Django)

El backend requiere un entorno virtual de Python para gestionar sus dependencias.

#### En Windows

Crea un entorno virtual:

```bash
python -m venv venv
.\\venv\\Scripts\\activate
pip install -r requirements.txt
```

#### En Linux

Crea un entorno virtual:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Aplicar las migraciones y ejecutar el servidor

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### 3. Configurar el frontend (React)
El frontend utiliza Node.js y npm para la gestión de paquetes.

Navega al directorio del FrontEnd

```bash
cd frontend
```

Instala las dependencias de Node.js

```bash
npm install
```

Ejecuta la aplicacion de React

```bash
npm start
```

 La aplicación se abrirá automáticamente en tu navegador en http://localhost:3000.

---

## Estructura del proyecto

```
irrigo/
├── backend/   # Configuración del proyecto Django
├── core/      # Aplicación principal con modelos, vistas y serializadores
├── frontend/  # Aplicación React que consume la API
├── manage.py  # Utilidad de administración de Django
└── requirements.txt
```

* **backend/** contiene los archivos de configuración de Django, incluido `settings.py`.
* **core/** es la aplicación donde se definen los modelos, las vistas y los endpoints de la API.
* **frontend/** alberga el código de React creado con *Create React App*.

## Ejemplos de uso del API

A continuación se muestran algunos endpoints clave. El punto de entrada es `http://127.0.0.1:8000/` cuando se ejecuta el servidor local.

### Obtener token JWT

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username": "usuario", "password": "contraseña"}'
```

### Listar incidencias

```bash
curl http://127.0.0.1:8000/api/incidencias/
```

### Asignar un fontanero a una incidencia (requiere rol de administrador)

```bash
curl -X PATCH http://127.0.0.1:8000/api/incidencias/<id>/assign/ \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"fontanero_id": 2}'
```

### Actualizar el estado de una incidencia

```bash
curl -X PATCH http://127.0.0.1:8000/api/incidencias/<id>/update_status/ \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"estado": "EN_PROCESO"}'
```
