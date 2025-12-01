/**
 * Funciones generales del sistema
 */

// Confirmar eliminaciones
document.addEventListener('DOMContentLoaded', function() {
    // Los formularios con onsubmit ya tienen confirmación inline
    // Esta función es para otros casos si es necesario
});

/**
 * Formatea un número como moneda
 */
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

/**
 * Valida que un número sea positivo
 */
function validatePositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

