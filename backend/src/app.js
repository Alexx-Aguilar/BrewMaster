require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'brewmaster-development-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
app.use(cors());
app.use(express.json());

const publicUser = ({ id, nombre, correo, fecha_creacion }) => ({ id, nombre, correo, fecha_creacion });
const tokenFor = (user) => jwt.sign({ sub: user.id, correo: user.correo, nombre: user.nombre }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado', detail: 'Se requiere un token Bearer' });
  try { req.auth = jwt.verify(token, JWT_SECRET); next(); } catch { res.status(401).json({ error: 'No autorizado', detail: 'Token inválido o vencido' }); }
}

const schemas = {
  insumos: { table: 'insumos', fields: ['nombre', 'tipo', 'proveedor', 'stock_kg', 'unidad'], required: ['nombre', 'tipo', 'proveedor', 'stock_kg'], numeric: ['stock_kg'] },
  lotes: { table: 'lotes', fields: ['codigo', 'estilo', 'litros_totales', 'fecha_cocinado', 'estado', 'notas'], required: ['codigo', 'estilo', 'litros_totales', 'fecha_cocinado'], numeric: ['litros_totales'] },
  barriles: { table: 'barriles', fields: ['codigo', 'lote_id', 'capacidad_litros', 'nivel_co2', 'estado', 'ubicacion'], required: ['codigo', 'lote_id', 'capacidad_litros', 'nivel_co2', 'estado', 'ubicacion'], numeric: ['lote_id', 'capacidad_litros', 'nivel_co2'] }
};
function validate(schema, body, partial = false) {
  const errors = partial ? [] : schema.required.filter((field) => body[field] === undefined || body[field] === '').map((field) => `${field} es obligatorio`);
  schema.numeric.forEach((field) => { if (body[field] !== undefined && (typeof body[field] !== 'number' || Number.isNaN(body[field]))) errors.push(`${field} debe ser numérico`); });
  if (schema.table === 'insumos' && body.stock_kg < 0) errors.push('stock_kg no puede ser negativo');
  if (schema.table === 'lotes' && body.litros_totales <= 0) errors.push('litros_totales debe ser mayor que cero');
  if (schema.table === 'barriles' && (body.nivel_co2 < 0 || body.nivel_co2 > 100)) errors.push('nivel_co2 debe estar entre 0 y 100');
  return errors;
}
async function validateRelations(schema, body, db) {
  if (schema.table === 'barriles' && body.lote_id !== undefined && !(await db.query('SELECT id FROM lotes WHERE id = ?', [body.lote_id]))[0]) return 'El lote relacionado no existe';
  return null;
}
function registerCrud(resource, schema) {
  const base = `/api/${resource}`;
  app.get(base, authMiddleware, async (req, res, next) => { try { const db = await database; const rows = schema.table === 'barriles' ? await db.query('SELECT b.*, l.codigo AS lote_codigo, l.estilo AS lote_estilo FROM barriles b JOIN lotes l ON l.id = b.lote_id ORDER BY b.id DESC') : await db.query(`SELECT * FROM ${schema.table} ORDER BY id DESC`); res.json(rows); } catch (e) { next(e); } });
  app.get(`${base}/:id`, authMiddleware, async (req, res, next) => { try { const db = await database; const row = (await db.query(`SELECT * FROM ${schema.table} WHERE id = ?`, [req.params.id]))[0]; if (!row) return res.status(404).json({ error: 'Registro no encontrado' }); res.json(row); } catch (e) { next(e); } });
  app.post(base, authMiddleware, async (req, res, next) => { const errors = validate(schema, req.body || {}); if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors }); try { const db = await database; const relationError = await validateRelations(schema, req.body, db); if (relationError) return res.status(404).json({ error: relationError }); const fields = schema.fields.filter((field) => req.body[field] !== undefined); const result = await db.execute(`INSERT INTO ${schema.table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, fields.map((field) => req.body[field])); res.status(201).json((await db.query(`SELECT * FROM ${schema.table} WHERE id = ?`, [result.lastInsertRowid]))[0]); } catch (e) { if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'El código ya existe' }); next(e); } });
  app.put(`${base}/:id`, authMiddleware, async (req, res, next) => { const errors = validate(schema, req.body || {}, true); if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors }); try { const db = await database; const relationError = await validateRelations(schema, req.body, db); if (relationError) return res.status(404).json({ error: relationError }); const fields = schema.fields.filter((field) => req.body[field] !== undefined); if (!fields.length) return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar' }); const result = await db.execute(`UPDATE ${schema.table} SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`, [...fields.map((field) => req.body[field]), req.params.id]); if (!result.changes) return res.status(404).json({ error: 'Registro no encontrado' }); res.json((await db.query(`SELECT * FROM ${schema.table} WHERE id = ?`, [req.params.id]))[0]); } catch (e) { if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'El código ya existe' }); next(e); } });
  app.delete(`${base}/:id`, authMiddleware, async (req, res, next) => { try { const db = await database; const result = await db.execute(`DELETE FROM ${schema.table} WHERE id = ?`, [req.params.id]); if (!result.changes) return res.status(404).json({ error: 'Registro no encontrado' }); res.status(204).send(); } catch (e) { res.status(409).json({ error: 'No se puede eliminar: el registro está relacionado con otros datos' }); } });
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'BrewMaster API', authentication: 'JWT' }));
app.post('/api/auth/register', async (req, res, next) => { const { nombre, correo, password } = req.body || {}; const errors = []; if (!nombre?.trim()) errors.push('nombre es obligatorio'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo || '')) errors.push('correo debe tener un formato válido'); if (!password || password.length < 8) errors.push('password debe tener mínimo 8 caracteres'); if (errors.length) return res.status(400).json({ error: 'Datos inválidos', details: errors }); try { const db = await database; const normalized = correo.toLowerCase().trim(); if ((await db.query('SELECT id FROM usuarios WHERE correo = ?', [normalized]))[0]) return res.status(400).json({ error: 'El correo ya está registrado' }); const passwordHash = await bcrypt.hash(password, 12); const result = await db.execute('INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)', [nombre.trim(), normalized, passwordHash]); const user = (await db.query('SELECT id, nombre, correo, fecha_creacion FROM usuarios WHERE id = ?', [result.lastInsertRowid]))[0]; res.status(201).json(publicUser(user)); } catch (e) { next(e); } });
app.post('/api/auth/login', async (req, res, next) => { const { correo, password } = req.body || {}; if (!correo || !password) return res.status(400).json({ error: 'correo y password son obligatorios' }); try { const db = await database; const user = (await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo.toLowerCase().trim()]))[0]; if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Credenciales incorrectas' }); res.json({ token: tokenFor(user), usuario: publicUser(user) }); } catch (e) { next(e); } });
app.get('/api/auth/me', authMiddleware, async (req, res, next) => { try { const db = await database; const user = (await db.query('SELECT id, nombre, correo, fecha_creacion FROM usuarios WHERE id = ?', [req.auth.sub]))[0]; if (!user) return res.status(401).json({ error: 'Usuario no encontrado' }); res.json(publicUser(user)); } catch (e) { next(e); } });
Object.entries(schemas).forEach(([resource, schema]) => registerCrud(resource, schema));
app.get('/api/dashboard', authMiddleware, async (req, res, next) => { try { const db = await database; res.json({ insumos: (await db.query('SELECT COUNT(*) AS count FROM insumos'))[0].count, lotes: (await db.query('SELECT COUNT(*) AS count FROM lotes'))[0].count, barriles: (await db.query('SELECT COUNT(*) AS count FROM barriles'))[0].count, litrosEnProduccion: (await db.query("SELECT COALESCE(SUM(litros_totales), 0) AS total FROM lotes WHERE estado != 'Listo'"))[0].total }); } catch (e) { next(e); } });
app.use((err, req, res, next) => res.status(500).json({ error: 'Error interno del servidor', detail: process.env.NODE_ENV === 'production' ? undefined : err.message }));
if (require.main === module) app.listen(PORT, () => console.log(`BrewMaster API escuchando en http://localhost:${PORT}`));
module.exports = app;
