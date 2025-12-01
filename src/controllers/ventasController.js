const ventasModel = require('../models/ventas');
const productosModel = require('../models/productos');
const clientesModel = require('../models/clientes');
const { getLocalDateTimeString } = require('../utils/dateHelper');

/**
 * Lista todas las ventas con opción de filtro por fecha
 */
function listar(req, res) {
  try {
    const fechaInicio = req.query.fecha_inicio || '';
    const fechaFin = req.query.fecha_fin || '';
    
    let ventas;
    if (fechaInicio && fechaFin) {
      ventas = ventasModel.getByFechaRange(fechaInicio, fechaFin + ' 23:59:59');
    } else {
      ventas = ventasModel.getAll();
    }

    res.render('ventas/listar', { ventas, fechaInicio, fechaFin });
  } catch (error) {
    res.render('error', { message: 'Error al listar ventas', error });
  }
}

/**
 * Muestra el formulario para crear una nueva venta
 */
function mostrarFormularioNuevo(req, res) {
  try {
    const productos = productosModel.getAll();
    const clientes = clientesModel.getAll();
    res.render('ventas/nueva', { productos, clientes });
  } catch (error) {
    res.render('error', { message: 'Error al cargar el formulario', error });
  }
}

/**
 * Crea una nueva venta
 */
function crear(req, res) {
  try {
    const { cliente_id, productos: productosData } = req.body;

    // Validar que haya productos
    if (!productosData || !Array.isArray(productosData) || productosData.length === 0) {
      const productos = productosModel.getAll();
      const clientes = clientesModel.getAll();
      return res.render('ventas/nueva', {
        error: 'Debe seleccionar al menos un producto',
        productos,
        clientes,
        cliente_id
      });
    }

    // Validar stock y preparar detalles
    const detalles = [];
    let total = 0;

    for (const item of productosData) {
      const productoId = parseInt(item.producto_id);
      const cantidad = parseInt(item.cantidad);
      const producto = productosModel.getById(productoId);

      if (!producto) {
        throw new Error(`Producto con ID ${productoId} no encontrado`);
      }

      if (isNaN(cantidad) || cantidad <= 0) {
        throw new Error(`Cantidad inválida para el producto ${producto.nombre}`);
      }

      // Verificar stock disponible
      const stockDisponible = productosModel.getStock(productoId);
      if (stockDisponible < cantidad) {
        const productos = productosModel.getAll();
        const clientes = clientesModel.getAll();
        return res.render('ventas/nueva', {
          error: `Stock insuficiente para ${producto.nombre}. Stock disponible: ${stockDisponible}`,
          productos,
          clientes,
          cliente_id
        });
      }

      const subtotal = cantidad * producto.precio;
      total += subtotal;

      detalles.push({
        producto_id: productoId,
        cantidad,
        precio_unitario: producto.precio
      });
    }

    // Crear la venta
    const fecha = getLocalDateTimeString();
    const ventaId = ventasModel.create({
      fecha,
      cliente_id: cliente_id || null,
      total,
      detalles
    });

    res.redirect(`/ventas/${ventaId}`);
  } catch (error) {
    const productos = productosModel.getAll();
    const clientes = clientesModel.getAll();
    res.render('ventas/nueva', {
      error: 'Error al crear la venta: ' + error.message,
      productos,
      clientes
    });
  }
}

/**
 * Muestra el detalle de una venta
 */
function mostrarDetalle(req, res) {
  try {
    const venta = ventasModel.getById(req.params.id);
    if (!venta) {
      return res.status(404).render('error', {
        message: 'Venta no encontrada',
        error: { status: 404 }
      });
    }
    res.render('ventas/detalle', { venta });
  } catch (error) {
    res.render('error', { message: 'Error al cargar la venta', error });
  }
}

module.exports = {
  listar,
  mostrarFormularioNuevo,
  crear,
  mostrarDetalle
};

