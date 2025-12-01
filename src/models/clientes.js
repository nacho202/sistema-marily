const { getDb } = require('../db/database');

/**
 * Obtiene todos los clientes
 */
function getAll() {
  const db = getDb();
  return db.prepare('SELECT * FROM clientes ORDER BY nombre').all();
}

/**
 * Busca clientes por nombre
 */
function searchByNombre(termino) {
  const db = getDb();
  return db.prepare('SELECT * FROM clientes WHERE nombre LIKE ? ORDER BY nombre')
    .all(`%${termino}%`);
}

/**
 * Obtiene un cliente por ID
 */
function getById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
}

/**
 * Crea un nuevo cliente
 */
function create(cliente) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO clientes (nombre, telefono, email, direccion, fecha_nacimiento, nota)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    cliente.nombre,
    cliente.telefono || null,
    cliente.email || null,
    cliente.direccion || null,
    cliente.fecha_nacimiento || null,
    cliente.nota || null
  );
  return result.lastInsertRowid;
}

/**
 * Actualiza un cliente
 */
function update(id, cliente) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE clientes 
    SET nombre = ?, telefono = ?, email = ?, direccion = ?, fecha_nacimiento = ?, nota = ?
    WHERE id = ?
  `);
  return stmt.run(
    cliente.nombre,
    cliente.telefono || null,
    cliente.email || null,
    cliente.direccion || null,
    cliente.fecha_nacimiento || null,
    cliente.nota || null,
    id
  );
}

/**
 * Obtiene las ventas de un cliente
 */
function getVentasByClienteId(clienteId) {
  const db = getDb();
  return db.prepare(`
    SELECT v.*, 
           COUNT(dv.id) as cantidad_productos
    FROM ventas v
    LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
    WHERE v.cliente_id = ?
    GROUP BY v.id
    ORDER BY v.fecha DESC
  `).all(clienteId);
}

/**
 * Obtiene clientes con cumpleaños en los próximos N días
 */
function getProximosCumpleanios(dias = 30) {
  const db = getDb();
  // Obtener todos los clientes con fecha de nacimiento
  const clientes = db.prepare(`
    SELECT id, nombre, fecha_nacimiento
    FROM clientes
    WHERE fecha_nacimiento IS NOT NULL
    ORDER BY fecha_nacimiento
  `).all();

  // Obtener fecha de hoy sin hora (solo fecha)
  const hoy = new Date();
  const hoyFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const proximos = [];

  clientes.forEach(cliente => {
    if (!cliente.fecha_nacimiento) return;

    // Parsear fecha de nacimiento correctamente (formato YYYY-MM-DD)
    const partesFecha = cliente.fecha_nacimiento.split('-');
    const anioNac = parseInt(partesFecha[0]);
    const mesNac = parseInt(partesFecha[1]) - 1; // Los meses en JS van de 0-11
    const diaNac = parseInt(partesFecha[2]);

    // Calcular cumpleaños de este año
    const cumpleaniosEsteAnio = new Date(hoy.getFullYear(), mesNac, diaNac);
    // Calcular cumpleaños del próximo año
    const cumpleaniosProximoAnio = new Date(hoy.getFullYear() + 1, mesNac, diaNac);

    // Determinar cuál es el próximo cumpleaños
    let proximoCumpleanios = cumpleaniosEsteAnio;
    if (cumpleaniosEsteAnio < hoyFecha) {
      proximoCumpleanios = cumpleaniosProximoAnio;
    }

    // Calcular días restantes (diferencia en días)
    const diferenciaMs = proximoCumpleanios - hoyFecha;
    const diasRestantes = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

    // Si es hoy (días restantes = 0) o está en el rango de días
    if (diasRestantes >= 0 && diasRestantes <= dias) {
      // Formatear fecha correctamente usando los valores originales, no getDate() que puede tener problemas de zona horaria
      const anioCumple = proximoCumpleanios.getFullYear();
      const mesCumple = proximoCumpleanios.getMonth() + 1; // Ya está ajustado (0-11 -> 1-12)
      const diaCumple = proximoCumpleanios.getDate();
      
      // Si hay problema de zona horaria, usar los valores originales
      const fechaFormateada = `${anioCumple}-${String(mesCumple).padStart(2, '0')}-${String(diaCumple).padStart(2, '0')}`;
      
      // Guardar también los valores originales para evitar problemas de zona horaria en la vista
      proximos.push({
        ...cliente,
        dias_restantes: diasRestantes,
        fecha_cumpleanios: fechaFormateada,
        dia_cumpleanios: diaNac, // Usar el día original de la fecha de nacimiento
        mes_cumpleanios: parseInt(partesFecha[1]) // Usar el mes original
      });
    }
  });

  return proximos.sort((a, b) => a.dias_restantes - b.dias_restantes);
}

/**
 * Obtiene todos los clientes ordenados por cumpleaños
 */
function getAllOrderedByCumpleanios() {
  const db = getDb();
  const clientes = db.prepare(`
    SELECT id, nombre, fecha_nacimiento, telefono, email
    FROM clientes
    WHERE fecha_nacimiento IS NOT NULL
    ORDER BY fecha_nacimiento
  `).all();

  // Ordenar por mes y día, ignorando el año
  return clientes.map(cliente => {
    const fechaNac = new Date(cliente.fecha_nacimiento);
    return {
      ...cliente,
      mes: fechaNac.getMonth() + 1,
      dia: fechaNac.getDate()
    };
  }).sort((a, b) => {
    if (a.mes !== b.mes) return a.mes - b.mes;
    return a.dia - b.dia;
  });
}

module.exports = {
  getAll,
  searchByNombre,
  getById,
  create,
  update,
  getVentasByClienteId,
  getProximosCumpleanios,
  getAllOrderedByCumpleanios
};

