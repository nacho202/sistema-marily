const express = require('express');
const router = express.Router();
const estadisticasModel = require('../models/estadisticas');

/**
 * Página de estadísticas
 */
router.get('/', (req, res) => {
  try {
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    const estadisticas = estadisticasModel.getEstadisticas(fechaInicio, fechaFin);
    res.render('estadisticas/index', { estadisticas, fechaInicio, fechaFin });
  } catch (error) {
    res.render('error', { message: 'Error al cargar estadísticas', error });
  }
});

/**
 * Ver todos los productos más vendidos
 */
router.get('/productos-mas-vendidos', (req, res) => {
  try {
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    
    if (!fechaInicio || !fechaFin) {
      // Si no hay fechas, usar mes actual
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
      fechaInicio = primerDia;
      fechaFin = ultimoDia;
    }
    
    const productos = estadisticasModel.getAllProductosMasVendidos(fechaInicio, fechaFin);
    res.render('estadisticas/productos-mas-vendidos', { productos, fechaInicio, fechaFin });
  } catch (error) {
    res.render('error', { message: 'Error al cargar productos más vendidos', error });
  }
});

/**
 * Ver todos los clientes que más compraron
 */
router.get('/clientes-mas-compraron', (req, res) => {
  try {
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    
    if (!fechaInicio || !fechaFin) {
      // Si no hay fechas, usar mes actual
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
      fechaInicio = primerDia;
      fechaFin = ultimoDia;
    }
    
    const clientes = estadisticasModel.getAllClientesMasCompraron(fechaInicio, fechaFin);
    res.render('estadisticas/clientes-mas-compraron', { clientes, fechaInicio, fechaFin });
  } catch (error) {
    res.render('error', { message: 'Error al cargar clientes que más compraron', error });
  }
});

/**
 * Comparación mes a mes
 */
router.get('/comparar', (req, res) => {
  try {
    const fechaInicio1 = req.query.fecha_inicio1 || null;
    const fechaFin1 = req.query.fecha_fin1 || null;
    const fechaInicio2 = req.query.fecha_inicio2 || null;
    const fechaFin2 = req.query.fecha_fin2 || null;
    
    let comparacion = null;
    if (fechaInicio1 && fechaFin1 && fechaInicio2 && fechaFin2) {
      comparacion = estadisticasModel.compararPeriodos(fechaInicio1, fechaFin1, fechaInicio2, fechaFin2);
    }
    
    res.render('estadisticas/comparar', { comparacion, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2 });
  } catch (error) {
    res.render('error', { message: 'Error al comparar períodos', error });
  }
});

/**
 * Margen de ganancia por producto
 */
router.get('/margen-ganancia', (req, res) => {
  try {
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    
    let fechaInicioQuery = fechaInicio;
    let fechaFinQuery = fechaFin;
    
    if (!fechaInicio || !fechaFin) {
      // Si no hay fechas, usar mes actual
      const hoy = new Date();
      fechaInicioQuery = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      fechaFinQuery = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
    }
    
    const margenes = estadisticasModel.getMargenGananciaPorProducto(fechaInicioQuery, fechaFinQuery);
    
    // Calcular totales
    const totalVentas = margenes.reduce((sum, m) => sum + m.total_ventas, 0);
    const totalCostos = margenes.reduce((sum, m) => sum + m.total_costos, 0);
    const totalGanancia = margenes.reduce((sum, m) => sum + m.ganancia, 0);
    
    res.render('estadisticas/margen-ganancia', { 
      margenes, 
      fechaInicio: fechaInicioQuery, 
      fechaFin: fechaFinQuery,
      totales: {
        ventas: totalVentas,
        costos: totalCostos,
        ganancia: totalGanancia
      }
    });
  } catch (error) {
    res.render('error', { message: 'Error al cargar margen de ganancia', error });
  }
});

module.exports = router;

