/**
 * Contenido de ayuda para cada página del sistema
 */

const helpContent = {
  home: `
    <h4>Bienvenido al Dashboard</h4>
    <p>Esta es la página principal del sistema. Aquí puedes ver un resumen de la información más importante.</p>
    
    <h4>Información que se muestra</h4>
    <ul>
      <li><strong>Total Vendido (Mes Actual):</strong> Muestra la suma de todas las ventas realizadas en el mes actual.</li>
      <li><strong>Total de Productos:</strong> Cantidad total de productos activos en el inventario.</li>
      <li><strong>Total de Clientes:</strong> Cantidad total de clientes registrados en el sistema.</li>
      <li><strong>Próximos Cumpleaños:</strong> Lista de clientes que cumplen años en los próximos 30 días, con la cantidad de días restantes.</li>
    </ul>
    
    <h4>Navegación</h4>
    <p>Usa el menú lateral (o inferior en dispositivos móviles) para acceder a las diferentes secciones del sistema.</p>
  `,

  productos: `
    <h4>Gestión de Productos</h4>
    <p>En esta sección puedes administrar todos los productos de tu inventario.</p>
    
    <h4>Funciones principales</h4>
    <ul>
      <li><strong>Nuevo Producto:</strong> Botón para crear un nuevo producto. Debes ingresar nombre, precio y stock inicial.</li>
      <li><strong>Buscar:</strong> Campo de búsqueda para encontrar productos por nombre.</li>
      <li><strong>Mostrar/Ocultar Deshabilitados:</strong> Permite ver productos que fueron deshabilitados anteriormente.</li>
      <li><strong>Actualizar Stock:</strong> En la lista de productos, puedes actualizar el stock directamente usando el campo numérico o el botón "+" en móviles.</li>
      <li><strong>Ver:</strong> Botón con icono de ojo para ver los detalles completos de un producto.</li>
      <li><strong>Editar:</strong> Botón con icono de lápiz para modificar la información de un producto.</li>
      <li><strong>Deshabilitar:</strong> Botón para desactivar un producto sin eliminarlo. Los productos deshabilitados no aparecen en las ventas.</li>
      <li><strong>Habilitar:</strong> Si un producto está deshabilitado, puedes reactivarlo con este botón.</li>
    </ul>
    
    <h4>Importante</h4>
    <p>Los productos deshabilitados no se eliminan permanentemente, solo se ocultan. Puedes reactivarlos cuando lo necesites.</p>
  `,

  clientes: `
    <h4>Gestión de Clientes</h4>
    <p>En esta sección puedes administrar la información de tus clientes.</p>
    
    <h4>Funciones principales</h4>
    <ul>
      <li><strong>Nuevo Cliente:</strong> Botón para registrar un nuevo cliente. Puedes ingresar nombre, teléfono, email, dirección, fecha de nacimiento y notas.</li>
      <li><strong>Buscar:</strong> Campo de búsqueda para encontrar clientes por nombre.</li>
      <li><strong>Ver:</strong> Botón con icono de ojo para ver los detalles del cliente y su historial de compras.</li>
      <li><strong>Editar:</strong> Botón con icono de lápiz para modificar la información del cliente.</li>
    </ul>
    
    <h4>Información del cliente</h4>
    <p>Al ver los detalles de un cliente, puedes ver toda su información personal y un historial completo de todas sus compras realizadas.</p>
  `,

  ventas: `
    <h4>Gestión de Ventas</h4>
    <p>En esta sección puedes registrar y consultar todas las ventas realizadas.</p>
    
    <h4>Crear una nueva venta</h4>
    <ul>
      <li><strong>Seleccionar Cliente:</strong> Busca el cliente escribiendo su nombre. Si el cliente no está registrado, marca la casilla "Cliente no registrado" y completa el formulario que aparece.</li>
      <li><strong>Agregar Productos:</strong> Selecciona los productos de la lista y especifica la cantidad de cada uno. Puedes agregar múltiples productos.</li>
      <li><strong>Total:</strong> El sistema calcula automáticamente el total de la venta.</li>
      <li><strong>Crear Venta:</strong> Al confirmar, se registra la venta y se actualiza el stock de los productos vendidos.</li>
    </ul>
    
    <h4>Lista de ventas</h4>
    <ul>
      <li><strong>Filtrar por Fecha:</strong> Puedes filtrar las ventas por rango de fechas usando los campos de fecha.</li>
      <li><strong>Ver Detalle:</strong> Botón con icono de ojo para ver todos los detalles de una venta, incluyendo productos y cantidades.</li>
    </ul>
    
    <h4>Importante</h4>
    <p>El sistema valida que haya suficiente stock antes de permitir una venta. Si no hay stock suficiente, se mostrará un mensaje de error.</p>
  `,

  compras: `
    <h4>Gestión de Compras</h4>
    <p>En esta sección puedes registrar las compras de productos a proveedores.</p>
    
    <h4>Registrar una nueva compra</h4>
    <ul>
      <li><strong>Fecha:</strong> Selecciona la fecha en que se realizó la compra. Por defecto se usa la fecha actual.</li>
      <li><strong>Proveedor:</strong> Opcional. Puedes ingresar el nombre del proveedor.</li>
      <li><strong>Agregar Productos:</strong> Selecciona los productos comprados, la cantidad y opcionalmente el costo unitario de cada uno.</li>
      <li><strong>Total:</strong> Si ingresas los costos unitarios, el sistema calcula el total automáticamente.</li>
      <li><strong>Registrar Compra:</strong> Al confirmar, se registra la compra y se actualiza el stock de los productos (se suma la cantidad comprada).</li>
    </ul>
    
    <h4>Lista de compras</h4>
    <ul>
      <li><strong>Ver Detalle:</strong> Botón con icono de ojo para ver todos los detalles de una compra, incluyendo productos, cantidades y costos.</li>
    </ul>
    
    <h4>Importante</h4>
    <p>Al registrar una compra, el stock de los productos se incrementa automáticamente con las cantidades compradas.</p>
  `,

  estadisticas: `
    <h4>Estadísticas y Reportes</h4>
    <p>En esta sección puedes ver análisis y estadísticas de tus ventas y productos.</p>
    
    <h4>Filtros de fecha</h4>
    <p>Puedes seleccionar un rango de fechas para ver las estadísticas de un período específico. Por defecto se muestra el mes actual.</p>
    
    <h4>Estadísticas disponibles</h4>
    <ul>
      <li><strong>Total Vendido:</strong> Suma total de todas las ventas en el período seleccionado.</li>
      <li><strong>Ventas por Día:</strong> Muestra el total vendido y la cantidad de productos vendidos por cada día.</li>
      <li><strong>Productos Más Vendidos:</strong> Lista de los 5 productos más vendidos. Si hay más, puedes ver todos con el botón "Ver Todo".</li>
      <li><strong>Clientes que Más Compraron:</strong> Lista de los 5 clientes que más compraron. Si hay más, puedes ver todos con el botón "Ver Todo".</li>
    </ul>
    
    <h4>Herramientas de análisis</h4>
    <ul>
      <li><strong>Comparar Mes a Mes:</strong> Permite comparar las estadísticas de dos períodos diferentes para ver el crecimiento o disminución.</li>
      <li><strong>Margen de Ganancia:</strong> Muestra el margen de ganancia por producto (diferencia entre precio de venta y costo de compra).</li>
    </ul>
  `,

  cumpleanios: `
    <h4>Calendario de Cumpleaños</h4>
    <p>En esta sección puedes ver todos los cumpleaños de tus clientes organizados por mes.</p>
    
    <h4>Información mostrada</h4>
    <ul>
      <li><strong>Organización por Mes:</strong> Los cumpleaños están agrupados por mes para facilitar la visualización.</li>
      <li><strong>Información del Cliente:</strong> Para cada cliente se muestra su nombre, fecha de cumpleaños y datos de contacto (teléfono y email si están disponibles).</li>
      <li><strong>Ver Cliente:</strong> Botón con icono de ojo para ver los detalles completos del cliente y su historial de compras.</li>
    </ul>
    
    <h4>Uso</h4>
    <p>Esta herramienta te ayuda a mantener un registro de los cumpleaños de tus clientes para poder felicitarlos o ofrecer promociones especiales.</p>
  `
};

/**
 * Obtiene el contenido de ayuda para una página específica
 */
function getHelpContent(page) {
  return helpContent[page] || helpContent.home;
}

module.exports = {
  getHelpContent
};

