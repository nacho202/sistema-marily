const { getDb } = require('../db/database');

/**
 * Obtiene estadísticas generales del sistema
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD) o null para mes actual
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD) o null para mes actual
 */
function getEstadisticas(fechaInicio = null, fechaFin = null) {
  const db = getDb();

  // Total de productos
  const totalProductos = db.prepare('SELECT COUNT(*) as total FROM productos WHERE activo = 1').get().total;

  // Total de clientes
  const totalClientes = db.prepare('SELECT COUNT(*) as total FROM clientes').get().total;

  // Determinar rango de fechas
  let fechaInicioQuery, fechaFinQuery;
  if (fechaInicio && fechaFin) {
    fechaInicioQuery = fechaInicio;
    fechaFinQuery = fechaFin + ' 23:59:59';
  } else {
    // Por defecto, mes actual
    const hoy = new Date();
    fechaInicioQuery = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    fechaFinQuery = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0] + ' 23:59:59';
  }

  // Total vendido en el período
  const totalVendido = db.prepare(`
    SELECT COALESCE(SUM(total), 0) as total
    FROM ventas
    WHERE fecha >= ? AND fecha <= ?
  `).get(fechaInicioQuery, fechaFinQuery).total;

  // Ventas por día del período (con cantidad de productos)
  const ventasPorDia = db.prepare(`
    SELECT 
      DATE(v.fecha) as fecha, 
      SUM(v.total) as total,
      SUM(dv.cantidad) as cantidad_productos
    FROM ventas v
    LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
    WHERE v.fecha >= ? AND v.fecha <= ?
    GROUP BY DATE(v.fecha)
    ORDER BY fecha
  `).all(fechaInicioQuery, fechaFinQuery);

  // Productos más vendidos (TOP 5) en el período
  const productosMasVendidos = db.prepare(`
    SELECT p.id, p.nombre, SUM(dv.cantidad) as total_vendido
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    JOIN ventas v ON dv.venta_id = v.id
    WHERE v.fecha >= ? AND v.fecha <= ?
    GROUP BY p.id, p.nombre
    ORDER BY total_vendido DESC
    LIMIT 5
  `).all(fechaInicioQuery, fechaFinQuery);

  // Clientes que más compraron (TOP 5) en el período
  const clientesMasCompraron = db.prepare(`
    SELECT c.id, c.nombre, COALESCE(SUM(v.total), 0) as total_gastado
    FROM clientes c
    LEFT JOIN ventas v ON c.id = v.cliente_id
    WHERE v.fecha >= ? AND v.fecha <= ?
    GROUP BY c.id, c.nombre
    HAVING total_gastado > 0
    ORDER BY total_gastado DESC
    LIMIT 5
  `).all(fechaInicioQuery, fechaFinQuery);

  // Contar total de productos vendidos (para saber si hay más de 5)
  const totalProductosVendidos = db.prepare(`
    SELECT COUNT(DISTINCT p.id) as total
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    JOIN ventas v ON dv.venta_id = v.id
    WHERE v.fecha >= ? AND v.fecha <= ?
  `).get(fechaInicioQuery, fechaFinQuery).total;

  // Contar total de clientes que compraron (para saber si hay más de 5)
  const totalClientesCompraron = db.prepare(`
    SELECT COUNT(DISTINCT c.id) as total
    FROM clientes c
    INNER JOIN ventas v ON c.id = v.cliente_id
    WHERE v.fecha >= ? AND v.fecha <= ?
    AND v.total > 0
  `).get(fechaInicioQuery, fechaFinQuery).total;

  return {
    totalProductos,
    totalClientes,
    totalVendido,
    ventasPorDia,
    productosMasVendidos,
    clientesMasCompraron,
    totalProductosVendidos: totalProductosVendidos || 0,
    totalClientesCompraron: totalClientesCompraron || 0,
    fechaInicio: fechaInicioQuery,
    fechaFin: fechaFinQuery.split(' ')[0]
  };
}

/**
 * Obtiene todos los productos más vendidos (sin límite) en un período
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
 */
function getAllProductosMasVendidos(fechaInicio, fechaFin) {
  const db = getDb();
  const fechaFinQuery = fechaFin + ' 23:59:59';
  
  return db.prepare(`
    SELECT p.id, p.nombre, SUM(dv.cantidad) as total_vendido
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    JOIN ventas v ON dv.venta_id = v.id
    WHERE v.fecha >= ? AND v.fecha <= ?
    GROUP BY p.id, p.nombre
    ORDER BY total_vendido DESC
  `).all(fechaInicio, fechaFinQuery);
}

