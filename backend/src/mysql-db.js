const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'brewmaster',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  multipleStatements: true
};

async function createMysqlDatabase() {
  const admin = await mysql.createConnection({ host: config.host, port: config.port, user: config.user, password: config.password });
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.end();
  const pool = mysql.createPool(config);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      correo VARCHAR(180) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
    CREATE TABLE IF NOT EXISTS insumos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      tipo ENUM('Malta', 'Lúpulo', 'Levadura', 'Otro') NOT NULL,
      proveedor VARCHAR(160) NOT NULL,
      stock_kg DECIMAL(10,2) NOT NULL,
      unidad VARCHAR(20) NOT NULL DEFAULT 'kg',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chk_insumos_stock CHECK (stock_kg >= 0)
    ) ENGINE=InnoDB;
    CREATE TABLE IF NOT EXISTS lotes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      codigo VARCHAR(60) NOT NULL UNIQUE,
      estilo VARCHAR(100) NOT NULL,
      litros_totales DECIMAL(10,2) NOT NULL,
      fecha_cocinado DATE NOT NULL,
      estado ENUM('Cocinado', 'Fermentando', 'Madurando', 'Listo') NOT NULL DEFAULT 'Cocinado',
      notas TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chk_lotes_litros CHECK (litros_totales > 0)
    ) ENGINE=InnoDB;
    CREATE TABLE IF NOT EXISTS lote_insumos (
      lote_id INT NOT NULL,
      insumo_id INT NOT NULL,
      cantidad_kg DECIMAL(10,2) NOT NULL,
      PRIMARY KEY (lote_id, insumo_id),
      CONSTRAINT fk_li_lote FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE CASCADE,
      CONSTRAINT fk_li_insumo FOREIGN KEY (insumo_id) REFERENCES insumos(id),
      CONSTRAINT chk_li_cantidad CHECK (cantidad_kg > 0)
    ) ENGINE=InnoDB;
    CREATE TABLE IF NOT EXISTS barriles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      codigo VARCHAR(60) NOT NULL UNIQUE,
      lote_id INT NOT NULL,
      capacidad_litros DECIMAL(10,2) NOT NULL,
      nivel_co2 DECIMAL(5,2) NOT NULL,
      estado ENUM('Limpio', 'Lleno', 'Madurando', 'Listo', 'Despachado') NOT NULL DEFAULT 'Lleno',
      ubicacion VARCHAR(120) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_barril_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
      CONSTRAINT chk_barril_capacidad CHECK (capacidad_litros > 0),
      CONSTRAINT chk_barril_co2 CHECK (nivel_co2 BETWEEN 0 AND 100)
    ) ENGINE=InnoDB;
  `);
  const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM insumos');
  if (countRows[0].count === 0) {
    await pool.query("INSERT INTO insumos (nombre, tipo, proveedor, stock_kg) VALUES ('Malta Pale Ale', 'Malta', 'Maltería Central', 85), ('Lúpulo Citra', 'Lúpulo', 'Hop House', 18), ('Levadura Ale US-05', 'Levadura', 'Fermentis', 4.5)");
    await pool.query("INSERT INTO lotes (codigo, estilo, litros_totales, fecha_cocinado, estado, notas) VALUES ('BM-2026-001', 'Pale Ale', 1200, '2026-11-01', 'Madurando', 'Lote de temporada cítrica'), ('BM-2026-002', 'Stout', 800, '2026-11-03', 'Fermentando', 'Ajustar cuerpo en próxima receta')");
    await pool.query("INSERT INTO barriles (codigo, lote_id, capacidad_litros, nivel_co2, estado, ubicacion) VALUES ('BR-001', 1, 30, 72, 'Madurando', 'Cámara fría A'), ('BR-002', 1, 50, 88, 'Listo', 'Cámara fría A'), ('BR-003', 2, 30, 45, 'Lleno', 'Tanque 2')");
  }
  return {
    query: async (sql, params = []) => { const [rows] = await pool.execute(sql, params); return rows; },
    execute: async (sql, params = []) => { const [result] = await pool.execute(sql, params); return { lastInsertRowid: result.insertId, changes: result.affectedRows }; },
    close: () => pool.end()
  };
}

module.exports = createMysqlDatabase();
