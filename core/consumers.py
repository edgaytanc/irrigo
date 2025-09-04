# Archivo: core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import MensajeChat, Incidencia, Usuario

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.incidencia_id = self.scope['url_route']['kwargs']['incidencia_id']
        self.room_group_name = f'chat_{self.incidencia_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_content = text_data_json['message']
        user_proxy = self.scope['user']

        # --- CAMBIO IMPORTANTE ---
        # Pasamos el ID del usuario en lugar del objeto proxy
        mensaje_obj = await self.save_message(user_proxy.id, message_content)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_content,
                'user': user_proxy.username,
                'fecha': str(mensaje_obj.fecha_envio)
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'user': event['user'],
            'fecha': event['fecha']
        }))

    @database_sync_to_async
    def save_message(self, user_id, message_content):
        # --- CORRECCIÓN AQUÍ ---
        # Buscamos la instancia real del usuario usando su ID
        user_instance = Usuario.objects.get(id=user_id)
        incidencia = Incidencia.objects.get(id=self.incidencia_id)
        
        # Ahora sí, creamos el mensaje con la instancia correcta de Usuario
        return MensajeChat.objects.create(
            incidencia=incidencia,
            autor=user_instance,
            contenido=message_content
        )