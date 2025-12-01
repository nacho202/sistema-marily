const comprasModel = require('../models/compras');
const productosModel = require('../models/productos');
const { getLocalDateString } = require('../utils/dateHelper');

/**
 * Lista todas las compras
 */
function listar(req, res) {
  try {
    const compras = comprasModel.getAll();
    res.render('compras/listar', { compras });
  } catch (error) {
    res.render('error', { message: 'Error al listar compras', error });
  }
}

/**
 * Muestra el formulario para crear una nueva compra
 */
function mostrarFormularioNuevo(req, res) {
  try {
    const productos = productosModel.getAll();
    res.render('compras/nueva', { productos });
  } catch (error) {
    res.render('error', { message: 'Error al cargar el formulario', error });
  }
}

/**
 * Crea una nueva compra
 */
function crear(req, res) {
  try {
    const { proveedor, fecha, productos: productosData } = req.body;

    // Validar que haya productos
    if (!productosData || !Array.isArray(productosData) || productosData.length === 0) {
      const productos = productosModel.getAll();
      return res.render('compras/nueva', {
        error: 'Debe seleccionar al menos un producto',
        productos,
        proveedor,
        fecha
      });
    }

    // Preparar detalles
    const detalles = [];
    let total = 0;

    for (const item of productosData) {
      const productoId = parseInt(item.producto_id);
      const cantidad = parseInt(item.cantidad);
      const costoUnitario = item.costo_unitario ? parseFloat(item.costo_unitario) : null;
      const producto = productosModel.getById(productoId);

      if (!producto) {
        throw new Error(`Producto con ID ${productoId} no encontrado`);
      }

      if (isNaN(cantidad) || cantidad <= 0) {
        throw new Error(`Cantidad inválida para el producto ${producto.nombre}`);
      }

      if (costoUnitario !== null && (isNaN(costoUnitario) || costoUnitario < 0)) {
        throw new Error(`Costo unitario inválido para el producto ${producto.nombre}`);
      }

      const subtotal = costoUnitario ? cantidad * costoUnitario : 0;
      total += subtotal;

      detalles.push({
        producto_id: productoId,
        cantidad,
        costo_unitario: costoUnitario
      });
    }

    // Crear la compra
    const fechaCompra = fecha || getLocalDateString();
    const compraId = comprasModel.create({
      fecha: fechaCompra,
      proveedor: proveedor || null,
      total: total > 0 ? total : null,
      detalles
    });

    res.redirect('/compras');
  } catch (error) {
    const productos = productosModel.getAll();
    res.render('compras/nueva', {
      error: 'Error al crear la compra: ' + error.message,
      productos,
      proveedor: req.body.proveedor,
      fecha: req.body.fecha
    });
  }
}

/**
 * Muestra el detalle de una compra
 */
function mostrarDetalle(req, res) {
  try {
    const compra = comprasModel.getById(req.params.id);
    if (!compra) {
      return res.status(404).render('error', {
        message: 'Compra no encontrada',
        error: { status: 404 }
      });
    }
    res.render('compras/detalle', { compra });
  } catch (error) {
    res.render('error', { message: 'Error al cargar la compra', error });
  }
}

module.exports = {
  listar,
  mostrarFormularioNuevo,
  crear,
  mostrarDetalle
};

