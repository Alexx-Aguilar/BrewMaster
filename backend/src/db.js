const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');

const dataDir = path.join(__dirname, '..', 'data');
const databaseFile = path.join(dataDir, 'brewmaster.sqlite');
fs.mkdirSync(dataDir, { recursive: true });
const SQL = initSqlJs({ locateFile: (file) => require.resolve(`sql.js/dist/${file}`) });

async function createDatabase() {
  const Sqlite = await SQL;
  const db = fs.existsSync(databaseFile) ? new Sqlite.Database(fs.readFileSync(databaseFile)) : new Sqlite.Database();
  db.run(`PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS insumos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, tipo TEXT NOT NULL CHECK(tipo IN ('Malta', 'Lúpulo', 'Levadura', 'Otro')), proveedor TEXT NOT NULL, stock_kg REAL NOT NULL CHECK(stock_kg >= 0), unidad TEXT NOT NULL DEFAULT 'kg', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS lotes (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT NOT NULL UNIQUE, estilo TEXT NOT NULL, litros_totales REAL NOT NULL CHECK(litros_totales > 0), fecha_cocinado TEXT NOT NULL, estado TEXT NOT NULL CHECK(estado IN ('Cocinado', 'Fermentando', 'Madurando', 'Listo')) DEFAULT 'Cocinado', notas TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS lote_insumos (lote_id INTEGER NOT NULL REFERENCES lotes(id) ON DELETE CASCADE, insumo_id INTEGER NOT NULL REFERENCES insumos(id), cantidad_kg REAL NOT NULL CHECK(cantidad_kg > 0), PRIMARY KEY (lote_id, insumo_id));
    CREATE TABLE IF NOT EXISTS barriles (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT NOT NULL UNIQUE, lote_id INTEGER NOT NULL REFERENCES lotes(id), capacidad_litros REAL NOT NULL CHECK(capacidad_litros > 0), nivel_co2 REAL NOT NULL CHECK(nivel_co2 >= 0 AND nivel_co2 <= 100), estado TEXT NOT NULL CHECK(estado IN ('Limpio', 'Lleno', 'Madurando', 'Listo', 'Despachado')) DEFAULT 'Lleno', ubicacion TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
  const count = db.exec('SELECT COUNT(*) AS count FROM insumos')[0].values[0][0];
  if (count === 0) {
    db.run("INSERT INTO insumos (nombre, tipo, proveedor, stock_kg) VALUES ('Malta Pale Ale', 'Malta', 'Maltería Central', 85), ('Lúpulo Citra', 'Lúpulo', 'Hop House', 18), ('Levadura Ale US-05', 'Levadura', 'Fermentis', 4.5)");
    db.run("INSERT INTO lotes (codigo, estilo, litros_totales, fecha_cocinado, estado, notas) VALUES ('BM-2026-001', 'Pale Ale', 1200, '2026-11-01', 'Madurando', 'Lote de temporada cítrica'), ('BM-2026-002', 'Stout', 800, '2026-11-03', 'Fermentando', 'Ajustar cuerpo en próxima receta')");
    db.run("INSERT INTO barriles (codigo, lote_id, capacidad_litros, nivel_co2, estado, ubicacion) VALUES ('BR-001', 1, 30, 72, 'Madurando', 'Cámara fría A'), ('BR-002', 1, 50, 88, 'Listo', 'Cámara fría A'), ('BR-003', 2, 30, 45, 'Lleno', 'Tanque 2')");
  }
  const save = () => fs.writeFileSync(databaseFile, Buffer.from(db.export()));
  const query = (sql, params = []) => { const statement = db.prepare(sql); statement.bind(params); const rows = []; while (statement.step()) rows.push(statement.getAsObject()); statement.free(); return rows; };
  const execute = (sql, params = []) => { db.run(sql, params); const changes = db.getRowsModified(); const id = query('SELECT last_insert_rowid() AS id')[0]?.id; save(); return { lastInsertRowid: id, changes }; };
  save();
  return { query, execute, save };
}

module.exports = createDatabase();
