const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');

router.get('/', comprasController.listar);
router.get('/nueva', comprasController.mostrarFormularioNuevo);
router.post('/', comprasController.crear);
router.get('/:id', comprasController.mostrarDetalle);

module.exports = router;

