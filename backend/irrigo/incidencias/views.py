from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .serializers import RegistroSerializer, IncidenciaSerializer, HistorialIncidenciaSerializer
from .models import Incidencia, HistorialIncidencia
from .permissions import EsAgricultor, EsFontanero

class RegistroView(APIView):
    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Usuario registrado correctamente'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Agricultor: Crear incidencia
class IncidenciaCreateView(generics.CreateAPIView):
    serializer_class = IncidenciaSerializer
    permission_classes = [permissions.IsAuthenticated, EsAgricultor]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

# Agricultor: Listar incidencias
class MisIncidenciasView(generics.ListAPIView):
    serializer_class = IncidenciaSerializer
    permission_classes = [permissions.IsAuthenticated, EsAgricultor]

    def get_queryset(self):
        return Incidencia.objects.filter(usuario=self.request.user)
    

# Fontanero: Ver incidencias pendientes o en proceso
class IncidenciasAsignadasView(generics.ListAPIView):
    serializer_class = IncidenciaSerializer
    permission_classes = [permissions.IsAuthenticated, EsFontanero]

    def get_queryset(self):
        return Incidencia.objects.filter(estado__in=["PENDIENTE", "EN_PROCESO"])
    
# Fontanero: Actualizar estado y agrega historial
class ActualizarEstadoView(generics.UpdateAPIView):
    queryset = Incidencia.objects.all()
    serializer_class = IncidenciaSerializer
    permission_classes = [permissions.IsAuthenticated, EsFontanero]

    def update(self, request, *args, **kwargs):
        incidencia = self.get_object()
        nuevo_estado = request.data.get('estado')
        observacion = request.data.get('observacion', '')

        if nuevo_estado not in dict(Incidencia.ESTADOS):
            return Response({'error': 'Estado no válido'}, status=status.HTTP_400_BAD_REQUEST)

        incidencia.estado = nuevo_estado
        incidencia.save()

        HistorialIncidencia.objects.create(
            incidencia=incidencia,
            estado=nuevo_estado,
            observacion=observacion,
            actualizado_por=request.user
        )

        serializer = self.get_serializer(incidencia)
        return Response(serializer.data)