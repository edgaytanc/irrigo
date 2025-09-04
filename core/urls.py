# Archivo: core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, IncidenciaViewSet, NotificacionViewSet, EstadisticasView

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'incidencias', IncidenciaViewSet)
router.register(r'notificaciones', NotificacionViewSet, basename='notificaciones')



urlpatterns = [
    path('', include(router.urls)),
    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
]