/**
 * Obtiene todos los clientes que más compraron (sin límite) en un período
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
 */
function getAllClientesMasCompraron(fechaInicio, fechaFin) {
  const db = getDb();
  const fechaFinQuery = fechaFin + ' 23:59:59';
  
  return db.prepare(`
    SELECT c.id, c.nombre, COALESCE(SUM(v.total), 0) as total_gastado
    FROM clientes c
    LEFT JOIN ventas v ON c.id = v.cliente_id
    WHERE v.fecha >= ? AND v.fecha <= ?
    GROUP BY c.id, c.nombre
    HAVING total_gastado > 0
    ORDER BY total_gastado DESC
  `).all(fechaInicio, fechaFinQuery);
}

/**
 * Compara estadísticas entre dos períodos (mes a mes)
 * @param {string} fechaInicio1 - Fecha de inicio del primer período (YYYY-MM-DD)
 * @param {string} fechaFin1 - Fecha de fin del primer período (YYYY-MM-DD)
 * @param {string} fechaInicio2 - Fecha de inicio del segundo período (YYYY-MM-DD)
 * @param {string} fechaFin2 - Fecha de fin del segundo período (YYYY-MM-DD)
 */
function compararPeriodos(fechaInicio1, fechaFin1, fechaInicio2, fechaFin2) {
  const db = getDb();
  const fechaFin1Query = fechaFin1 + ' 23:59:59';
  const fechaFin2Query = fechaFin2 + ' 23:59:59';

  // Estadísticas del primer período
  const estadisticas1 = {
    totalVendido: db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE fecha >= ? AND fecha <= ?
    `).get(fechaInicio1, fechaFin1Query).total,
    cantidadVentas: db.prepare(`
      SELECT COUNT(*) as total
      FROM ventas
      WHERE fecha >= ? AND fecha <= ?
    `).get(fechaInicio1, fechaFin1Query).total,
    cantidadProductos: db.prepare(`
      SELECT COALESCE(SUM(dv.cantidad), 0) as total
      FROM detalle_ventas dv
      JOIN ventas v ON dv.venta_id = v.id
      WHERE v.fecha >= ? AND v.fecha <= ?
    `).get(fechaInicio1, fechaFin1Query).total
  };

  // Estadísticas del segundo período
  const estadisticas2 = {
    totalVendido: db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE fecha >= ? AND fecha <= ?
    `).get(fechaInicio2, fechaFin2Query).total,
    cantidadVentas: db.prepare(`
      SELECT COUNT(*) as total
      FROM ventas
      WHERE fecha >= ? AND fecha <= ?
    `).get(fechaInicio2, fechaFin2Query).total,
    cantidadProductos: db.prepare(`
      SELECT COALESCE(SUM(dv.cantidad), 0) as total
      FROM detalle_ventas dv
      JOIN ventas v ON dv.venta_id = v.id
      WHERE v.fecha >= ? AND v.fecha <= ?
    `).get(fechaInicio2, fechaFin2Query).total
  };

  // Calcular diferencias
  const diferenciaVentas = estadisticas2.totalVendido - estadisticas1.totalVendido;
  const diferenciaPorcentaje = estadisticas1.totalVendido > 0 
    ? ((diferenciaVentas / estadisticas1.totalVendido) * 100).toFixed(2)
    : 0;

  return {
    periodo1: estadisticas1,
    periodo2: estadisticas2,
    diferencia: {
      ventas: diferenciaVentas,
      porcentaje: diferenciaPorcentaje,
      cantidadVentas: estadisticas2.cantidadVentas - estadisticas1.cantidadVentas,
      cantidadProductos: estadisticas2.cantidadProductos - estadisticas1.cantidadProductos
    }
  };
}

/**
 * Obtiene el margen de ganancia por producto en un período
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
 */
