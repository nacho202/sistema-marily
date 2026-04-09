/**
 * JavaScript para el formulario de compras
 */

document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha por defecto si el campo está vacío
    const fechaInput = document.getElementById('fecha');
    if (fechaInput && !fechaInput.value) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        fechaInput.value = `${year}-${month}-${day}`;
    }
    
    const productosContainer = document.getElementById('productos-container');
    const agregarProductoBtn = document.getElementById('agregar-producto');
    
    if (!productosContainer) {
        console.error('No se encontró el contenedor de productos');
        return;
    }
    
    let productoIndex = 1;
    
    // Listener global para cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', function(e) {
        // Solo cerrar si el click no es en ningún elemento relacionado con productos
        const clickedProductoItem = e.target.closest('.producto-item');
        if (!clickedProductoItem) {
            const dropdowns = document.querySelectorAll('.producto-dropdown');
            dropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
    
    // Inicializar búsqueda de productos en todos los items existentes
    inicializarBusquedaProductos();
    
    // Agregar nuevo producto
    if (agregarProductoBtn) {
        agregarProductoBtn.addEventListener('click', function() {
            const nuevoItem = crearProductoItem(productoIndex);
            productosContainer.appendChild(nuevoItem);
            inicializarBusquedaProductos(nuevoItem);
            productoIndex++;
            actualizarIndices();
        });
    } else {
        console.error('No se encontró el botón agregar producto');
    }
    
    // Eliminar producto
    productosContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-producto')) {
            const item = e.target.closest('.producto-item');
            item.remove();
            actualizarIndices();
        }
    });
    
    function inicializarBusquedaProductos(item = null) {
        const items = item ? [item] : productosContainer.querySelectorAll('.producto-item');
        
        if (items.length === 0) {
            console.warn('No se encontraron items de producto para inicializar');
            return;
        }
        
        items.forEach(productoItem => {
            const productoSearch = productoItem.querySelector('.producto-search');
            const productoSelect = productoItem.querySelector('.producto-select');
            const productoDropdown = productoItem.querySelector('.producto-dropdown');
            
            if (!productoSearch || !productoSelect || !productoDropdown) {
                console.warn('Faltan elementos en el item de producto:', productoItem);
                return;
            }
            
            // Evitar agregar listeners múltiples veces
            if (productoSearch.dataset.initialized === 'true') return;
            productoSearch.dataset.initialized = 'true';
            
            // Búsqueda de productos
            productoSearch.addEventListener('input', function(e) {
                e.stopPropagation(); // Prevenir que el listener global cierre el dropdown
                
                const searchTerm = this.value.toLowerCase().trim();
                
                // Obtener todos los productos disponibles dinámicamente (por si se agregaron nuevos)
                const allProductos = Array.from(productoSelect.options).slice(1);
                
                if (searchTerm === '') {
                    productoDropdown.style.display = 'none';
                    productoSelect.value = '';
                    return;
                }
                
                // Filtrar productos
                const filtered = allProductos.filter(option => {
                    if (!option.value) return false;
                    // Intentar obtener el nombre del data-nombre primero, si no existe usar el texto
                    let nombre = '';
                    if (option.dataset.nombre) {
                        nombre = option.dataset.nombre.toLowerCase();
                    } else {
                        const texto = option.textContent.trim();
                        nombre = texto.toLowerCase().split(' (')[0].trim();
                    }
                    return nombre.includes(searchTerm);
                });
                
                // Mostrar resultados
                if (filtered.length > 0) {
                    productoDropdown.innerHTML = '';
                    filtered.forEach(option => {
                        const div = document.createElement('div');
                        div.style.padding = '0.7rem 1rem';
                        div.style.cursor = 'pointer';
                        div.style.borderBottom = '1px solid #d1cfff';
                        div.textContent = option.textContent.trim();
                        div.addEventListener('mouseenter', function() {
                            this.style.backgroundColor = '#e7e6ff';
                        });
                        div.addEventListener('mouseleave', function() {
                            this.style.backgroundColor = 'transparent';
                        });
                        div.addEventListener('click', function(e) {
                            e.stopPropagation();
                            productoSelect.value = option.value;
                            const nombreProducto = option.textContent.trim().split(' (')[0];
                            productoSearch.value = nombreProducto;
                            productoDropdown.style.display = 'none';
                        });
                        productoDropdown.appendChild(div);
                    });
                    productoDropdown.style.display = 'block';
                } else {
                    productoDropdown.style.display = 'none';
                }
            });
            
            // También mostrar dropdown al hacer focus
            productoSearch.addEventListener('focus', function(e) {
                e.stopPropagation();
                if (this.value.trim() !== '') {
                    // Disparar el evento input para mostrar resultados
                    this.dispatchEvent(new Event('input'));
                }
            });
            
            // Ocultar dropdown al hacer clic fuera (usando un solo listener global)
            // Este listener se maneja a nivel del contenedor para evitar múltiples listeners
            
            // Sincronizar con el select cuando cambia
            productoSelect.addEventListener('change', function() {
                if (this.value) {
                    const selectedOption = this.options[this.selectedIndex];
                    if (selectedOption) {
                        const nombreProducto = selectedOption.textContent.trim().split(' (')[0];
                        productoSearch.value = nombreProducto;
                    }
                } else {
                    productoSearch.value = '';
                }
            });
        });
    }
    
    function crearProductoItem(index) {
        const item = document.createElement('div');
        item.className = 'producto-item';
        
        // Obtener el primer item como plantilla
        const templateItem = productosContainer.querySelector('.producto-item');
        const productoSelectTemplate = templateItem.querySelector('.producto-select');
        
        // Crear contenedor de búsqueda
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'relative';
        searchContainer.style.flex = '1';
        
        const productoSearch = document.createElement('input');
        productoSearch.type = 'text';
        productoSearch.className = 'producto-search';
        productoSearch.placeholder = 'Buscar producto por nombre...';
        productoSearch.autocomplete = 'off';
        productoSearch.style.cssText = 'width: 100%; padding: 0.7rem; border: 1px solid #d1cfff; border-radius: 4px; font-size: 1rem; background-color: #f2f1ff;';
        
        // Clonar el select y asegurarse de que todas las opciones tengan los atributos data
        const productoSelect = productoSelectTemplate.cloneNode(true);
        productoSelect.setAttribute('name', `productos[${index}][producto_id]`);
        productoSelect.value = '';
        productoSelect.style.display = 'none';
        
        // Asegurarse de que todas las opciones tengan data-nombre
        Array.from(productoSelect.options).forEach(option => {
            if (option.value && !option.dataset.nombre) {
                const originalOption = productoSelectTemplate.querySelector(`option[value="${option.value}"]`);
                if (originalOption && originalOption.dataset.nombre) {
                    option.dataset.nombre = originalOption.dataset.nombre;
                    option.dataset.stock = originalOption.dataset.stock || '';
                }
            }
        });
        
        const productoDropdown = document.createElement('div');
        productoDropdown.className = 'producto-dropdown';
        productoDropdown.style.cssText = 'display: none; position: absolute; top: 100%; left: 0; right: 0; background: #f2f1ff; border: 1px solid #d1cfff; border-top: none; border-radius: 0 0 4px 4px; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        
        searchContainer.appendChild(productoSearch);
        searchContainer.appendChild(productoSelect);
        searchContainer.appendChild(productoDropdown);
        
        const cantidadInput = templateItem.querySelector('.cantidad-input').cloneNode(true);
        cantidadInput.setAttribute('name', `productos[${index}][cantidad]`);
        cantidadInput.value = '';
        
        const costoInput = templateItem.querySelector('.costo-input').cloneNode(true);
        costoInput.setAttribute('name', `productos[${index}][costo_unitario]`);
        costoInput.value = '';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-danger btn-small remove-producto';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
        removeBtn.style.display = 'inline-block';
        
        item.appendChild(searchContainer);
        item.appendChild(cantidadInput);
        item.appendChild(costoInput);
        item.appendChild(removeBtn);
        
        return item;
    }
    
    function actualizarIndices() {
        const items = productosContainer.querySelectorAll('.producto-item');
        items.forEach((item, index) => {
            const selects = item.querySelectorAll('select, input[type="number"]');
            selects.forEach(select => {
                const name = select.getAttribute('name');
                if (name) {
                    select.setAttribute('name', name.replace(/\[\d+\]/, `[${index}]`));
                }
            });
        });
        
        // Mostrar/ocultar botones eliminar
        items.forEach((item, index) => {
            const removeBtn = item.querySelector('.remove-producto');
            if (items.length > 1) {
                removeBtn.style.display = 'inline-block';
            } else {
                removeBtn.style.display = 'none';
            }
        });
    }
    
    // Funcionalidad para crear producto inline
    const formNuevoProducto = document.getElementById('form-nuevo-producto');
    const btnCrearProducto = document.getElementById('btn-crear-producto');
    const btnGuardarProducto = document.getElementById('btn-guardar-producto');
    const btnCancelarProducto = document.getElementById('btn-cancelar-producto');
    const productoError = document.getElementById('producto-error');
    const productoNombre = document.getElementById('producto_nombre');
    const productoDescripcion = document.getElementById('producto_descripcion');
    const productoPrecio = document.getElementById('producto_precio');
    const productoStock = document.getElementById('producto_stock');
    const comprasProductoImagenes = document.getElementById('compras-producto-imagenes');

    function toggleFormNuevoProducto(habilitar) {
        const campos = [productoNombre, productoDescripcion, productoPrecio, productoStock];
        campos.forEach(campo => {
            if (!campo) return;
            campo.disabled = !habilitar;
        });
        if (productoNombre) productoNombre.required = Boolean(habilitar);
        if (productoPrecio) productoPrecio.required = Boolean(habilitar);

        if (comprasProductoImagenes) {
            const inputs = comprasProductoImagenes.querySelectorAll('input, button, textarea');
            inputs.forEach(el => {
                // No deshabilitar los hidden inputs generados en el listado
                if (el.type === 'hidden') return;
                el.disabled = !habilitar;
            });
        }
    }

    // Si el formulario está oculto al cargar, deshabilitar campos para evitar validación HTML
    if (formNuevoProducto && formNuevoProducto.style.display === 'none') {
        toggleFormNuevoProducto(false);
    }
    
    // Mostrar formulario de nuevo producto
    if (btnCrearProducto && formNuevoProducto) {
        btnCrearProducto.addEventListener('click', function() {
            formNuevoProducto.style.display = 'block';
            // No necesitamos un targetItem específico, se agregará al último item o al primero vacío
            formNuevoProducto.dataset.targetItem = 'last';
            toggleFormNuevoProducto(true);
            if (productoNombre) productoNombre.focus();
        });
    }
    
    // Guardar producto nuevo
    if (btnGuardarProducto) {
        btnGuardarProducto.addEventListener('click', function() {
            const nombre = document.getElementById('producto_nombre').value.trim();
            const descripcion = document.getElementById('producto_descripcion').value.trim();
            const precio = document.getElementById('producto_precio').value.trim();
            const stock = document.getElementById('producto_stock').value.trim() || '0';
            
            // Validar nombre y precio
            if (!nombre || !precio) {
                productoError.textContent = 'El nombre y el precio son obligatorios';
                productoError.style.display = 'block';
                return;
            }
            
            // Deshabilitar botón mientras se procesa
            btnGuardarProducto.disabled = true;
            btnGuardarProducto.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            
            // Crear producto vía AJAX
            fetch('/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(buildProductoPayload({ nombre, descripcion, precio, stock }))
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.producto) {
                    // Agregar nuevo producto a todos los selects
                    const allItems = productosContainer.querySelectorAll('.producto-item');
                    allItems.forEach(item => {
                        const select = item.querySelector('.producto-select');
                        const option = document.createElement('option');
                        option.value = data.producto.id;
                        option.textContent = `${data.producto.nombre} (Stock: ${data.producto.stock_actual})`;
                        option.dataset.nombre = data.producto.nombre.toLowerCase();
                        option.dataset.stock = data.producto.stock_actual;
                        select.appendChild(option);
                    });
                    
                    // Seleccionar el producto en el último item o en el primero vacío
                    let targetItem = null;
                    
                    // Buscar el primer item sin producto seleccionado
                    for (let item of allItems) {
                        const select = item.querySelector('.producto-select');
                        if (!select.value) {
                            targetItem = item;
                            break;
                        }
                    }
                    
                    // Si todos tienen producto, usar el último
                    if (!targetItem && allItems.length > 0) {
                        targetItem = allItems[allItems.length - 1];
                    }
                    
                    if (targetItem) {
                        const targetSelect = targetItem.querySelector('.producto-select');
                        const targetSearch = targetItem.querySelector('.producto-search');
                        targetSelect.value = data.producto.id;
                        targetSearch.value = data.producto.nombre;
                    }
                    
                    // Limpiar formulario
                    document.getElementById('producto_nombre').value = '';
                    document.getElementById('producto_descripcion').value = '';
                    document.getElementById('producto_precio').value = '';
                    document.getElementById('producto_stock').value = '0';
                    formNuevoProducto.style.display = 'none';
                    toggleFormNuevoProducto(false);
                    productoError.style.display = 'none';
                    if (comprasProductoImagenes) {
                        const list = comprasProductoImagenes.querySelector('[data-imagen-list]');
                        if (list) list.innerHTML = '';
                    }
                    
                    // Actualizar la lista de productos en todos los items (no re-inicializar completamente)
                    // Los nuevos items ya tendrán el producto cuando se creen
                    
                    alert('Producto creado exitosamente');
                } else {
                    productoError.textContent = data.error || 'Error al crear el producto';
                    productoError.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                productoError.textContent = 'Error al crear el producto. Por favor, intenta nuevamente.';
                productoError.style.display = 'block';
            })
            .finally(() => {
                btnGuardarProducto.disabled = false;
                btnGuardarProducto.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
            });
        });
    }
    
    // Cancelar creación de producto
    if (btnCancelarProducto) {
        btnCancelarProducto.addEventListener('click', function() {
            formNuevoProducto.style.display = 'none';
            toggleFormNuevoProducto(false);
            productoError.style.display = 'none';
            document.getElementById('producto_nombre').value = '';
            document.getElementById('producto_descripcion').value = '';
            document.getElementById('producto_precio').value = '';
            document.getElementById('producto_stock').value = '0';
        });
    }
    
    // Inicializar
    actualizarIndices();

    function buildProductoPayload({ nombre, descripcion, precio, stock }) {
        const payload = {
            nombre: nombre,
            descripcion: descripcion || null,
            precio: precio,
            stock_actual: stock,
        };

        if (comprasProductoImagenes) {
            const urls = Array.from(comprasProductoImagenes.querySelectorAll('input[name="imagenes_urls[]"]')).map(i => i.value);
            const base64 = Array.from(comprasProductoImagenes.querySelectorAll('input[name="imagenes_base64[]"]')).map(i => i.value);
            payload.imagenes_urls = urls;
            payload.imagenes_base64 = base64;
        }

        return payload;
    }
});
