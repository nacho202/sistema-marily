/**
 * JavaScript para el formulario de ventas
 */

document.addEventListener('DOMContentLoaded', function() {
    const productosContainer = document.getElementById('productos-container');
    const agregarProductoBtn = document.getElementById('agregar-producto');
    const totalVentaSpan = document.getElementById('total-venta');
    const ventaForm = document.getElementById('ventaForm');
    
    let productoIndex = 1;
    
    // Agregar nuevo producto
    agregarProductoBtn.addEventListener('click', function() {
        const nuevoItem = crearProductoItem(productoIndex);
        productosContainer.appendChild(nuevoItem);
        initProductoSearch(nuevoItem);
        productoIndex++;
        actualizarTotal();
    });
    
    // Eliminar producto
    productosContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-producto')) {
            const item = e.target.closest('.producto-item');
            item.remove();
            actualizarTotal();
            actualizarIndices();
        }
    });
    
    // Calcular total cuando cambia cantidad o producto
    productosContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('producto-select') || e.target.classList.contains('cantidad-input')) {
            actualizarTotal();
            actualizarSubtotal(e.target.closest('.producto-item'));
        }
    });
    
    productosContainer.addEventListener('input', function(e) {
        if (e.target.classList.contains('cantidad-input')) {
            actualizarSubtotal(e.target.closest('.producto-item'));
            actualizarTotal();
        }
    });
    
    // Mostrar botón eliminar si hay más de un producto
    function actualizarIndices() {
        const items = productosContainer.querySelectorAll('.producto-item');
        items.forEach((item, index) => {
            const selects = item.querySelectorAll('select, input');
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
    
    function crearProductoItem(index) {
        const item = document.createElement('div');
        item.className = 'producto-item';
        
        const picker = productosContainer.querySelector('.producto-picker').cloneNode(true);
        const select = picker.querySelector('.producto-select');
        const searchInput = picker.querySelector('.producto-search');
        const dropdown = picker.querySelector('.producto-dropdown');

        select.setAttribute('name', `productos[${index}][producto_id]`);
        select.value = '';
        searchInput.value = '';
        dropdown.innerHTML = '';
        dropdown.style.display = 'none';
        
        const cantidadInput = productosContainer.querySelector('.cantidad-input').cloneNode(true);
        cantidadInput.setAttribute('name', `productos[${index}][cantidad]`);
        cantidadInput.value = '';
        
        const subtotalSpan = document.createElement('span');
        subtotalSpan.className = 'subtotal';
        subtotalSpan.textContent = '$0.00';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-danger btn-small remove-producto';
        removeBtn.textContent = 'Eliminar';
        removeBtn.style.display = 'inline-block';
        
        item.appendChild(picker);
        item.appendChild(cantidadInput);
        item.appendChild(subtotalSpan);
        item.appendChild(removeBtn);
        
        return item;
    }
    
    function actualizarSubtotal(item) {
        const select = item.querySelector('.producto-select');
        const cantidadInput = item.querySelector('.cantidad-input');
        const subtotalSpan = item.querySelector('.subtotal');
        
        const precio = parseFloat(select.options[select.selectedIndex]?.dataset.precio || 0);
        const cantidad = parseFloat(cantidadInput.value || 0);
        const subtotal = precio * cantidad;
        
        subtotalSpan.textContent = formatCurrency(subtotal);
    }
    
    function actualizarTotal() {
        let total = 0;
        const items = productosContainer.querySelectorAll('.producto-item');
        
        items.forEach(item => {
            const select = item.querySelector('.producto-select');
            const cantidadInput = item.querySelector('.cantidad-input');
            
            const precio = parseFloat(select.options[select.selectedIndex]?.dataset.precio || 0);
            const cantidad = parseFloat(cantidadInput.value || 0);
            total += precio * cantidad;
        });
        
        totalVentaSpan.textContent = formatCurrency(total);
    }
    
    // Validar stock antes de enviar
    ventaForm.addEventListener('submit', function(e) {
        // Asegurar que el select de cliente tenga el valor correcto
        if (clienteNoRegistrado && clienteNoRegistrado.checked) {
            clienteSelect.value = '';
        }
        
        // Deshabilitar campos del formulario de nuevo cliente si está oculto para evitar validación
        if (formNuevoCliente && formNuevoCliente.style.display === 'none') {
            toggleFormNuevoCliente(false);
        }
        
        const items = productosContainer.querySelectorAll('.producto-item');
        let hayError = false;
        let mensajeError = '';

        // Acumular cantidades por producto (por si se repite en varias filas)
        const cantidades = new Map();
        const stocks = new Map();
        const nombres = new Map();

        items.forEach(item => {
            const select = item.querySelector('.producto-select');
            const cantidadInput = item.querySelector('.cantidad-input');

            if (!select?.value || !cantidadInput?.value) return;

            const productoId = String(select.value);
            const stock = parseFloat(select.options[select.selectedIndex]?.dataset.stock || 0);
            const cantidad = parseFloat(cantidadInput.value || 0);
            const productoNombre = select.options[select.selectedIndex]?.text.split(' - ')[0] || '';

            stocks.set(productoId, stock);
            nombres.set(productoId, productoNombre);
            cantidades.set(productoId, (cantidades.get(productoId) || 0) + cantidad);
        });

        for (const [productoId, cantidadTotal] of cantidades.entries()) {
            const stock = stocks.get(productoId) || 0;
            if (cantidadTotal > stock) {
                hayError = true;
                const nombre = nombres.get(productoId) || 'Producto';
                mensajeError = `Stock insuficiente para ${nombre}. Stock disponible: ${stock}. Intentaste vender: ${cantidadTotal}`;
                break;
            }
        }
        
        if (hayError) {
            e.preventDefault();
            alert(mensajeError);
            return false;
        }
    });
    
    // Inicializar
    actualizarIndices();
    actualizarTotal();

    // Inicializar búsqueda de producto en la primera fila
    const firstItem = productosContainer.querySelector('.producto-item');
    if (firstItem) initProductoSearch(firstItem);
    
    // Funcionalidad para crear cliente inline
    const formNuevoCliente = document.getElementById('form-nuevo-cliente');
    const btnGuardarCliente = document.getElementById('btn-guardar-cliente');
    const btnCancelarCliente = document.getElementById('btn-cancelar-cliente');
    const clienteSelect = document.getElementById('cliente_id');
    const clienteError = document.getElementById('cliente-error');
    const clienteSearch = document.getElementById('cliente_search');
    const clienteDropdown = document.getElementById('cliente-dropdown');
    const clienteNoRegistrado = document.getElementById('cliente_no_registrado');
    const clienteNombre = document.getElementById('cliente_nombre');
    
    // Asegurar que el campo no tenga required si el formulario está oculto al cargar
    if (clienteNombre && formNuevoCliente && formNuevoCliente.style.display === 'none') {
        clienteNombre.required = false;
    }
    
    // Lista de todos los clientes para búsqueda
    let allClientes = [];
    if (clienteSelect) {
        allClientes = Array.from(clienteSelect.options).slice(1); // Excluir la opción "Cliente no registrado"
    }
    
    // Funcionalidad de búsqueda de clientes
    if (clienteSearch && clienteSelect) {
        
        clienteSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                clienteDropdown.style.display = 'none';
                return;
            }
            
            // Filtrar clientes
            const filtered = allClientes.filter(option => {
                return option.dataset.nombre.includes(searchTerm);
            });
            
            // Mostrar resultados
            if (filtered.length > 0) {
                clienteDropdown.innerHTML = '';
                filtered.forEach(option => {
                    const div = document.createElement('div');
                    div.style.padding = '0.7rem 1rem';
                    div.style.cursor = 'pointer';
                    div.style.borderBottom = '1px solid #d1cfff';
                    div.textContent = option.textContent;
                    div.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#e7e6ff';
                    });
                    div.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = 'transparent';
                    });
                    div.addEventListener('click', function() {
                        clienteSelect.value = option.value;
                        // Obtener el nombre limpio sin espacios extra
                        const nombreCliente = option.textContent.trim().replace(/\s+/g, ' ');
                        clienteSearch.value = nombreCliente;
                        clienteDropdown.style.display = 'none';
                        if (clienteNoRegistrado) {
                            clienteNoRegistrado.checked = false;
                        }
                        // Asegurarse de que el formulario de nuevo cliente esté oculto y deshabilitado
                        if (formNuevoCliente) {
                            formNuevoCliente.style.display = 'none';
                            toggleFormNuevoCliente(false);
                        }
                    });
                    clienteDropdown.appendChild(div);
                });
                clienteDropdown.style.display = 'block';
            } else {
                clienteDropdown.style.display = 'none';
            }
        });
        
        // Ocultar dropdown al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!clienteSearch.contains(e.target) && !clienteDropdown.contains(e.target)) {
                clienteDropdown.style.display = 'none';
            }
        });
        
        // Sincronizar con el select cuando cambia
        clienteSelect.addEventListener('change', function() {
            if (this.value) {
                const selectedOption = this.options[this.selectedIndex];
                const nombreCliente = selectedOption.textContent.trim().replace(/\s+/g, ' ');
                clienteSearch.value = nombreCliente;
            } else {
                clienteSearch.value = '';
            }
        });
    }
    
    // Función para habilitar/deshabilitar campos del formulario de nuevo cliente
    function toggleFormNuevoCliente(habilitar) {
        const clienteNombre = document.getElementById('cliente_nombre');
        const clienteTelefono = document.getElementById('cliente_telefono');
        const clienteEmail = document.getElementById('cliente_email');
        const clienteDireccion = document.getElementById('cliente_direccion');
        const clienteFechaNacimiento = document.getElementById('cliente_fecha_nacimiento');
        const clienteNota = document.getElementById('cliente_nota');
        
        const campos = [clienteNombre, clienteTelefono, clienteEmail, clienteDireccion, clienteFechaNacimiento, clienteNota];
        
        campos.forEach(campo => {
            if (campo) {
                if (habilitar) {
                    campo.disabled = false;
                    if (campo === clienteNombre) {
                        campo.required = true;
                    }
                } else {
                    campo.disabled = true;
                    campo.required = false;
                }
            }
        });
    }
    
    // Checkbox de cliente no registrado
    if (clienteNoRegistrado) {
        clienteNoRegistrado.addEventListener('change', function() {
            if (this.checked) {
                clienteSelect.value = '';
                clienteSearch.value = 'Cliente no registrado';
                clienteSearch.disabled = true;
                clienteDropdown.style.display = 'none';
                formNuevoCliente.style.display = 'block';
                toggleFormNuevoCliente(true);
            } else {
                clienteSearch.disabled = false;
                clienteSearch.value = '';
                clienteSelect.value = '';
                formNuevoCliente.style.display = 'none';
                toggleFormNuevoCliente(false);
            }
        });
    }
    
    // Inicializar: deshabilitar campos del formulario de nuevo cliente si está oculto
    if (formNuevoCliente && formNuevoCliente.style.display === 'none') {
        toggleFormNuevoCliente(false);
    }
    
    // Cancelar creación de cliente
    if (btnCancelarCliente) {
        btnCancelarCliente.addEventListener('click', function() {
            formNuevoCliente.style.display = 'none';
            toggleFormNuevoCliente(false);
            clienteError.style.display = 'none';
            if (clienteNoRegistrado) {
                clienteNoRegistrado.checked = false;
                if (clienteSearch) {
                    clienteSearch.disabled = false;
                    clienteSearch.value = '';
                }
            }
        });
    }
    
    // Guardar nuevo cliente
    if (btnGuardarCliente) {
        btnGuardarCliente.addEventListener('click', function() {
            const nombre = document.getElementById('cliente_nombre').value.trim();
            const telefono = document.getElementById('cliente_telefono').value.trim();
            const email = document.getElementById('cliente_email').value.trim();
            const direccion = document.getElementById('cliente_direccion').value.trim();
            const fechaNacimiento = document.getElementById('cliente_fecha_nacimiento').value;
            const nota = document.getElementById('cliente_nota').value.trim();
            
            // Validar nombre
            if (!nombre) {
                clienteError.textContent = 'El nombre es obligatorio';
                clienteError.style.display = 'block';
                return;
            }
            
            // Deshabilitar botón mientras se procesa
            btnGuardarCliente.disabled = true;
            btnGuardarCliente.textContent = 'Guardando...';
            
            // Crear cliente vía AJAX
            fetch('/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre,
                    telefono: telefono || null,
                    email: email || null,
                    direccion: direccion || null,
                    fecha_nacimiento: fechaNacimiento || null,
                    nota: nota || null
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.cliente) {
                    // Agregar nuevo cliente al select y a la lista de búsqueda
                    const option = document.createElement('option');
                    option.value = data.cliente.id;
                    option.textContent = data.cliente.nombre;
                    option.dataset.nombre = data.cliente.nombre.toLowerCase();
                    option.selected = true;
                    clienteSelect.appendChild(option);
                    
                    // Agregar a la lista de clientes para búsqueda
                    allClientes.push(option);
                    
                    // Actualizar el campo de búsqueda
                    clienteSearch.value = data.cliente.nombre;
                    clienteSearch.disabled = false;
                    clienteNoRegistrado.checked = false;
                    
                    // Ocultar formulario
                    formNuevoCliente.style.display = 'none';
                    toggleFormNuevoCliente(false);
                    clienteError.style.display = 'none';
                    // Deshabilitar validación cuando el formulario está oculto
                    const clienteNombre = document.getElementById('cliente_nombre');
                    if (clienteNombre) {
                        clienteNombre.required = false;
                    }
                    
                    // Mostrar mensaje de éxito
                    alert('Cliente creado exitosamente');
                } else {
                    clienteError.textContent = data.error || 'Error al crear el cliente';
                    clienteError.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                clienteError.textContent = 'Error al crear el cliente. Por favor, intenta nuevamente.';
                clienteError.style.display = 'block';
            })
            .finally(() => {
                btnGuardarCliente.disabled = false;
                btnGuardarCliente.textContent = 'Guardar Cliente';
            });
        });
    }
});

