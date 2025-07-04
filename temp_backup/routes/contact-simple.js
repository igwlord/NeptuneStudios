// ============================================
// RUTA DE CONTACTO SIMPLIFICADA - SIN EMAIL
// Solo para verificar que el formulario funciona
// ============================================

const express = require('express');
const router = express.Router();

// POST /api/contact/send - Versión simplificada para testing
router.post('/send', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validación básica
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son obligatorios'
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Email inválido'
            });
        }

        // Log para verificar que llegan los datos
        console.log('📧 MENSAJE RECIBIDO:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 Nombre:', name);
        console.log('📧 Email:', email);
        console.log('💬 Mensaje:', message);
        console.log('🕐 Fecha:', new Date().toLocaleString('es-ES'));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Simular envío exitoso
        res.json({
            success: true,
            message: 'Mensaje recibido correctamente. Nos pondremos en contacto a la brevedad.'
        });

        console.log('✅ Respuesta enviada al cliente');

    } catch (error) {
        console.error('❌ Error procesando mensaje:', error);
        res.status(500).json({
            success: false,
            error: 'Error procesando el mensaje. Por favor, inténtalo de nuevo.'
        });
    }
});

module.exports = router;
