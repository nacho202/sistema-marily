const { getDb } = require('../db/database');

/**
 * Obtiene todos los productos activos
 */
function getAll() {
  const db = getDb();
  return db.prepare(`
    SELECT 
      p.*,
      (
        SELECT url 
        FROM producto_imagenes pi 
        WHERE pi.producto_id = p.id 
        ORDER BY pi.id DESC 
        LIMIT 1
      ) as thumb_url
    FROM productos p
    WHERE p.activo = 1
    ORDER BY p.nombre
  `).all();
}

/**
 * Obtiene todos los productos (incluyendo deshabilitados)
 */
function getAllIncludingDisabled() {
  const db = getDb();
  return db.prepare(`
    SELECT 
      p.*,
      (
        SELECT url 
        FROM producto_imagenes pi 
        WHERE pi.producto_id = p.id 
        ORDER BY pi.id DESC 
        LIMIT 1
      ) as thumb_url
    FROM productos p
    ORDER BY p.nombre
  `).all();
}

/**
 * Busca productos por nombre (solo activos)
 */
function searchByNombre(termino) {
  const db = getDb();
  return db.prepare(`
    SELECT 
      p.*,
      (
        SELECT url 
        FROM producto_imagenes pi 
        WHERE pi.producto_id = p.id 
        ORDER BY pi.id DESC 
        LIMIT 1
      ) as thumb_url
    FROM productos p
    WHERE p.nombre LIKE ? AND p.activo = 1
    ORDER BY p.nombre
  `).all(`%${termino}%`);
}

function searchByNombreOrId(termino) {
  const db = getDb();
  const t = String(termino || '').trim();
  const like = `%${t}%`;
  return db.prepare(`
    SELECT 
      p.*,
      (
        SELECT url 
        FROM producto_imagenes pi 
        WHERE pi.producto_id = p.id 
        ORDER BY pi.id DESC 
        LIMIT 1
      ) as thumb_url
    FROM productos p
    WHERE p.activo = 1
      AND (
        p.nombre LIKE ?
        OR CAST(p.id AS TEXT) LIKE ?
      )
    ORDER BY p.nombre
  `).all(like, like);
}

/**
 * Obtiene un producto por ID
 */
function getById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
}

function getImagenesByProductoId(productoId) {
  const db = getDb();
  return db
    .prepare('SELECT * FROM producto_imagenes WHERE producto_id = ? ORDER BY id DESC')
    .all(productoId);
}

function addImagen(productoId, url, origen = 'url') {
  const db = getDb();
  return db
    .prepare('INSERT INTO producto_imagenes (producto_id, url, origen) VALUES (?, ?, ?)')
    .run(productoId, url, origen);
}

function deleteImagen(productoId, imagenId) {
  const db = getDb();
  return db
    .prepare('DELETE FROM producto_imagenes WHERE id = ? AND producto_id = ?')
    .run(imagenId, productoId);
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
  searchByNombreOrId,
  getById,
  getImagenesByProductoId,
  addImagen,
  deleteImagen,
  create,
  update,
  deleteById,
  deshabilitar,
  habilitar,
  updateStock,
  getStock
};

