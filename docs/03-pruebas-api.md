# Pruebas de API

## Preparación

1. Ejecutar `npm install`.
2. Ejecutar `npm run dev:backend`.
3. Abrir Postman o Thunder Client y usar `http://localhost:4000`.

## Casos de prueba

### Crear un insumo

`POST /api/insumos`

```json
{
  "nombre": "Malta Munich",
  "tipo": "Malta",
  "proveedor": "Maltería Central",
  "stock_kg": 35,
  "unidad": "kg"
}
```

Esperado: `201 Created` y el objeto creado.

### Listar insumos

`GET /api/insumos`

Esperado: `200 OK` y un arreglo JSON.

### Validación

Enviar `stock_kg: -4` en el POST. Esperado: `400 Bad Request` con `details`.

### Resto de endpoints

Las rutas `/api/lotes` y `/api/barriles` ofrecen el mismo conjunto: `GET`, `GET /:id`, `POST`, `PUT /:id` y `DELETE /:id`.
