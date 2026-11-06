import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = 'http://localhost:4000/api';
const configs = {
  insumos: { label: 'Insumos', singular: 'Insumo', icon: '🌾', fields: [['nombre', 'Nombre'], ['tipo', 'Tipo'], ['proveedor', 'Proveedor'], ['stock_kg', 'Stock (kg)']], options: { tipo: ['Malta', 'Lúpulo', 'Levadura', 'Otro'] }, columns: ['nombre', 'tipo', 'proveedor', 'stock_kg'] },
  lotes: { label: 'Lotes', singular: 'Lote', icon: '🍺', fields: [['codigo', 'Código'], ['estilo', 'Estilo'], ['litros_totales', 'Litros totales'], ['fecha_cocinado', 'Fecha de cocinado'], ['estado', 'Estado'], ['notas', 'Notas']], options: { estado: ['Cocinado', 'Fermentando', 'Madurando', 'Listo'] }, columns: ['codigo', 'estilo', 'litros_totales', 'fecha_cocinado', 'estado'] },
  barriles: { label: 'Barriles', singular: 'Barril', icon: '🛢️', fields: [['codigo', 'Código'], ['lote_id', 'ID del lote'], ['capacidad_litros', 'Capacidad (L)'], ['nivel_co2', 'CO₂ (%)'], ['estado', 'Estado'], ['ubicacion', 'Ubicación']], options: { estado: ['Limpio', 'Lleno', 'Madurando', 'Listo', 'Despachado'] }, columns: ['codigo', 'lote_id', 'capacidad_litros', 'nivel_co2', 'estado', 'ubicacion'] }
};
const numericFields = ['stock_kg', 'litros_totales', 'lote_id', 'capacidad_litros', 'nivel_co2'];

async function api(path, options) {
  const response = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.details?.join(', ') || error.error || 'Error de conexión'); }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [resource, setResource] = useState('insumos');
  const [rows, setRows] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const config = configs[resource];
  const load = () => Promise.all([api(`/${resource}`), api('/dashboard')]).then(([data, summary]) => { setRows(data); setDashboard(summary); }).catch((error) => setMessage(error.message));
  useEffect(() => { setRows([]); setEditing(null); load(); }, [resource]);
  const save = async (data) => { try { await api(editing?.id ? `/${resource}/${editing.id}` : `/${resource}`, { method: editing?.id ? 'PUT' : 'POST', body: JSON.stringify(data) }); setMessage(editing?.id ? 'Registro actualizado' : 'Registro creado'); setEditing(null); load(); } catch (error) { setMessage(error.message); } };
  const remove = async (id) => { if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return; try { await api(`/${resource}/${id}`, { method: 'DELETE' }); setMessage('Registro eliminado'); load(); } catch (error) { setMessage(error.message); } };
  return <div className="app"><aside><div className="brand"><span>🍻</span><div><strong>BrewMaster</strong><small>Control de producción</small></div></div><nav>{Object.entries(configs).map(([key, item]) => <button className={resource === key ? 'active' : ''} onClick={() => setResource(key)} key={key}><span>{item.icon}</span>{item.label}</button>)}</nav><div className="sidebar-foot">v1.0 · Microcervecería artesanal</div></aside><main><header><div><p className="eyebrow">CENTRO DE OPERACIONES</p><h1>{config.icon} Gestión de {config.label.toLowerCase()}</h1><p className="subtitle">Trazabilidad clara para cada gota de cerveza.</p></div><div className="status"><i></i> API conectada</div></header><section className="metrics"><Metric label="Insumos activos" value={dashboard.insumos ?? '—'} icon="🌾" /><Metric label="Lotes registrados" value={dashboard.lotes ?? '—'} icon="🍺" /><Metric label="Barriles en planta" value={dashboard.barriles ?? '—'} icon="🛢️" /><Metric label="Litros en producción" value={dashboard.litrosEnProduccion ?? '—'} icon="💧" /></section>{message && <div className="toast" onClick={() => setMessage('')}>{message} <b>×</b></div>}<section className="workspace"><div className="section-title"><div><h2>{config.label}</h2><span>{rows.length} registros encontrados</span></div><button className="primary" onClick={() => setEditing({})}>＋ Nuevo {config.singular}</button></div>{editing ? <Form config={config} initial={editing} onSave={save} onCancel={() => setEditing(null)} /> : <Table config={config} rows={rows} onEdit={setEditing} onDelete={remove} />}</section></main></div>;
}
function Metric({ label, value, icon }) { return <div className="metric"><span className="metric-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>; }
function Form({ config, initial, onSave, onCancel }) { const [form, setForm] = useState(() => Object.fromEntries(config.fields.map(([key]) => [key, initial[key] ?? (config.options?.[key]?.[0] ?? '')]))); const change = (key, value) => setForm({ ...form, [key]: numericFields.includes(key) && value !== '' ? Number(value) : value }); return <div className="form-card"><div className="form-heading"><h3>{initial.id ? 'Editar registro' : 'Nuevo registro'}</h3><span>Completa la información operativa</span></div><form onSubmit={(event) => { event.preventDefault(); onSave(form); }}><div className="form-grid">{config.fields.map(([key, label]) => <label key={key}>{label}{config.options?.[key] ? <select value={form[key]} onChange={(event) => change(key, event.target.value)}>{config.options[key].map(option => <option key={option}>{option}</option>)}</select> : <input required={key !== 'notas'} type={key.includes('fecha') ? 'date' : numericFields.includes(key) ? 'number' : 'text'} step="0.01" value={form[key]} onChange={(event) => change(key, event.target.value)} />}</label>)}</div><div className="form-actions"><button type="button" className="ghost" onClick={onCancel}>Cancelar</button><button className="primary">Guardar registro</button></div></form></div>; }
function Table({ config, rows, onEdit, onDelete }) { return <div className="table-wrap">{rows.length === 0 ? <div className="empty">Cargando o sin registros. Crea el primero con el botón de arriba.</div> : <table><thead><tr>{config.columns.map(column => <th key={column}>{column.replaceAll('_', ' ')}</th>)}<th>Acciones</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}>{config.columns.map(column => { const value = row[column] ?? '—'; return <td key={column}>{column === 'estado' ? <span className={`badge ${String(value).toLowerCase()}`}>{value}</span> : value}</td>; })}<td><button className="icon-btn" title="Editar" onClick={() => onEdit(row)}>✎</button><button className="icon-btn danger" title="Eliminar" onClick={() => onDelete(row.id)}>⌫</button></td></tr>)}</tbody></table>}</div>; }

createRoot(document.getElementById('root')).render(<App />);
