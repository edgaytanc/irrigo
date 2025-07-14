# Archivo: core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

# Definimos una clase de administración personalizada que hereda de UserAdmin
class UsuarioAdmin(UserAdmin):
    """
    Personalización del panel de administración para el modelo Usuario.
    """
    # Copiamos los fieldsets existentes de UserAdmin y añadimos nuestro campo 'rol'
    # Esto define cómo se verá el formulario para *editar* un usuario existente.
    fieldsets = UserAdmin.fieldsets + (
        # Creamos una nueva sección en el formulario del admin llamada 'Campos Personalizados'
        ('Campos Personalizados', {'fields': ('rol',)}),
    )
    
    # Hacemos lo mismo para el formulario de *creación* de un nuevo usuario.
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Campos Personalizados', {'fields': ('rol',)}),
    )

# Le decimos a Django que registre nuestro modelo Usuario y que use la clase
# personalizada UsuarioAdmin para su interfaz.
admin.site.register(Usuario, UsuarioAdmin)