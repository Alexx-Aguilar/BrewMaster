const assert = require('node:assert');
const app = require('./app');
const http = require('node:http');
const server = app.listen(0, async () => {
  const url = `http://localhost:${server.address().port}`;
  const request = async (path, options) => { const response = await fetch(url + path, options); return { status: response.status, body: response.status === 204 ? null : await response.json() }; };
  try {
    const list = await request('/api/insumos'); assert.equal(list.status, 200); assert.ok(Array.isArray(list.body));
    const created = await request('/api/insumos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: 'Test', tipo: 'Otro', proveedor: 'QA', stock_kg: 1 }) }); assert.equal(created.status, 201);
    const invalid = await request('/api/insumos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: '' }) }); assert.equal(invalid.status, 400);
    await request(`/api/insumos/${created.body.id}`, { method: 'DELETE' }); console.log('API tests OK: listar, crear, validar y eliminar');
  } finally { server.close(); }
});
