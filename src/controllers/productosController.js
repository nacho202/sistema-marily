const productosModel = require('../models/productos');
const path = require('path');
const fs = require('fs');

function normalizeUrls(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr
    .flatMap(v => String(v).split(/\r?\n/))
    .map(v => v.trim())
    .filter(Boolean)
    .filter(v => /^https?:\/\//i.test(v));
}

function fileToPublicUrl(file) {
  // file.path apunta a .../public/uploads/productos/<filename>
  const filename = path.basename(file.path);
  return `/uploads/productos/${filename}`;
}

/**
 * Lista todos los productos con opción de búsqueda
 */
function listar(req, res) {
  try {
    const termino = req.query.buscar || '';
    const mostrarDeshabilitados = req.query.mostrar_deshabilitados === '1';
    
    let productos;
    let productosDeshabilitados = [];
    
    if (mostrarDeshabilitados) {
      // Si se solicita ver deshabilitados, obtener todos los productos
      const todosProductos = productosModel.getAllIncludingDisabled();
      
      // Filtrar productos activos
      productos = termino 
        ? todosProductos.filter(p => 
            p.nombre.toLowerCase().includes(termino.toLowerCase()) && p.activo === 1
          )
        : todosProductos.filter(p => p.activo === 1);
      
      // Filtrar productos deshabilitados
      productosDeshabilitados = termino
        ? todosProductos.filter(p => 
            p.nombre.toLowerCase().includes(termino.toLowerCase()) && p.activo === 0
          )
        : todosProductos.filter(p => p.activo === 0);
    } else {
      // Solo mostrar productos activos
      productos = termino 
        ? productosModel.searchByNombre(termino)
        : productosModel.getAll();
    }
    
    res.render('productos/listar', { 
      productos, 
      productosDeshabilitados,
      termino,
      mostrarDeshabilitados
    });
  } catch (error) {
    res.render('error', { message: 'Error al listar productos', error });
  }
}

/**
 * Muestra el formulario para crear un nuevo producto
 */
function mostrarFormularioNuevo(req, res) {
  res.render('productos/nuevo');
}

/**
 * Crea un nuevo producto
 */
function crear(req, res) {
  // Detectar si es una petición AJAX/JSON
  const isAjax = req.headers['content-type'] && req.headers['content-type'].includes('application/json') ||
                 req.xhr ||
                 req.headers.accept && req.headers.accept.includes('application/json');
  try {
    const { nombre, descripcion, precio, stock_actual } = req.body;
    const imagenesUrls = normalizeUrls(req.body['imagenes_urls[]'] || req.body.imagenes_urls);

    // Validaciones
    if (!nombre || !precio) {
      if (isAjax) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios' });
      }
      return res.render('productos/nuevo', {
        error: 'El nombre y el precio son obligatorios',
        producto: req.body
      });
    }

    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock_actual) || 0;

    if (isNaN(precioNum) || precioNum < 0) {
      if (isAjax) {
        return res.status(400).json({ error: 'El precio debe ser un número válido' });
      }
      return res.render('productos/nuevo', {
        error: 'El precio debe ser un número válido',
        producto: req.body
      });
    }

    const productoId = productosModel.create({
      nombre,
      descripcion,
      precio: precioNum,
      stock_actual: stockNum,
      imagen: null
    });

    // Guardar imágenes por URL
    for (const url of imagenesUrls) {
      productosModel.addImagen(productoId, url, 'url');
    }

    // Guardar imágenes subidas
    const files = Array.isArray(req.files) ? req.files : [];
    for (const file of files) {
      const url = fileToPublicUrl(file);
      productosModel.addImagen(productoId, url, 'upload');
    }

    // Si es una petición AJAX, devolver JSON con el nuevo producto
    if (isAjax) {
      const nuevoProducto = productosModel.getById(productoId);
      return res.json({ 
        success: true, 
        producto: nuevoProducto 
      });
    }

    res.redirect('/productos');
  } catch (error) {
    // Si es una petición AJAX, devolver JSON con error
    if (isAjax) {
      return res.status(500).json({ error: 'Error al crear el producto: ' + error.message });
    }
    res.render('productos/nuevo', {
      error: 'Error al crear el producto: ' + error.message,
      producto: req.body
    });
  }
}

/**
 * Muestra el formulario para editar un producto
 */
