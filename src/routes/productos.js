const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { upload } = require('../middleware/uploads');

router.get('/', productosController.listar);
router.get('/nuevo', productosController.mostrarFormularioNuevo);
router.post('/', upload.array('imagenes_files', 10), productosController.crear);
router.get('/:id', productosController.mostrarDetalle);
router.get('/:id/editar', productosController.mostrarFormularioEditar);
router.post('/:id/editar', upload.array('imagenes_files', 10), productosController.actualizar);
router.post('/:id/imagenes/:imagenId/eliminar', productosController.eliminarImagen);
router.post('/:id/eliminar', productosController.eliminar);
router.post('/:id/habilitar', productosController.habilitar);
router.post('/:id/stock', productosController.actualizarStock);

module.exports = router;

