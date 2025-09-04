# Archivo: backend/asgi.py

import os
from django.core.asgi import get_asgi_application

# 1. Establece la variable de entorno para la configuración de Django.
#    Esto es lo primero que debe ocurrir.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# 2. Llama a get_asgi_application() ANTES de cualquier otra importación de tu proyecto.
#    Esta función es la que carga y configura Django.
django_asgi_app = get_asgi_application()

# 3. Ahora que Django está configurado, podemos importar de forma segura
#    los componentes de Channels que dependen de él.
from channels.routing import ProtocolTypeRouter, URLRouter
from core.middleware import JwtAuthMiddleware
import core.routing

# 4. Define la aplicación principal del ProtocolTypeRouter
application = ProtocolTypeRouter({
    "http": django_asgi_app, # Usa la aplicación HTTP que ya inicializamos
    "websocket": JwtAuthMiddleware(
        URLRouter(
            core.routing.websocket_urlpatterns
        )
    ),
})