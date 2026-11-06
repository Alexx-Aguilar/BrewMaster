# BrewMaster — Documento de proyecto

## Tema y justificación empresarial

BrewMaster es un sistema para microcervecerías que necesitan controlar la trazabilidad de su producción. El sistema registra los insumos comprados, los lotes cocinados y los barriles que contienen cada lote durante la fermentación y maduración.

La solución reduce errores de inventario, facilita saber qué ingredientes se utilizaron en cada producción y permite consultar rápidamente la ubicación y el estado de cada barril. Es una necesidad real porque una microcervecería trabaja con lotes pequeños, múltiples estilos y tiempos de maduración que deben controlarse manualmente.

## Alcance

No incluye autenticación, usuarios, roles ni pagos. El foco es el CRUD empresarial de tres entidades relacionadas.

## Entidades

| Entidad | Propósito | Atributos principales |
|---|---|---|
| Insumos | Controlar materias primas disponibles | nombre, tipo, proveedor, stock en kg |
| Lotes de cocinado | Registrar cada producción | código, estilo, litros, fecha, estado, notas |
| Barriles | Controlar el producto en maduración | código, lote, capacidad, CO₂, estado, ubicación |

## Reglas de negocio y validaciones

- Los campos marcados como obligatorios no pueden estar vacíos.
- El stock no puede ser negativo y los litros/capacidad deben ser mayores que cero.
- El nivel de CO₂ debe estar entre 0 y 100 %.
- Un barril siempre pertenece a un lote existente.
- Los códigos de lotes y barriles son únicos.
- No se permite borrar un lote que todavía tenga barriles asociados.

## Tecnologías

Node.js + Express + SQLite en el back end; React + Vite en el front end; CSS responsive sin autenticación.
