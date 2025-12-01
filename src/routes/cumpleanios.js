const express = require('express');
const router = express.Router();
const clientesModel = require('../models/clientes');

/**
 * Lista de cumpleaños ordenados por fecha
 */
router.get('/', (req, res) => {
  try {
    const clientes = clientesModel.getAllOrderedByCumpleanios();
    res.render('cumpleanios/index', { clientes });
  } catch (error) {
    res.render('error', { message: 'Error al cargar cumpleaños', error });
  }
});

module.exports = router;

