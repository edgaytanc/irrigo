from rest_framework.permissions import BasePermission

class EsAgricultor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'AGRICULTOR'

class EsFontanero(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'FONTANERO'

class EsAdministrador(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'ADMINISTRADOR'
