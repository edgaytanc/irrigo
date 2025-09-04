# Archivo: core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import MensajeChat, Incidencia, Usuario

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.incidencia_id = self.scope['url_route']['kwargs']['incidencia_id']
        self.room_group_name = f'chat_{self.incidencia_id}'

        # Se une a la "sala" o grupo de la incidencia
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Abandona la sala
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Recibe un mensaje desde el WebSocket (frontend)
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_content = text_data_json['message']
        user_proxy = self.scope['user']

        # Guarda el mensaje en la base de datos
        mensaje_obj = await self.save_message(user_proxy.id, message_content)

        # Envía el mensaje a todos en la sala
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_content,
                'user': user_proxy.username,
                'fecha': str(mensaje_obj.fecha_envio)
            }
        )

    # Manejador para enviar el mensaje a los clientes de la sala
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'user': event['user'],
            'fecha': event['fecha']
        }))

    @database_sync_to_async
    def save_message(self, user_id, message_content):
        """
        Función auxiliar que interactúa con la base de datos de forma segura.
        """
        # --- CORRECCIÓN AQUÍ ---
        # Buscamos la instancia real del usuario usando su ID antes de crear el mensaje.
        user_instance = Usuario.objects.get(id=user_id)
        incidencia = Incidencia.objects.get(id=self.incidencia_id)
        
        return MensajeChat.objects.create(
            incidencia=incidencia,
            autor=user_instance,
            contenido=message_content
        )