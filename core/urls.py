# Archivo: core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import UsuarioViewSet, IncidenciaViewSet, NotificacionViewSet, EstadisticasView, MensajeChatViewSet, DashboardSummaryView

# El router principal
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'incidencias', IncidenciaViewSet)
router.register(r'notificaciones', NotificacionViewSet, basename='notificaciones')

# Router anidado para los mensajes de chat dentro de las incidencias
incidencias_router = routers.NestedSimpleRouter(router, r'incidencias', lookup='incidencia')
incidencias_router.register(r'mensajes', MensajeChatViewSet, basename='incidencia-mensajes')



urlpatterns = [
    path('', include(router.urls)),
    path('', include(incidencias_router.urls)),
    path('estadisticas/', EstadisticasView.as_view(), name='estadisticas'),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]