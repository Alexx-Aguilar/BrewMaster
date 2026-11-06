const assert = require('node:assert');
const app = require('./app');
const http = require('node:http');

const server = app.listen(0, async () => {
  const url = `http://localhost:${server.address().port}`;
  const request = async (path, options = {}) => { const response = await fetch(url + path, options); return { status: response.status, body: response.status === 204 ? null : await response.json() }; };
  const json = (body, token) => ({ method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  try {
    const health = await request('/api/health'); assert.equal(health.status, 200);
    const protectedRequest = await request('/api/insumos'); assert.equal(protectedRequest.status, 401);
    const email = `qa-${Date.now()}@brewmaster.test`;
    const registered = await request('/api/auth/register', json({ nombre: 'QA BrewMaster', correo: email, password: 'Password123' })); assert.equal(registered.status, 201); assert.ok(!registered.body.password);
    const login = await request('/api/auth/login', json({ correo: email, password: 'Password123' })); assert.equal(login.status, 200); assert.ok(login.body.token);
    const token = login.body.token;
    const me = await request('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }); assert.equal(me.status, 200);
    const list = await request('/api/insumos', { headers: { Authorization: `Bearer ${token}` } }); assert.equal(list.status, 200); assert.ok(Array.isArray(list.body));
    const created = await request('/api/insumos', json({ nombre: 'Insumo QA', tipo: 'Otro', proveedor: 'QA', stock_kg: 1 }, token)); assert.equal(created.status, 201);
    const invalid = await request('/api/insumos', json({ nombre: '' }, token)); assert.equal(invalid.status, 400);
    const missingRelation = await request('/api/barriles', json({ codigo: `QA-${Date.now()}`, lote_id: 999999, capacidad_litros: 20, nivel_co2: 50, estado: 'Lleno', ubicacion: 'QA' }, token)); assert.equal(missingRelation.status, 404);
    const updated = await request(`/api/insumos/${created.body.id}`, { ...json({ nombre: 'Insumo QA actualizado', tipo: 'Otro', proveedor: 'QA', stock_kg: 2 }, token), method: 'PUT' }); assert.equal(updated.status, 200);
    const deleted = await request(`/api/insumos/${created.body.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); assert.equal(deleted.status, 204);
    console.log('API tests OK: auth, 401, CRUD, validación y relación');
  } finally { server.close(); }
});
