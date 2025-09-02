# Archivo: core/views.py
from rest_framework import viewsets, permissions
from .models import Usuario, Incidencia, Notificacion
from .serializers import UsuarioSerializer, IncidenciaSerializer, NotificacionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import MyTokenObtainPairSerializer


# Permiso personalizado para aseturar que solo los administadores pueden crear usuarios
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado que permite a los administradores crear usuarios,
    pero solo permite lectura a otros usuarios.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.rol == 'ADMINISTRADOR'
    
class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar las operaciones CRUD de los usuarios.
    Permite a los administradores crear, actualizar y eliminar usuarios,
    mientras que otros usuarios solo pueden ver la lista de usuarios.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    # --- AÑADE ESTE MÉTODO ---
    def get_queryset(self):
        """
        Filtra opcionalmente los usuarios por el rol especificado en la URL.
        Ej: /api/usuarios/?rol=FONTANERO
        """
        queryset = super().get_queryset()
        rol = self.request.query_params.get('rol')
        if rol:
            queryset = queryset.filter(rol=rol.upper())
        return queryset

    
class IncidenciaViewSet(viewsets.ModelViewSet):
    queryset = Incidencia.objects.all().order_by('-fecha_creacion')
    serializer_class = IncidenciaSerializer
    # Solo usuarios autenticados pueden ver o crear incidencias
    permission_classes = [permissions.IsAuthenticated]

    # --- PARA USO DE FILTROS ---
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['estado', 'fontanero_asignado'] # <-- Define los campos filtrables

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario autenticado como el que reporta la incidencia
        serializer.save(agricultor_reporta=self.request.user)

    # --- AÑADE ESTA NUEVA ACCIÓN ---
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def assign(self, request, pk=None):
        """
        Acción para que un administrador asigne un fontanero a una incidencia.
        Espera un body con: {"fontanero_id": <id_del_fontanero>}
        """
        incidencia = self.get_object()
        fontanero_id = request.data.get('fontanero_id')

        if not fontanero_id:
            return Response({'error': 'Se requiere el ID del fontanero.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            fontanero = Usuario.objects.get(id=fontanero_id, rol='FONTANERO')
        except Usuario.DoesNotExist:
            return Response({'error': 'El fontanero especificado no existe o no tiene el rol correcto.'}, status=status.HTTP_404_NOT_FOUND)

        incidencia.fontanero_asignado = fontanero
        incidencia.estado = Incidencia.Estado.EN_PROCESO # Opcional: cambiar estado a "En Proceso" al asignar
        incidencia.save()

        #--- LÓGICA PARA NOTIFICAR AL FONTANERO ---
        Notificacion.objects.create(
            destinatario=fontanero,
            mensaje=f"Se te ha asignado la incidencia #{incidencia.id}.",
            incidencia=incidencia
        )

        serializer = self.get_serializer(incidencia)
        return Response(serializer.data)
    
    # --- AÑADE ESTA OTRA ACCIÓN ---
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Acción para que un fontanero actualice el estado de su incidencia.
        Espera un body con: {"estado": "NUEVO_ESTADO"}
        """
        incidencia = self.get_object()

        # Verificación de permisos: solo el fontanero asignado o un admin pueden cambiar el estado.
        if request.user != incidencia.fontanero_asignado and not request.user.is_staff:
            return Response({'error': 'No tienes permiso para actualizar esta incidencia.'}, status=status.HTTP_403_FORBIDDEN)

        nuevo_estado = request.data.get('estado')
        if nuevo_estado not in Incidencia.Estado.values:
            return Response({'error': 'Estado no válido.'}, status=status.HTTP_400_BAD_REQUEST)

        incidencia.estado = nuevo_estado
        incidencia.save()

        # --- LÓGICA PARA NOTIFICAR AL AGRICULTOR ---
        agricultor = incidencia.agricultor_reporta
        Notificacion.objects.create(
            destinatario=agricultor,
            mensaje=f"El estado de tu incidencia #{incidencia.id} ha sido actualizado a {nuevo_estado}.",
            incidencia=incidencia
        )

        serializer = self.get_serializer(incidencia)
        return Response(serializer.data)
    
    
class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Devuelve solo las notificaciones del usuario autenticado.
        """
        return self.request.user.notificaciones.all()
    
    @action(detail=True, methods=['patch'])
    def marcar_leida(self, request, pk=None):
        """
        Acción para marcar una notificación como leída.
        """
        notificacion = self.get_object()

        if notificacion.destinatario == request.user:
            notificacion.leida = True
            notificacion.save()
            return Response({'status': 'Notificación marcada como leída'})
        else:
            return Response({'error': 'No tienes permiso para modificar esta notificación.'}, status=status.HTTP_403_FORBIDDEN)


class MyTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para la obtención de tokens JWT.
    Utiliza un serializador personalizado para incluir el rol del usuario.
    """
    serializer_class = MyTokenObtainPairSerializer