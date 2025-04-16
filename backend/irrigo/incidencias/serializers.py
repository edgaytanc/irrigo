from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Incidencia, HistorialIncidencia, Asignacion


Usuario = get_user_model()

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ('username', 'email', 'password', 'rol')

    def create(self, validated_data):
        usuario = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            rol=validated_data['rol']
        )
        return usuario
    

class HistorialIncidenciaSerializer(serializers.ModelSerializer):
    actualizado_por = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = HistorialIncidencia
        fields = '__all__'
        read_only_fields = ('actualizado_por', 'fecha_actualizacion', 'incidencia')


class IncidenciaSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField(read_only=True)
    historial = HistorialIncidenciaSerializer(many=True, read_only=True)

    class Meta:
        model = Incidencia
        fields = '__all__'
        read_only_fields = ('usuario', 'estado', 'fecha_creacion')


class AsignacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignacion
        fields = '__all__'
        read_only_fields = ('fecha_asignacion',)

