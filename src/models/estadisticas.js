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

  // Obtener ventas por producto
  const ventasPorProducto = db.prepare(`
    SELECT 
      p.id,
      p.nombre,
      SUM(dv.cantidad * dv.precio_unitario) as total_ventas,
      SUM(dv.cantidad) as cantidad_vendida
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    JOIN ventas v ON dv.venta_id = v.id
    WHERE v.fecha >= ? AND v.fecha <= ?
    GROUP BY p.id, p.nombre
  `).all(fechaInicio, fechaFinQuery);

  // Obtener costos por producto (promedio ponderado del costo unitario de compras hasta la fecha de inicio)
  // Esto asegura que solo se consideren los costos de productos comprados antes del período de ventas
  const costosPorProducto = db.prepare(`
    SELECT 
      p.id,
      p.nombre,
      SUM(dc.cantidad * COALESCE(dc.costo_unitario, 0)) as total_costos,
      SUM(dc.cantidad) as cantidad_comprada
    FROM detalle_compras dc
    JOIN productos p ON dc.producto_id = p.id
    JOIN compras c ON dc.compra_id = c.id
    WHERE c.fecha < ?
    GROUP BY p.id, p.nombre
  `).all(fechaInicio);

  // Crear mapa de costos
  const costosMap = {};
  costosPorProducto.forEach(costo => {
    costosMap[costo.id] = {
      total_costos: costo.total_costos || 0,
      cantidad_comprada: costo.cantidad_comprada || 0,
      costo_promedio: costo.cantidad_comprada > 0 
        ? (costo.total_costos / costo.cantidad_comprada) 
        : 0
    };
  });

  // Calcular margen de ganancia
  const margenes = ventasPorProducto.map(venta => {
    const costo = costosMap[venta.id] || { costo_promedio: 0, total_costos: 0 };
    const costoTotal = venta.cantidad_vendida * costo.costo_promedio;
    const ganancia = venta.total_ventas - costoTotal;
    const margenPorcentaje = venta.total_ventas > 0 
      ? ((ganancia / venta.total_ventas) * 100).toFixed(2)
      : 0;

    return {
      id: venta.id,
      nombre: venta.nombre,
      total_ventas: venta.total_ventas || 0,
      total_costos: costoTotal,
      ganancia: ganancia,
      margen_porcentaje: parseFloat(margenPorcentaje),
      cantidad_vendida: venta.cantidad_vendida || 0
    };
  });

  // Ordenar por ganancia descendente
  return margenes.sort((a, b) => b.ganancia - a.ganancia);
}

module.exports = {
  getEstadisticas,
  getAllProductosMasVendidos,
  getAllClientesMasCompraron,
  compararPeriodos,
  getMargenGananciaPorProducto
};

