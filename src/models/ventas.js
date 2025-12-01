const { getDb } = require('../db/database');

/**
 * Obtiene todas las ventas
 */
function getAll() {
  const db = getDb();
  return db.prepare(`
    SELECT v.*, c.nombre as cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    ORDER BY v.fecha DESC
  `).all();
}

/**
 * Obtiene ventas filtradas por fecha
 */
function getByFechaRange(fechaInicio, fechaFin) {
  const db = getDb();
  return db.prepare(`
    SELECT v.*, c.nombre as cliente_nombre
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE v.fecha >= ? AND v.fecha <= ?
    ORDER BY v.fecha DESC
  `).all(fechaInicio, fechaFin);
}

/**
 * Obtiene una venta por ID con sus detalles
 */
function getById(id) {
  const db = getDb();
  const venta = db.prepare(`
    SELECT v.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, c.email as cliente_email
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE v.id = ?
  `).get(id);

  if (!venta) return null;

  const detalles = db.prepare(`
    SELECT dv.*, p.nombre as producto_nombre
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    WHERE dv.venta_id = ?
  `).all(id);

  return {
    ...venta,
    detalles
  };
}

/**
 * Crea una nueva venta con sus detalles
 */
function create(ventaData) {
  const db = getDb();
  const transaction = db.transaction(() => {
    // Crear la venta
    const stmtVenta = db.prepare(`
      INSERT INTO ventas (fecha, cliente_id, total)
      VALUES (?, ?, ?)
    `);
    const result = stmtVenta.run(
      ventaData.fecha,
      ventaData.cliente_id || null,
      ventaData.total
    );
    const ventaId = result.lastInsertRowid;

    // Crear los detalles y actualizar stock
    const stmtDetalle = db.prepare(`
      INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario)
      VALUES (?, ?, ?, ?)
    `);
    const stmtUpdateStock = db.prepare(`
      UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?
    `);

    for (const detalle of ventaData.detalles) {
      stmtDetalle.run(ventaId, detalle.producto_id, detalle.cantidad, detalle.precio_unitario);
      stmtUpdateStock.run(detalle.cantidad, detalle.producto_id);
    }

    return ventaId;
  });

  return transaction();
}

/**
 * Obtiene el total de ventas del mes actual
 */
function getTotalMesActual() {
  const db = getDb();
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const result = db.prepare(`
    SELECT COALESCE(SUM(total), 0) as total
    FROM ventas
    WHERE fecha >= ? AND fecha <= ?
  `).get(primerDia, ultimoDia + ' 23:59:59');

  return result.total;
}

/**
 * Obtiene productos más vendidos (TOP N)
 */
function getProductosMasVendidos(limit = 5) {
  const db = getDb();
  return db.prepare(`
    SELECT p.id, p.nombre, SUM(dv.cantidad) as total_vendido
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    GROUP BY p.id, p.nombre
    ORDER BY total_vendido DESC
    LIMIT ?
  `).all(limit);
}

/**
 * Obtiene clientes que más compraron (TOP N por total)
 */
function getClientesMasCompraron(limit = 5) {
  const db = getDb();
  return db.prepare(`
    SELECT c.id, c.nombre, COALESCE(SUM(v.total), 0) as total_gastado
    FROM clientes c
    LEFT JOIN ventas v ON c.id = v.cliente_id
    GROUP BY c.id, c.nombre
    HAVING total_gastado > 0
    ORDER BY total_gastado DESC
    LIMIT ?
  `).all(limit);
}

module.exports = {
  getAll,
  getByFechaRange,
  getById,
  create,
  getTotalMesActual,
  getProductosMasVendidos,
  getClientesMasCompraron
};

