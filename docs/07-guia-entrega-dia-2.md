# Entrega Día 2 · BrewMaster

## Archivos que se deben entregar

1. Repositorio GitHub: `https://github.com/Alexx-Aguilar/BrewMaster`
2. Código del proyecto con `backend/`, `frontend/`, `docs/` y `postman/`.
3. Informe [06-investigacion-token-jwt.md](./06-investigacion-token-jwt.md).
4. Modelo actualizado con Usuario: [02-modelo-datos.md](./02-modelo-datos.md).
5. Colección [BrewMaster.postman_collection.json](../postman/BrewMaster.postman_collection.json).
6. Evidencias visuales del login, registro, CRUD y respuestas 401/400/404.
7. README con instalación, configuración de `.env` y ejecución.

## Comprobación antes de subir

```bash
npm install
npm run test:api
npm run build
```

Para iniciar la aplicación:

```bash
copy backend\.env.example backend\.env
npm run dev
```

Luego abrir `http://localhost:5173`, registrar un usuario y probar login, cierre de sesión y CRUDs.

Nunca se debe subir `backend/.env` con una clave real. Solo se sube `backend/.env.example`.