function getMargenGananciaPorProducto(fechaInicio, fechaFin) {
  const db = getDb();
  const fechaFinQuery = fechaFin + ' 23:59:59';

  // FIFO por lotes: costear cada venta consumiendo compras anteriores por fecha
  // Nota: compras.fecha es YYYY-MM-DD (sin hora). ventas.fecha es YYYY-MM-DD HH:mm:ss.

  const comprasLotes = db.prepare(`
    SELECT
      dc.producto_id as producto_id,
      p.nombre as producto_nombre,
      c.fecha as fecha_compra,
      dc.cantidad as cantidad,
      COALESCE(dc.costo_unitario, 0) as costo_unitario
    FROM detalle_compras dc
    JOIN compras c ON dc.compra_id = c.id
    JOIN productos p ON dc.producto_id = p.id
    WHERE c.fecha <= ?
    ORDER BY c.fecha ASC, dc.id ASC
  `).all(fechaFin);

  const ventasDetalles = db.prepare(`
    SELECT
      dv.producto_id as producto_id,
      p.nombre as producto_nombre,
      v.fecha as fecha_venta,
      dv.cantidad as cantidad,
      dv.precio_unitario as precio_unitario
    FROM detalle_ventas dv
    JOIN ventas v ON dv.venta_id = v.id
    JOIN productos p ON dv.producto_id = p.id
    WHERE v.fecha >= ? AND v.fecha <= ?
    ORDER BY v.fecha ASC, dv.id ASC
  `).all(fechaInicio, fechaFinQuery);

  // Agrupar lotes por producto
  const lotesPorProducto = new Map(); // productoId -> [{fecha, remaining, costo}]
  const nombrePorProducto = new Map();

  for (const l of comprasLotes) {
    const pid = String(l.producto_id);
    nombrePorProducto.set(pid, l.producto_nombre);
    if (!lotesPorProducto.has(pid)) lotesPorProducto.set(pid, []);
    lotesPorProducto.get(pid).push({
      fecha: String(l.fecha_compra), // YYYY-MM-DD
      remaining: Number(l.cantidad) || 0,
      costo: Number(l.costo_unitario) || 0,
    });
  }

  // Cursor de consumo por producto
  const idxPorProducto = new Map(); // productoId -> index

  function costearFIFO(productoId, fechaVenta, cantidad) {
    const pid = String(productoId);
    const qty = Number(cantidad) || 0;
    if (qty <= 0) return { costoTotal: 0, qtyCosteada: 0, qtySinCosto: 0 };

    const lotes = lotesPorProducto.get(pid) || [];
    let idx = idxPorProducto.get(pid) || 0;
    let restante = qty;
    let costoTotal = 0;
    let qtyCosteada = 0;

    // Solo usar lotes con fecha_compra <= fechaVenta (comparación lexicográfica funciona con YYYY-MM-DD)
    const fechaVentaDia = String(fechaVenta).slice(0, 10); // YYYY-MM-DD

    while (restante > 0 && idx < lotes.length) {
      const lote = lotes[idx];
      if (lote.remaining <= 0) {
        idx++;
        continue;
      }
      if (lote.fecha > fechaVentaDia) break;

      const take = Math.min(restante, lote.remaining);
      costoTotal += take * lote.costo;
      lote.remaining -= take;
      restante -= take;
      qtyCosteada += take;

      if (lote.remaining <= 0) idx++;
    }

    idxPorProducto.set(pid, idx);
    return { costoTotal, qtyCosteada, qtySinCosto: restante };
  }

  // Agregados por producto para el reporte
  const agg = new Map(); // pid -> {id,nombre,total_ventas,total_costos,cantidad_vendida,qtySinCosto}

  for (const v of ventasDetalles) {
    const pid = String(v.producto_id);
    const nombre = v.producto_nombre || nombrePorProducto.get(pid) || 'Producto';
    const cantidad = Number(v.cantidad) || 0;
    const precio = Number(v.precio_unitario) || 0;
    const totalVenta = cantidad * precio;

    if (!agg.has(pid)) {
      agg.set(pid, {
        id: Number(v.producto_id),
        nombre,
        total_ventas: 0,
        total_costos: 0,
        cantidad_vendida: 0,
        qty_sin_costo: 0,
      });
    }

    const row = agg.get(pid);
    row.total_ventas += totalVenta;
    row.cantidad_vendida += cantidad;

    const { costoTotal, qtySinCosto } = costearFIFO(pid, v.fecha_venta, cantidad);
    row.total_costos += costoTotal;
    row.qty_sin_costo += qtySinCosto;
  }

  const margenes = Array.from(agg.values()).map((r) => {
    const ganancia = r.total_ventas - r.total_costos;
    const margenPorcentaje = r.total_ventas > 0 ? ((ganancia / r.total_ventas) * 100) : 0;
    return {
      id: r.id,
      nombre: r.nombre,
      total_ventas: r.total_ventas || 0,
      total_costos: r.total_costos || 0,
      ganancia,
      margen_porcentaje: parseFloat(margenPorcentaje.toFixed(2)),
      cantidad_vendida: r.cantidad_vendida || 0,
      qty_sin_costo: r.qty_sin_costo || 0,
    };
  });

  return margenes.sort((a, b) => b.ganancia - a.ganancia);
}

module.exports = {
  getEstadisticas,
  getAllProductosMasVendidos,
  getAllClientesMasCompraron,
  compararPeriodos,
  getMargenGananciaPorProducto
};

