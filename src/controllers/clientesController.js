const clientesModel = require('../models/clientes');

/**
 * Lista todos los clientes con opción de búsqueda
 */
function listar(req, res) {
  try {
    const termino = req.query.buscar || '';
    const clientes = termino 
      ? clientesModel.searchByNombre(termino)
      : clientesModel.getAll();
    
    res.render('clientes/listar', { clientes, termino });
  } catch (error) {
    res.render('error', { message: 'Error al listar clientes', error });
  }
}

/**
 * Muestra el formulario para crear un nuevo cliente
 */
function mostrarFormularioNuevo(req, res) {
  res.render('clientes/nuevo');
}

/**
 * Crea un nuevo cliente
 */
function crear(req, res) {
  try {
    const { nombre, telefono, email, direccion, fecha_nacimiento, nota } = req.body;

    // Detectar si es una petición AJAX/JSON
    const isAjax = req.headers['content-type'] && req.headers['content-type'].includes('application/json') ||
                   req.xhr ||
                   req.headers.accept && req.headers.accept.includes('application/json');

    // Validaciones
    if (!nombre) {
      // Si es una petición AJAX, devolver JSON
      if (isAjax) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
      }
      return res.render('clientes/nuevo', {
        error: 'El nombre es obligatorio',
        cliente: req.body
      });
    }

    const clienteId = clientesModel.create({
      nombre,
      telefono,
      email,
      direccion,
      fecha_nacimiento,
      nota
    });

    // Si es una petición AJAX, devolver JSON con el nuevo cliente
    if (isAjax) {
      const nuevoCliente = clientesModel.getById(clienteId);
      return res.json({ 
        success: true, 
        cliente: nuevoCliente 
      });
    }

    res.redirect('/clientes');
  } catch (error) {
    // Si es una petición AJAX, devolver JSON con error
    const isAjax = req.headers['content-type'] && req.headers['content-type'].includes('application/json') ||
                   req.xhr ||
                   req.headers.accept && req.headers.accept.includes('application/json');
    
    if (isAjax) {
      return res.status(500).json({ error: 'Error al crear el cliente: ' + error.message });
    }
    res.render('clientes/nuevo', {
      error: 'Error al crear el cliente: ' + error.message,
      cliente: req.body
    });
  }
}

/**
 * Muestra el detalle de un cliente con su historial de ventas
 */
function mostrarDetalle(req, res) {
  try {
    const cliente = clientesModel.getById(req.params.id);
    if (!cliente) {
      return res.status(404).render('error', {
        message: 'Cliente no encontrado',
        error: { status: 404 }
      });
    }

    const ventas = clientesModel.getVentasByClienteId(req.params.id);
    res.render('clientes/detalle', { cliente, ventas });
  } catch (error) {
    res.render('error', { message: 'Error al cargar el cliente', error });
  }
}

/**
 * Muestra el formulario para editar un cliente
 */
function mostrarFormularioEditar(req, res) {
  try {
    const cliente = clientesModel.getById(req.params.id);
    if (!cliente) {
      return res.status(404).render('error', {
        message: 'Cliente no encontrado',
        error: { status: 404 }
      });
    }
    res.render('clientes/editar', { cliente });
  } catch (error) {
    res.render('error', { message: 'Error al cargar el cliente', error });
  }
}

/**
 * Actualiza un cliente
 */
function actualizar(req, res) {
  try {
    const { nombre, telefono, email, direccion, fecha_nacimiento, nota } = req.body;

    // Validaciones
    if (!nombre) {
      const cliente = clientesModel.getById(req.params.id);
      return res.render('clientes/editar', {
        error: 'El nombre es obligatorio',
        cliente: { ...cliente, ...req.body }
      });
    }

    clientesModel.update(req.params.id, {
      nombre,
      telefono,
      email,
      direccion,
      fecha_nacimiento,
      nota
    });

    res.redirect(`/clientes/${req.params.id}`);
  } catch (error) {
    res.render('error', { message: 'Error al actualizar el cliente', error });
  }
}

module.exports = {
  listar,
  mostrarFormularioNuevo,
  crear,
  mostrarDetalle,
  mostrarFormularioEditar,
  actualizar
};

