const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/', productosController.listar);
router.get('/nuevo', productosController.mostrarFormularioNuevo);
router.post('/', productosController.crear);
router.get('/:id/editar', productosController.mostrarFormularioEditar);
router.post('/:id/editar', productosController.actualizar);
router.post('/:id/eliminar', productosController.eliminar);
router.post('/:id/habilitar', productosController.habilitar);
router.post('/:id/stock', productosController.actualizarStock);

module.exports = router;

