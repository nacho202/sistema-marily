const express = require('express');
const router = express.Router();
const ventasModel = require('../models/ventas');
const productosModel = require('../models/productos');
const clientesModel = require('../models/clientes');

/**
 * Página de inicio con dashboard
 */
router.get('/', (req, res) => {
  try {
    const totalVendidoMes = ventasModel.getTotalMesActual();
    const totalProductos = productosModel.getAll().length;
    const totalClientes = clientesModel.getAll().length;
    const proximosCumpleanios = clientesModel.getProximosCumpleanios(30);

    res.render('home/index', {
      totalVendidoMes,
      totalProductos,
      totalClientes,
      proximosCumpleanios
    });
  } catch (error) {
    res.render('error', { message: 'Error al cargar el dashboard', error });
  }
});

module.exports = router;

