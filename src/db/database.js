const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ruta de la base de datos
const dbPath = path.join(__dirname, '../../data/database.sqlite');

// Asegurar que el directorio data existe
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

/**
 * Inicializa la conexión a la base de datos y crea las tablas si no existen
 */
function initDatabase() {
  try {
    db = new Database(dbPath);
    
    // Habilitar foreign keys
    db.pragma('foreign_keys = ON');
    
    // Crear tablas
    createTables();
    
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

/**
 * Crea todas las tablas necesarias
 */
function createTables() {
  // Tabla productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      stock_actual INTEGER NOT NULL DEFAULT 0,
      imagen TEXT NULL,
      activo INTEGER NOT NULL DEFAULT 1
    )
  `);
  
  // Agregar columna activo si no existe (para bases de datos existentes)
  try {
    db.exec('ALTER TABLE productos ADD COLUMN activo INTEGER NOT NULL DEFAULT 1');
  } catch (e) {
    // La columna ya existe, no hacer nada
  }

  // Tabla producto_imagenes (múltiples imágenes por producto)
  db.exec(`
    CREATE TABLE IF NOT EXISTS producto_imagenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      origen TEXT NOT NULL DEFAULT 'url',
      creado_en TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    )
  `);

  // Tabla clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      direccion TEXT,
      fecha_nacimiento TEXT NULL,
      nota TEXT NULL
    )
  `);
  
  // Agregar columna direccion si no existe (para bases de datos existentes)
  try {
    db.exec('ALTER TABLE clientes ADD COLUMN direccion TEXT');
  } catch (e) {
    // La columna ya existe, no hacer nada
  }

  // Tabla ventas
  db.exec(`
    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      cliente_id INTEGER NULL,
      total REAL NOT NULL,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);

  // Tabla detalle_ventas
  db.exec(`
    CREATE TABLE IF NOT EXISTS detalle_ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venta_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )
  `);

  // Tabla compras
  db.exec(`
    CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      proveedor TEXT,
      total REAL NULL
    )
  `);

  // Tabla detalle_compras
  db.exec(`
    CREATE TABLE IF NOT EXISTS detalle_compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compra_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      costo_unitario REAL NULL,
      FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )
  `);
}

/**
 * Obtiene la instancia de la base de datos
 */
function getDb() {
  if (!db) {
    throw new Error('La base de datos no ha sido inicializada');
  }
  return db;
}

/**
 * Cierra la conexión a la base de datos
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  getDb,
  closeDatabase
};

