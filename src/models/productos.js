const { getDb } = require('../db/database');

/**
 * Obtiene todos los productos activos
 */
function getAll() {
  const db = getDb();
  return db.prepare('SELECT * FROM productos WHERE activo = 1 ORDER BY nombre').all();
}

/**
 * Obtiene todos los productos (incluyendo deshabilitados)
 */
function getAllIncludingDisabled() {
  const db = getDb();
  return db.prepare('SELECT * FROM productos ORDER BY nombre').all();
}

/**
 * Busca productos por nombre (solo activos)
 */
function searchByNombre(termino) {
  const db = getDb();
  return db.prepare('SELECT * FROM productos WHERE nombre LIKE ? AND activo = 1 ORDER BY nombre')
    .all(`%${termino}%`);
}

/**
 * Obtiene un producto por ID
 */
function getById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
}

/**
 * Crea un nuevo producto
 */
function create(producto) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO productos (nombre, descripcion, precio, stock_actual, imagen)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    producto.nombre,
    producto.descripcion || null,
    producto.precio,
    producto.stock_actual || 0,
    producto.imagen || null
  );
  return result.lastInsertRowid;
}

/**
 * Actualiza un producto
 */
function update(id, producto) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE productos 
    SET nombre = ?, descripcion = ?, precio = ?, imagen = ?
    WHERE id = ?
  `);
  return stmt.run(
    producto.nombre,
    producto.descripcion || null,
    producto.precio,
    producto.imagen || null,
    id
  );
}

/**
 * Deshabilita un producto (soft delete)
 */
function deshabilitar(id) {
  const db = getDb();
  const stmt = db.prepare('UPDATE productos SET activo = 0 WHERE id = ?');
  return stmt.run(id);
}

/**
 * Habilita un producto
 */
function habilitar(id) {
  const db = getDb();
  const stmt = db.prepare('UPDATE productos SET activo = 1 WHERE id = ?');
  return stmt.run(id);
}

/**
 * Elimina un producto (mantenido por compatibilidad, pero ahora deshabilita)
 */
function deleteById(id) {
  return deshabilitar(id);
}

/**
 * Actualiza el stock de un producto (suma o resta)
 */
function updateStock(id, cantidad) {
  const db = getDb();
  const stmt = db.prepare('UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?');
  return stmt.run(cantidad, id);
}

/**
 * Obtiene el stock actual de un producto
 */
function getStock(id) {
  const db = getDb();
  const producto = db.prepare('SELECT stock_actual FROM productos WHERE id = ?').get(id);
  return producto ? producto.stock_actual : 0;
}

module.exports = {
  getAll,
  getAllIncludingDisabled,
  searchByNombre,
  getById,
  create,
  update,
  deleteById,
  deshabilitar,
  habilitar,
  updateStock,
  getStock
};

