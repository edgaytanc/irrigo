from django.urls import path
from .views import RegistroView, IncidenciaCreateView, MisIncidenciasView, IncidenciasAsignadasView, ActualizarEstadoView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegistroView.as_view(), name='registro'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('incidencias/crear/', IncidenciaCreateView.as_view(), name='crear_incidencia'),
    path('incidencias/mias/', MisIncidenciasView.as_view(), name='mis_incidencias'),
    path('incidencias/asignadas/', IncidenciasAsignadasView.as_view(), name='incidencias_asignadas'),
    path('incidencias/<int:pk>/actualizar_estado/', ActualizarEstadoView.as_view(), name='actualizar_estado'),
]
