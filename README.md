# BrewMaster · Gestión de lotes y maduración

BrewMaster es un sistema empresarial para una microcervecería artesanal. Permite controlar insumos, lotes de cocinado y barriles, con trazabilidad y acceso protegido por autenticación JWT.

## Funcionalidades del Día 2

- Registro e inicio de sesión con JWT.
- Contraseñas cifradas con bcryptjs y nunca expuestas en respuestas.
- Middleware `Authorization: Bearer <token>` para proteger la API.
- CRUD completo de insumos, lotes y barriles.
- Validaciones de campos, valores únicos y relación barril-lote.
- Panel React con login, registro, cierre de sesión, tablas, formularios y confirmación de eliminación.

## Instalación y configuración

Requisitos: Node.js 18 o superior.

```bash
npm install
copy backend\.env.example backend\.env
npm run dev
```

Antes de ejecutar en un entorno real, edita `backend/.env` y cambia `JWT_SECRET` por una clave larga y privada. El archivo `.env` no se sube al repositorio.

La API queda en `http://localhost:4000` y React en `http://localhost:5173`.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Inicia back end y front end |
| `npm run dev:backend` | Inicia únicamente la API |
| `npm run dev:frontend` | Inicia únicamente React |
| `npm run test:api` | Prueba autenticación, CRUD, errores y relaciones |
| `npm run build` | Genera el build de producción del front end |

## Endpoints

Públicos:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Protegidos con JWT:

- `GET /api/auth/me`
- `GET|POST|PUT|DELETE /api/insumos[/:id]`
- `GET|POST|PUT|DELETE /api/lotes[/:id]`
- `GET|POST|PUT|DELETE /api/barriles[/:id]`
- `GET /api/dashboard`

## Documentación de la entrega

- [Documento del proyecto](./docs/01-documento-proyecto.md)
- [Modelo entidad-relación actualizado](./docs/02-modelo-datos.md)
- [Investigación sobre JWT](./docs/06-investigacion-token-jwt.md)
- [Guía de entrega del Día 2](./docs/07-guia-entrega-dia-2.md)
- [Colección Postman](./postman/BrewMaster.postman_collection.json)
- [ZIP de entrega Día 2](./ENTREGA_DIA_2_ALEX_AGUILAR_LOPEZ.zip)
- [Repositorio GitHub](https://github.com/Alexx-Aguilar/BrewMaster)

## Base de datos

Se utiliza SQLite mediante `sql.js`. La base se crea automáticamente en `backend/data/brewmaster.sqlite` y contiene datos demo de insumos, lotes y barriles. La carpeta de datos está excluida del repositorio para que cada instalación pueda crear su propia base.
