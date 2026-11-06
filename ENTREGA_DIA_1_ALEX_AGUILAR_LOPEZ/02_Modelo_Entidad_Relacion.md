# Modelo entidad-relación

```mermaid
erDiagram
    INSUMOS {
        int id PK
        string nombre
        enum tipo
        string proveedor
        decimal stock_kg
        string unidad
    }
    LOTES {
        int id PK
        string codigo UK
        string estilo
        decimal litros_totales
        date fecha_cocinado
        enum estado
        string notas
    }
    LOTE_INSUMOS {
        int lote_id PK, FK
        int insumo_id PK, FK
        decimal cantidad_kg
    }
    BARRILES {
        int id PK
        string codigo UK
        int lote_id FK
        decimal capacidad_litros
        decimal nivel_co2
        enum estado
        string ubicacion
    }
    LOTES ||--o{ BARRILES : contiene
    LOTES ||--o{ LOTE_INSUMOS : utiliza
    INSUMOS ||--o{ LOTE_INSUMOS : participa
```

## Relaciones

- Un lote puede dividirse en muchos barriles (1:N).
- Un lote puede utilizar muchos insumos y un insumo puede participar en muchos lotes (N:M), resuelto con `lote_insumos`.
- `lote_insumos` deja preparada la trazabilidad de cantidades utilizadas para una siguiente iteración del CRUD.
