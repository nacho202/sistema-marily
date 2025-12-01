const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/', clientesController.listar);
router.get('/nuevo', clientesController.mostrarFormularioNuevo);
router.post('/', clientesController.crear);
router.get('/:id', clientesController.mostrarDetalle);
router.get('/:id/editar', clientesController.mostrarFormularioEditar);
router.post('/:id/editar', clientesController.actualizar);

module.exports = router;

