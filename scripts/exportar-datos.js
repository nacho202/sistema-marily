const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/database.sqlite');

if (!fs.existsSync(dbPath)) {
  console.error('No se encontró la base de datos en:', dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

// Exportar datos
const datos = {
  productos: db.prepare('SELECT * FROM productos').all(),
  clientes: db.prepare('SELECT * FROM clientes').all(),
  compras: db.prepare('SELECT * FROM compras').all(),
  detalle_compras: db.prepare('SELECT * FROM detalle_compras').all(),
  ventas: db.prepare('SELECT * FROM ventas').all(),
  detalle_ventas: db.prepare('SELECT * FROM detalle_ventas').all()
};

// Guardar en archivo JSON
const outputPath = path.join(__dirname, '../datos-exportados.json');
fs.writeFileSync(outputPath, JSON.stringify(datos, null, 2), 'utf8');

console.log('✅ Datos exportados correctamente a:', outputPath);
console.log(`   - Productos: ${datos.productos.length}`);
console.log(`   - Clientes: ${datos.clientes.length}`);
console.log(`   - Ventas: ${datos.ventas.length}`);
console.log(`   - Compras: ${datos.compras.length}`);

db.close();

