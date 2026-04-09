const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const datosPath = path.join(__dirname, '../datos-exportados.json');

if (!fs.existsSync(datosPath)) {
  console.error('No se encontró el archivo de datos exportados:', datosPath);
  process.exit(1);
}

const datos = JSON.parse(fs.readFileSync(datosPath, 'utf8'));
const db = new Database(dbPath);

// Iniciar transacción
const transaction = db.transaction(() => {
  // Importar productos
  if (datos.productos && datos.productos.length > 0) {
    const insertProducto = db.prepare(`
      INSERT INTO productos (id, nombre, descripcion, precio, stock_actual, imagen, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    datos.productos.forEach(p => {
      insertProducto.run(p.id, p.nombre, p.descripcion, p.precio, p.stock_actual, p.imagen, p.activo);
    });
    console.log(`✅ Importados ${datos.productos.length} productos`);
  }

  // Importar clientes
  if (datos.clientes && datos.clientes.length > 0) {
    const insertCliente = db.prepare(`
      INSERT INTO clientes (id, nombre, telefono, email, direccion, fecha_nacimiento, nota)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    datos.clientes.forEach(c => {
      insertCliente.run(c.id, c.nombre, c.telefono, c.email, c.direccion || null, c.fecha_nacimiento, c.nota);
    });
    console.log(`✅ Importados ${datos.clientes.length} clientes`);
  }

  // Importar compras
  if (datos.compras && datos.compras.length > 0) {
    const insertCompra = db.prepare(`
      INSERT INTO compras (id, fecha, proveedor, total)
      VALUES (?, ?, ?, ?)
    `);
    datos.compras.forEach(c => {
      insertCompra.run(c.id, c.fecha, c.proveedor, c.total);
    });
    console.log(`✅ Importadas ${datos.compras.length} compras`);
  }

  // Importar detalle_compras
  if (datos.detalle_compras && datos.detalle_compras.length > 0) {
    const insertDetalleCompra = db.prepare(`
      INSERT INTO detalle_compras (id, compra_id, producto_id, cantidad, costo_unitario)
      VALUES (?, ?, ?, ?, ?)
    `);
    datos.detalle_compras.forEach(d => {
      insertDetalleCompra.run(d.id, d.compra_id, d.producto_id, d.cantidad, d.costo_unitario);
    });
    console.log(`✅ Importados ${datos.detalle_compras.length} detalles de compras`);
  }

  // Importar ventas
  if (datos.ventas && datos.ventas.length > 0) {
    const insertVenta = db.prepare(`
      INSERT INTO ventas (id, fecha, cliente_id, total)
      VALUES (?, ?, ?, ?)
    `);
    datos.ventas.forEach(v => {
      insertVenta.run(v.id, v.fecha, v.cliente_id, v.total);
    });
    console.log(`✅ Importadas ${datos.ventas.length} ventas`);
  }

  // Importar detalle_ventas
  if (datos.detalle_ventas && datos.detalle_ventas.length > 0) {
    const insertDetalleVenta = db.prepare(`
      INSERT INTO detalle_ventas (id, venta_id, producto_id, cantidad, precio_unitario)
      VALUES (?, ?, ?, ?, ?)
    `);
    datos.detalle_ventas.forEach(d => {
      insertDetalleVenta.run(d.id, d.venta_id, d.producto_id, d.cantidad, d.precio_unitario);
    });
    console.log(`✅ Importados ${datos.detalle_ventas.length} detalles de ventas`);
  }
});

try {
  transaction();
  console.log('\n✅ Todos los datos se importaron correctamente');
} catch (error) {
  console.error('❌ Error al importar datos:', error);
  process.exit(1);
}

db.close();

