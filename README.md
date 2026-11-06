# BrewMaster · Gestión de lotes y maduración

Sistema empresarial para una microcervecería artesanal. Permite registrar insumos, lotes de cocinado y barriles en maduración, manteniendo trazabilidad entre las tres entidades.

## Entregables del día 1

- [Documento del proyecto](./docs/01-documento-proyecto.md)
- [Modelo entidad-relación](./docs/02-modelo-datos.md)
- [Pruebas de API para Postman](./docs/03-pruebas-api.md)

## Ejecutar

```bash
npm install
npm run dev
```

La API queda en `http://localhost:4000` y el frontend en `http://localhost:5173`.

También puedes ejecutarlos por separado:

```bash
npm run dev:backend
npm run dev:frontend
```

La base SQLite se crea automáticamente en `backend/data/brewmaster.sqlite` y se carga con datos demo en el primer arranque.

## API

| Entidad | Ruta base |
|---|---|
| Insumos | `/api/insumos` |
| Lotes | `/api/lotes` |
| Barriles | `/api/barriles` |

Cada entidad implementa `GET`, `GET /:id`, `POST`, `PUT /:id` y `DELETE /:id`.
