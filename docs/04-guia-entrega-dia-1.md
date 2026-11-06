# Guía de entrega · Mini Proyecto 1

## Orden recomendado del informe

### 1. Portada

Título: **BrewMaster · Gestión de lotes y maduración para una microcervecería**

Incluye nombre del estudiante, curso, docente y fecha.

### 2. Justificación empresarial

Usa el contenido de [01-documento-proyecto.md](./01-documento-proyecto.md). Explica que BrewMaster controla insumos, lotes de producción y barriles en maduración para mejorar la trazabilidad de una microcervecería.

### 3. Modelo de datos

Usa [02-modelo-datos.md](./02-modelo-datos.md). La captura del diagrama debe ir inmediatamente después de esta sección.

### 4. Evidencia visual del frontend

Inserta las capturas en este orden:

1. **Pantalla de Insumos:** demuestra el dashboard, las métricas y la tabla principal.
2. **Pantalla de Lotes:** demuestra la entidad de producción y los estados `Fermentando` y `Madurando`.
3. **Pantalla de Barriles:** demuestra la relación con los lotes, el CO₂, la ubicación y el estado.
4. **Formulario de creación o edición:** demuestra que React permite gestionar registros.

### 5. Evidencia de la API en Postman

Inserta las capturas en este orden:

1. `GET /api/health` con respuesta `200 OK`.
2. `GET /api/insumos` con respuesta `200 OK`.
3. `POST /api/insumos` con respuesta `201 Created`.
4. `GET /api/lotes` con respuesta `200 OK`.
5. `GET /api/barriles` con respuesta `200 OK`.
6. Petición inválida con respuesta `400 Bad Request`.

### 6. Estructura técnica

Incluye una captura del explorador de VS Code mostrando:

```text
backend/
frontend/
docs/
postman/
package.json
README.md
```

### 7. Conclusión

Indica que el sistema cuenta con una API REST en Node.js, una interfaz React, persistencia SQLite, validaciones y CRUD completo para las entidades principales.

## Organización de archivos de evidencia

Crea dentro del proyecto esta carpeta:

```text
docs/capturas/
```

Guarda las imágenes con estos nombres:

```text
01-dashboard-insumos.png
02-tabla-insumos.png
03-tabla-lotes.png
04-tabla-barriles.png
05-postman-health.png
06-postman-insumos.png
07-postman-crear-insumo.png
08-postman-lotes.png
09-postman-barriles.png
10-postman-validacion.png
```

No es obligatorio guardar capturas dentro del repositorio si el docente las recibe en un informe separado. Si las incluyes, no las pongas dentro de `src`; deben permanecer en `docs/capturas`.

## Correspondencia con las capturas actuales

- Capturas 1 y 2: dashboard y tabla de insumos.
- Captura 3: tabla de lotes.
- Captura 4: tabla de barriles.
- Capturas 5 y 9: respuestas correctas de API (`GET /api/barriles` y `GET /api/health`).
- Captura 6: respuesta correcta de `GET /api/lotes`.
- Captura 7: creación correcta de un insumo (`201 Created`).
- Captura 8: listado correcto de insumos (`200 OK`).
- Captura 10: validación incorrecta (`400 Bad Request`).

## Checklist final

- [ ] Documento de justificación incluido.
- [ ] Diagrama entidad-relación incluido.
- [ ] Capturas del frontend incluidas.
- [ ] Capturas de Postman incluidas.
- [ ] README incluido.
- [ ] Colección de Postman incluida.
- [ ] `npm run test:api` ejecutado correctamente.
- [ ] `npm run build` ejecutado correctamente.
- [ ] Proyecto subido al repositorio.
