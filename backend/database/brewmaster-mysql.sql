CREATE DATABASE IF NOT EXISTS brewmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE brewmaster;

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
  stock_kg DECIMAL(10,2) NOT NULL CHECK (stock_kg >= 0),
  unidad VARCHAR(20) NOT NULL DEFAULT 'kg',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  estilo VARCHAR(100) NOT NULL,
  litros_totales DECIMAL(10,2) NOT NULL CHECK (litros_totales > 0),
  fecha_cocinado DATE NOT NULL,
  estado ENUM('Cocinado', 'Fermentando', 'Madurando', 'Listo') NOT NULL DEFAULT 'Cocinado',
  notas TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lote_insumos (
  lote_id INT NOT NULL,
  insumo_id INT NOT NULL,
  cantidad_kg DECIMAL(10,2) NOT NULL CHECK (cantidad_kg > 0),
  PRIMARY KEY (lote_id, insumo_id),
  CONSTRAINT fk_li_lote FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE CASCADE,
  CONSTRAINT fk_li_insumo FOREIGN KEY (insumo_id) REFERENCES insumos(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS barriles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  lote_id INT NOT NULL,
  capacidad_litros DECIMAL(10,2) NOT NULL CHECK (capacidad_litros > 0),
  nivel_co2 DECIMAL(5,2) NOT NULL CHECK (nivel_co2 BETWEEN 0 AND 100),
  estado ENUM('Limpio', 'Lleno', 'Madurando', 'Listo', 'Despachado') NOT NULL DEFAULT 'Lleno',
  ubicacion VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_barril_lote FOREIGN KEY (lote_id) REFERENCES lotes(id)
) ENGINE=InnoDB;

INSERT INTO insumos (nombre, tipo, proveedor, stock_kg) SELECT 'Malta Pale Ale', 'Malta', 'Maltería Central', 85 WHERE NOT EXISTS (SELECT 1 FROM insumos WHERE nombre = 'Malta Pale Ale');
INSERT INTO insumos (nombre, tipo, proveedor, stock_kg) SELECT 'Lúpulo Citra', 'Lúpulo', 'Hop House', 18 WHERE NOT EXISTS (SELECT 1 FROM insumos WHERE nombre = 'Lúpulo Citra');
INSERT INTO insumos (nombre, tipo, proveedor, stock_kg) SELECT 'Levadura Ale US-05', 'Levadura', 'Fermentis', 4.5 WHERE NOT EXISTS (SELECT 1 FROM insumos WHERE nombre = 'Levadura Ale US-05');
INSERT INTO lotes (codigo, estilo, litros_totales, fecha_cocinado, estado, notas) SELECT 'BM-2026-001', 'Pale Ale', 1200, '2026-11-01', 'Madurando', 'Lote de temporada cítrica' WHERE NOT EXISTS (SELECT 1 FROM lotes WHERE codigo = 'BM-2026-001');
INSERT INTO lotes (codigo, estilo, litros_totales, fecha_cocinado, estado, notas) SELECT 'BM-2026-002', 'Stout', 800, '2026-11-03', 'Fermentando', 'Ajustar cuerpo en próxima receta' WHERE NOT EXISTS (SELECT 1 FROM lotes WHERE codigo = 'BM-2026-002');
INSERT INTO barriles (codigo, lote_id, capacidad_litros, nivel_co2, estado, ubicacion) SELECT 'BR-001', id, 30, 72, 'Madurando', 'Cámara fría A' FROM lotes WHERE codigo = 'BM-2026-001' AND NOT EXISTS (SELECT 1 FROM barriles WHERE codigo = 'BR-001');
INSERT INTO barriles (codigo, lote_id, capacidad_litros, nivel_co2, estado, ubicacion) SELECT 'BR-002', id, 50, 88, 'Listo', 'Cámara fría A' FROM lotes WHERE codigo = 'BM-2026-001' AND NOT EXISTS (SELECT 1 FROM barriles WHERE codigo = 'BR-002');
INSERT INTO barriles (codigo, lote_id, capacidad_litros, nivel_co2, estado, ubicacion) SELECT 'BR-003', id, 30, 45, 'Lleno', 'Tanque 2' FROM lotes WHERE codigo = 'BM-2026-002' AND NOT EXISTS (SELECT 1 FROM barriles WHERE codigo = 'BR-003');
