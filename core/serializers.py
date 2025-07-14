# Archivo: core/serializers.py
from rest_framework import serializers
from .models import Usuario, Incidencia

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
            
        }
        
    def create(self, validated_data):
        """
        Override create method to handle password hashing.
        """
        user = Usuario.objects.create_user(**validated_data)
        user.save()
        return user


class IncidenciaSerializer(serializers.ModelSerializer):
    # Para mostrar el nombre del agricultor en lugar de solo su ID
    agricultor_reporta_username = serializers.ReadOnlyField(source='agricultor_reporta.username')

    class Meta:
        model = Incidencia
        # Incluimos todos los campos del modelo
        fields = '__all__'
        # El agricultor que reporta no se debe establecer manualmente, se tomará del usuario autenticado
        read_only_fields = ('agricultor_reporta',)