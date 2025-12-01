const express = require('express');
const path = require('path');
const db = require('./db/database');
const { getHelpContent } = require('./utils/helpContent');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
// Configurar EJS para que las rutas de include sean relativas al directorio views
app.locals.basedir = path.join(__dirname, '../views');

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para pasar la ruta actual y contenido de ayuda a las vistas
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  
  // Determinar la página actual para el contenido de ayuda
  let helpPage = 'home';
  if (req.path.startsWith('/productos')) helpPage = 'productos';
  else if (req.path.startsWith('/clientes')) helpPage = 'clientes';
  else if (req.path.startsWith('/ventas')) helpPage = 'ventas';
  else if (req.path.startsWith('/compras')) helpPage = 'compras';
  else if (req.path.startsWith('/estadisticas')) helpPage = 'estadisticas';
  else if (req.path.startsWith('/cumpleanios')) helpPage = 'cumpleanios';
  
  res.locals.helpContent = getHelpContent(helpPage);
  next();
});

// Inicializar base de datos
db.initDatabase();

// Rutas
app.use('/', require('./routes/home'));
app.use('/productos', require('./routes/productos'));
app.use('/clientes', require('./routes/clientes'));
app.use('/ventas', require('./routes/ventas'));
app.use('/compras', require('./routes/compras'));
app.use('/estadisticas', require('./routes/estadisticas'));
app.use('/cumpleanios', require('./routes/cumpleanios'));

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Página no encontrada',
    error: { status: 404 }
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

