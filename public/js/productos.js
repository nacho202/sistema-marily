/**
 * JavaScript para la gestión de productos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Modal de sumar stock (para móviles)
    const modalStock = document.getElementById('modal-stock');
    const stockBtnsMobile = document.querySelectorAll('.stock-btn-mobile');
    const closeModalStock = document.getElementById('close-modal-stock');
    const cancelModalStock = document.getElementById('cancel-modal-stock');
    const formStockModal = document.getElementById('form-stock-modal');
    const modalProductoNombre = document.getElementById('modal-producto-nombre');
    
    // Abrir modal al hacer clic en el botón de más
    stockBtnsMobile.forEach(btn => {
        btn.addEventListener('click', function() {
            const productoId = this.dataset.productoId;
            const productoNombre = this.dataset.productoNombre;
            
            modalProductoNombre.textContent = `Producto: ${productoNombre}`;
            formStockModal.action = `/productos/${productoId}/stock`;
            document.getElementById('cantidad-stock').value = '';
            modalStock.style.display = 'flex';
        });
    });
    
    // Cerrar modal
    function closeModal() {
        modalStock.style.display = 'none';
        document.getElementById('cantidad-stock').value = '';
    }
    
    if (closeModalStock) {
        closeModalStock.addEventListener('click', closeModal);
    }
    
    if (cancelModalStock) {
        cancelModalStock.addEventListener('click', closeModal);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalStock) {
        modalStock.addEventListener('click', function(e) {
            if (e.target === modalStock) {
                closeModal();
            }
        });
    }
});

