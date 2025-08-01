# Archivo: core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, IncidenciaViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'incidencias', IncidenciaViewSet)


urlpatterns = [
    path('', include(router.urls)),
]