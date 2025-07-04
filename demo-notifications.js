// ============================================
// DEMO DE NOTIFICACIONES - NEPTUNE
// ============================================

// Función para mostrar demo de notificaciones
function demoNotifications() {
    console.log('🎨 Demostrando sistema de notificaciones...');
    
    // Simular notificación de éxito
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification(
                'success',
                '¡Mensaje enviado exitosamente!',
                'Nos pondremos en contacto a la brevedad',
                'Revisaremos tu mensaje y te responderemos en las próximas 24 horas'
            );
        }
    }, 1000);

    // Simular notificación de error después de unos segundos
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification(
                'error',
                'Error al enviar mensaje',
                'Hubo un problema con la conexión',
                'Por favor, inténtalo de nuevo o contáctanos por WhatsApp'
            );
        }
    }, 3000);
}

// Hacer la función disponible globalmente
window.demoNotifications = demoNotifications;

console.log('🌌 Demo de notificaciones cargado. Ejecuta: demoNotifications()');
