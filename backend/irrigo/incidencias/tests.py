from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Incidencia
import json

Usuario = get_user_model()

class IncidenciasTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Crear usuarios
        self.agricultor = Usuario.objects.create_user(username="agri", password="pass123", rol="AGRICULTOR")
        self.fontanero = Usuario.objects.create_user(username="fonta", password="pass123", rol="FONTANERO")

        # Token agricultor
        response = self.client.post(reverse('login'), {"username": "agri", "password": "pass123"})
        self.token_agricultor = response.data['access']

        # Token fontanero
        response = self.client.post(reverse('login'), {"username": "fonta", "password": "pass123"})
        self.token_fontanero = response.data['access']

    def test_crear_incidencia_agricultor(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_agricultor}')
        data = {
            "descripcion": "Tubería rota en la parcela 4",
            "ubicacion": "14.634915,-90.506882"
        }
        response = self.client.post(reverse('crear_incidencia'), data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Incidencia.objects.count(), 1)

    def test_listar_mis_incidencias(self):
        Incidencia.objects.create(usuario=self.agricultor, descripcion="Prueba", ubicacion="test")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_agricultor}')
        response = self.client.get(reverse('mis_incidencias'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_fontanero_ver_incidencias(self):
        Incidencia.objects.create(usuario=self.agricultor, descripcion="Sin agua", ubicacion="test")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_fontanero}')
        response = self.client.get(reverse('incidencias_asignadas'))
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

    def test_fontanero_actualiza_estado(self):
        incidencia = Incidencia.objects.create(usuario=self.agricultor, descripcion="Fuga", ubicacion="test")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_fontanero}')
        data = {
            "estado": "EN_PROCESO",
            "observacion": "Se revisará mañana"
        }
        response = self.client.patch(
            reverse('actualizar_estado', args=[incidencia.id]),
            data=json.dumps(data),
            content_type='application/json'  # 👈 aquí está la clave
        )
        print("RESPONSE:", response.data)
        self.assertEqual(response.status_code, 200)


