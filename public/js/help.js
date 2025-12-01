/**
 * JavaScript para el sistema de ayuda
 */

document.addEventListener('DOMContentLoaded', function() {
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const helpModalClose = document.getElementById('help-modal-close');
    
    if (!helpButton || !helpModal || !helpModalClose) {
        return; // Si no existen los elementos, no hacer nada
    }
    
    // Abrir modal
    helpButton.addEventListener('click', function() {
        helpModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    });
    
    // Cerrar modal al hacer clic en el botón de cerrar
    helpModalClose.addEventListener('click', function() {
        helpModal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    helpModal.addEventListener('click', function(e) {
        if (e.target === helpModal) {
            helpModal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    });
    
    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && helpModal.classList.contains('active')) {
            helpModal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    });
});

