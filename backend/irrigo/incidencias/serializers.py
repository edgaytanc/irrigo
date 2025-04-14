from rest_framework import serializers
from django.contrib.auth import get_user_model

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
