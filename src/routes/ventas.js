const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.get('/', ventasController.listar);
router.get('/nueva', ventasController.mostrarFormularioNuevo);
router.post('/', ventasController.crear);
router.get('/:id', ventasController.mostrarDetalle);

module.exports = router;

