# Sistema de Gestión Vivero

Sistema web completo para manejar stock, clientes y ventas de un vivero pequeño. Desarrollado con Node.js, Express, SQLite y EJS.

## 🚀 Características

- **Gestión de Productos**: CRUD completo, control de stock, búsqueda
- **Gestión de Clientes**: CRUD completo, historial de compras, cumpleaños
- **Ventas**: Registro de ventas con múltiples productos, validación de stock
- **Compras**: Registro de compras para aumentar stock
- **Estadísticas**: Dashboard con métricas y reportes
- **Cumpleaños**: Calendario de cumpleaños de clientes

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## 🔧 Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **La base de datos se crea automáticamente** al iniciar la aplicación por primera vez. El archivo `data/database.sqlite` se generará automáticamente.

## 🏃 Ejecución

### Modo Desarrollo (con recarga automática)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

Luego, abrir el navegador en: `http://localhost:3000`

## 🌐 Compartir el Sistema con Clientes

Para mostrar el sistema a tu cliente sin tener un servidor, tienes varias opciones:

### Opción Rápida: ngrok (Recomendado para demos)

1. **Instalar ngrok**: https://ngrok.com/download
2. **Iniciar el servidor**: `npm start`
3. **En otra terminal, ejecutar**: `ngrok http 3000`
4. **Compartir la URL** que ngrok genera (ej: `https://abc123.ngrok.io`)

### Alternativa: localtunnel (Sin instalación)

1. **Iniciar el servidor**: `npm start`
2. **En otra terminal**: `npx localtunnel --port 3000`
3. **Compartir la URL** proporcionada

### Para Demos Profesionales: Hosting Gratuito

- **Railway**: https://railway.app (URL permanente)
- **Render**: https://render.com (URL permanente)

📖 **Ver archivo `COMPARTIR_SISTEMA.md` para instrucciones detalladas**

## 📁 Estructura del Proyecto

```
sistema-vivero/
├── data/
│   └── database.sqlite          # Base de datos SQLite (se crea automáticamente)
├── public/
│   ├── css/
│   │   └── styles.css           # Estilos globales
│   └── js/
│       ├── main.js              # JavaScript general
│       ├── ventas.js            # Lógica de formulario de ventas
│       └── compras.js           # Lógica de formulario de compras
├── src/
│   ├── app.js                   # Configuración principal de Express
│   ├── controllers/             # Controladores (lógica de negocio)
│   │   ├── productosController.js
│   │   ├── clientesController.js
│   │   ├── ventasController.js
│   │   └── comprasController.js
│   ├── db/
│   │   └── database.js          # Configuración y esquema de SQLite
│   ├── models/                  # Modelos de datos
│   │   ├── productos.js
│   │   ├── clientes.js
│   │   ├── ventas.js
│   │   ├── compras.js
│   │   └── estadisticas.js
│   └── routes/                  # Definición de rutas
│       ├── home.js
│       ├── productos.js
│       ├── clientes.js
│       ├── ventas.js
│       ├── compras.js
│       ├── estadisticas.js
│       └── cumpleanios.js
├── views/                       # Vistas EJS
│   ├── partials/               # Componentes reutilizables
│   │   ├── header.ejs
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   ├── home/
│   │   └── index.ejs
│   ├── productos/
│   │   ├── listar.ejs
│   │   ├── nuevo.ejs
│   │   └── editar.ejs
│   ├── clientes/
│   │   ├── listar.ejs
│   │   ├── nuevo.ejs
│   │   ├── editar.ejs
│   │   └── detalle.ejs
│   ├── ventas/
│   │   ├── listar.ejs
│   │   ├── nueva.ejs
│   │   └── detalle.ejs
│   ├── compras/
│   │   ├── listar.ejs
│   │   ├── nueva.ejs
│   │   └── detalle.ejs
│   ├── estadisticas/
│   │   └── index.ejs
│   ├── cumpleanios/
│   │   └── index.ejs
│   └── error.ejs
├── package.json
└── README.md
```

## 🗄️ Modelo de Datos

### Tablas principales:

- **productos**: Información de productos (nombre, precio, stock)
- **clientes**: Datos de clientes (nombre, contacto, fecha de nacimiento)
- **ventas**: Encabezado de ventas (fecha, cliente, total)
- **detalle_ventas**: Detalle de productos vendidos
- **compras**: Encabezado de compras (fecha, proveedor, total)
- **detalle_compras**: Detalle de productos comprados

### Reglas de negocio:

- Al registrar una **compra**, el stock de los productos se **incrementa** automáticamente
- Al registrar una **venta**, el stock de los productos se **decrementa** automáticamente
- No se permiten ventas que dejen el stock en negativo (validación en backend y frontend)

## 🎯 Uso del Sistema

### 1. Gestión de Productos

- **Listar productos**: `/productos`
- **Crear producto**: `/productos/nuevo`
- **Editar producto**: `/productos/:id/editar`
- **Eliminar producto**: Botón en el listado
- **Sumar stock**: Formulario rápido en el listado

### 2. Gestión de Clientes

- **Listar clientes**: `/clientes`
- **Crear cliente**: `/clientes/nuevo`
- **Ver detalle**: `/clientes/:id` (incluye historial de compras)
- **Editar cliente**: `/clientes/:id/editar`

### 3. Ventas

- **Listar ventas**: `/ventas` (con filtro por fecha)
- **Nueva venta**: `/ventas/nueva`
  - Seleccionar cliente (opcional)
  - Agregar múltiples productos
  - El sistema calcula el total automáticamente
  - Valida stock disponible antes de crear la venta
- **Ver detalle**: `/ventas/:id`

### 4. Compras

- **Listar compras**: `/compras`
- **Nueva compra**: `/compras/nueva`
  - Agregar productos y cantidades
  - El stock se actualiza automáticamente al guardar

### 5. Estadísticas

- **Dashboard**: `/` (página de inicio)
  - Total vendido del mes
  - Cantidad de productos y clientes
  - Próximos cumpleaños
- **Estadísticas detalladas**: `/estadisticas`
  - Productos más vendidos
  - Clientes que más compraron
  - Ventas por día del mes

### 6. Cumpleaños

- **Calendario**: `/cumpleanios`
  - Listado de clientes ordenados por fecha de cumpleaños

## 🔒 Validaciones

- Campos obligatorios en formularios
- Validación de números (precios, cantidades)
- Validación de stock antes de crear ventas
- Prevención de stock negativo

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de datos**: SQLite (better-sqlite3)
- **Motor de vistas**: EJS
- **Frontend**: HTML5, CSS3, JavaScript vanilla

## 📝 Notas

- La base de datos se crea automáticamente en `data/database.sqlite` al iniciar la aplicación
- El sistema no requiere configuración adicional de base de datos
- Los archivos estáticos (CSS, JS) se sirven desde la carpeta `public/`
- El puerto por defecto es 3000 (configurable mediante variable de entorno `PORT`)

## 🐛 Solución de Problemas

### Error al iniciar la aplicación

- Verificar que Node.js esté instalado: `node --version`
- Verificar que las dependencias estén instaladas: `npm install`
- Verificar que el puerto 3000 no esté en uso

### Error de base de datos

- Eliminar el archivo `data/database.sqlite` y reiniciar la aplicación (se recreará automáticamente)
- Verificar permisos de escritura en la carpeta `data/`

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y comerciales.

---

**Desarrollado con ❤️ para la gestión de viveros**

