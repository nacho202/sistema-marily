const { getDb } = require('../db/database');

/**
 * Obtiene todas las compras
 */
function getAll() {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, COUNT(dc.id) as cantidad_productos
    FROM compras c
    LEFT JOIN detalle_compras dc ON c.id = dc.compra_id
    GROUP BY c.id
    ORDER BY c.fecha DESC
  `).all();
}

/**
 * Obtiene una compra por ID con sus detalles
 */
function getById(id) {
  const db = getDb();
  const compra = db.prepare('SELECT * FROM compras WHERE id = ?').get(id);

  if (!compra) return null;

  const detalles = db.prepare(`
    SELECT dc.*, p.nombre as producto_nombre
    FROM detalle_compras dc
    JOIN productos p ON dc.producto_id = p.id
    WHERE dc.compra_id = ?
  `).all(id);

  return {
    ...compra,
    detalles
  };
}

/**
 * Crea una nueva compra con sus detalles y actualiza el stock
 */
function create(compraData) {
  const db = getDb();
  const transaction = db.transaction(() => {
    // Crear la compra
    const stmtCompra = db.prepare(`
      INSERT INTO compras (fecha, proveedor, total)
      VALUES (?, ?, ?)
    `);
    const result = stmtCompra.run(
      compraData.fecha,
      compraData.proveedor || null,
      compraData.total || null
    );
    const compraId = result.lastInsertRowid;

    // Crear los detalles y actualizar stock
    const stmtDetalle = db.prepare(`
      INSERT INTO detalle_compras (compra_id, producto_id, cantidad, costo_unitario)
      VALUES (?, ?, ?, ?)
    `);
    const stmtUpdateStock = db.prepare(`
      UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?
    `);

    for (const detalle of compraData.detalles) {
      stmtDetalle.run(compraId, detalle.producto_id, detalle.cantidad, detalle.costo_unitario || null);
      stmtUpdateStock.run(detalle.cantidad, detalle.producto_id);
    }

    return compraId;
  });

  return transaction();
}

module.exports = {
  getAll,
  getById,
  create
};