function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

function initProductoSearch(item) {
    const searchInput = item.querySelector('.producto-search');
    const select = item.querySelector('.producto-select');
    const dropdown = item.querySelector('.producto-dropdown');

    if (!searchInput || !select || !dropdown) return;

    const allOptions = Array.from(select.options).slice(1); // excluir "Seleccionar producto"

    function hideDropdown() {
        dropdown.style.display = 'none';
    }

    function showOptions(list) {
        dropdown.innerHTML = '';
        const limited = list.slice(0, 50);
        limited.forEach(option => {
            const div = document.createElement('div');
            div.style.padding = '0.7rem 1rem';
            div.style.cursor = 'pointer';
            div.style.borderBottom = '1px solid #d1cfff';
            div.textContent = option.textContent;
            div.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#e7e6ff';
            });
            div.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
            div.addEventListener('click', function() {
                select.value = option.value;
                searchInput.value = option.textContent.trim().replace(/\s+/g, ' ');
                hideDropdown();
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });
            dropdown.appendChild(div);
        });
        dropdown.style.display = limited.length ? 'block' : 'none';
    }

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const filtered = searchTerm
            ? allOptions.filter(opt => (opt.dataset?.search || opt.textContent || '').toLowerCase().includes(searchTerm))
            : allOptions;
        showOptions(filtered);
    });

    searchInput.addEventListener('focus', function() {
        if (dropdown.style.display === 'block') return;
        const searchTerm = this.value.toLowerCase().trim();
        const filtered = searchTerm
            ? allOptions.filter(opt => (opt.dataset?.search || opt.textContent || '').toLowerCase().includes(searchTerm))
            : allOptions;
        showOptions(filtered);
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            hideDropdown();
        }
    });

    // Si por alguna razón cambia el select (ej. por autofill), sincronizar input
    select.addEventListener('change', function() {
        if (this.value) {
            const selectedOption = this.options[this.selectedIndex];
            searchInput.value = selectedOption.textContent.trim().replace(/\s+/g, ' ');
        }
    });
}

