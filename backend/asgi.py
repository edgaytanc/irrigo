# Archivo: backend/asgi.py

import os
from django.core.asgi import get_asgi_application

# 1. Establece la variable de entorno para la configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# 2. Llama a get_asgi_application() ANTES de importar tus rutas.
#    Esto inicializa Django y sus configuraciones.
django_asgi_app = get_asgi_application()

# 3. Ahora que Django está inicializado, podemos importar de forma segura
#    el resto de los componentes de Channels.
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