const express = require('express');
const cors = require('cors');
const database = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const schemas = {
  insumos: { table: 'insumos', fields: ['nombre', 'tipo', 'proveedor', 'stock_kg', 'unidad'], required: ['nombre', 'tipo', 'proveedor', 'stock_kg'], numeric: ['stock_kg'] },
  lotes: { table: 'lotes', fields: ['codigo', 'estilo', 'litros_totales', 'fecha_cocinado', 'estado', 'notas'], required: ['codigo', 'estilo', 'litros_totales', 'fecha_cocinado'], numeric: ['litros_totales'] },
  barriles: { table: 'barriles', fields: ['codigo', 'lote_id', 'capacidad_litros', 'nivel_co2', 'estado', 'ubicacion'], required: ['codigo', 'lote_id', 'capacidad_litros', 'nivel_co2', 'estado', 'ubicacion'], numeric: ['lote_id', 'capacidad_litros', 'nivel_co2'] }
};

function validate(schema, body) {
  const errors = schema.required.filter((field) => body[field] === undefined || body[field] === '').map((field) => `${field} es obligatorio`);
  schema.numeric.forEach((field) => { if (body[field] !== undefined && (typeof body[field] !== 'number' || Number.isNaN(body[field]))) errors.push(`${field} debe ser numérico`); });
  if (schema.table === 'insumos' && body.stock_kg < 0) errors.push('stock_kg no puede ser negativo');
  if (schema.table === 'lotes' && body.litros_totales <= 0) errors.push('litros_totales debe ser mayor que cero');
  if (schema.table === 'barriles' && (body.nivel_co2 < 0 || body.nivel_co2 > 100)) errors.push('nivel_co2 debe estar entre 0 y 100');
  return errors;
}

function registerCrud(resource, schema) {
  const base = `/api/${resource}`;
  app.get(base, async (req, res, next) => { try { const db = await database; res.json(db.query(`SELECT * FROM ${schema.table} ORDER BY id DESC`)); } catch (e) { next(e); } });
  app.get(`${base}/:id`, async (req, res, next) => { try { const db = await database; const row = db.query(`SELECT * FROM ${schema.table} WHERE id = ?`, [req.params.id])[0]; if (!row) return res.status(404).json({ error: 'Registro no encontrado' }); res.json(row); } catch (e) { next(e); } });
  app.post(base, async (req, res, next) => { const errors = validate(schema, req.body); if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors }); try { const db = await database; const fields = schema.fields.filter((field) => req.body[field] !== undefined); const result = db.execute(`INSERT INTO ${schema.table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, fields.map((field) => req.body[field])); res.status(201).json(db.query(`SELECT * FROM ${schema.table} WHERE id = ?`, [result.lastInsertRowid])[0]); } catch (e) { if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'El código ya existe' }); next(e); } });
  app.put(`${base}/:id`, async (req, res, next) => { const errors = validate(schema, req.body); if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors }); try { const db = await database; const fields = schema.fields.filter((field) => req.body[field] !== undefined); const result = db.execute(`UPDATE ${schema.table} SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`, [...fields.map((field) => req.body[field]), req.params.id]); if (!result.changes) return res.status(404).json({ error: 'Registro no encontrado' }); res.json(db.query(`SELECT * FROM ${schema.table} WHERE id = ?`, [req.params.id])[0]); } catch (e) { next(e); } });
  app.delete(`${base}/:id`, async (req, res, next) => { try { const db = await database; const result = db.execute(`DELETE FROM ${schema.table} WHERE id = ?`, [req.params.id]); if (!result.changes) return res.status(404).json({ error: 'Registro no encontrado' }); res.status(204).send(); } catch (e) { res.status(409).json({ error: 'No se puede eliminar: el registro está relacionado con otros datos' }); } });
}

Object.entries(schemas).forEach(([resource, schema]) => registerCrud(resource, schema));
app.get('/api/dashboard', async (req, res, next) => { try { const db = await database; res.json({ insumos: db.query('SELECT COUNT(*) AS count FROM insumos')[0].count, lotes: db.query('SELECT COUNT(*) AS count FROM lotes')[0].count, barriles: db.query('SELECT COUNT(*) AS count FROM barriles')[0].count, litrosEnProduccion: db.query("SELECT COALESCE(SUM(litros_totales), 0) AS total FROM lotes WHERE estado != 'Listo'")[0].total }); } catch (e) { next(e); } });
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'BrewMaster API' }));
app.use((err, req, res, next) => res.status(500).json({ error: 'Error interno del servidor', detail: err.message }));

if (require.main === module) app.listen(PORT, () => console.log(`BrewMaster API escuchando en http://localhost:${PORT}`));
module.exports = app;