function mostrarFormularioEditar(req, res) {
  try {
    const producto = productosModel.getById(req.params.id);
    if (!producto) {
      return res.status(404).render('error', {
        message: 'Producto no encontrado',
        error: { status: 404 }
      });
    }
    const imagenes = productosModel.getImagenesByProductoId(req.params.id);
    res.render('productos/editar', { producto, imagenes });
  } catch (error) {
    res.render('error', { message: 'Error al cargar el producto', error });
  }
}

/**
 * Actualiza un producto
 */
function actualizar(req, res) {
  try {
    const { nombre, descripcion, precio } = req.body;
    const imagenesUrls = normalizeUrls(req.body['imagenes_urls[]'] || req.body.imagenes_urls);

    // Validaciones
    if (!nombre || !precio) {
      const producto = productosModel.getById(req.params.id);
      const imagenes = productosModel.getImagenesByProductoId(req.params.id);
      return res.render('productos/editar', {
        error: 'El nombre y el precio son obligatorios',
        producto: { ...producto, ...req.body },
        imagenes
      });
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      const producto = productosModel.getById(req.params.id);
      const imagenes = productosModel.getImagenesByProductoId(req.params.id);
      return res.render('productos/editar', {
        error: 'El precio debe ser un número válido',
        producto: { ...producto, ...req.body },
        imagenes
      });
    }

    productosModel.update(req.params.id, {
      nombre,
      descripcion,
      precio: precioNum,
      imagen: null
    });

    // Agregar nuevas imágenes por URL
    for (const url of imagenesUrls) {
      productosModel.addImagen(req.params.id, url, 'url');
    }

    // Agregar nuevas imágenes subidas
    const files = Array.isArray(req.files) ? req.files : [];
    for (const file of files) {
      const url = fileToPublicUrl(file);
      productosModel.addImagen(req.params.id, url, 'upload');
    }

    res.redirect('/productos');
  } catch (error) {
    res.render('error', { message: 'Error al actualizar el producto', error });
  }
}

function eliminarImagen(req, res) {
  try {
    const productoId = String(req.params.id);
    const imagenId = String(req.params.imagenId);

    const imagenes = productosModel.getImagenesByProductoId(productoId);
    const img = imagenes.find(i => String(i.id) === imagenId);

    productosModel.deleteImagen(productoId, imagenId);

    // Si era un upload local, borrar archivo físico
    if (img && img.origen === 'upload' && typeof img.url === 'string' && img.url.startsWith('/uploads/productos/')) {
      const filePath = path.join(__dirname, '../../public', img.url.replace(/^\//, ''));
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // ignorar si ya no existe
      }
    }

    res.redirect(`/productos/${productoId}/editar`);
  } catch (error) {
    res.render('error', { message: 'Error al eliminar la imagen', error });
  }
}

/**
 * Deshabilita un producto
 */
function eliminar(req, res) {
  try {
    productosModel.deshabilitar(req.params.id);
    res.redirect('/productos');
  } catch (error) {
    // Si hay error, mostrar mensaje y redirigir con mensaje de error
    const termino = req.query.buscar || '';
    const productos = productosModel.getAll();
    res.render('productos/listar', { 
      productos, 
      termino,
      error: error.message || 'Error al deshabilitar el producto'
    });
  }
}

/**
 * Actualiza el stock de un producto (suma cantidad)
 */
function actualizarStock(req, res) {
  try {
    const { cantidad } = req.body;
    const cantidadNum = parseInt(cantidad);

    if (isNaN(cantidadNum)) {
      return res.redirect('/productos');
    }

    productosModel.updateStock(req.params.id, cantidadNum);
    res.redirect('/productos');
  } catch (error) {
    res.render('error', { message: 'Error al actualizar el stock', error });
  }
}

/**
 * Habilita un producto deshabilitado
 */
function habilitar(req, res) {
  try {
    productosModel.habilitar(req.params.id);
    res.redirect('/productos?mostrar_deshabilitados=1');
  } catch (error) {
    res.render('error', { message: 'Error al habilitar el producto', error });
  }
}

module.exports = {
  listar,
  mostrarFormularioNuevo,
  crear,
  mostrarFormularioEditar,
  actualizar,
  eliminarImagen,
  eliminar,
  actualizarStock,
  habilitar
};

