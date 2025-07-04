// ============================================
// NEPTUNE LANDING PAGE - RUTAS DE CONTACTO
// Fase 3: Backend e Integración
// ============================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { getDatabase } = require('../database/init');
const { logAnalyticsEvent } = require('../utils/analytics');
const { sanitizeInput, generateCSRFToken, validateCSRFToken } = require('../utils/security');

const router = express.Router();

// ============================================
// CONFIGURACIÓN DE EMAIL
// ============================================

const createEmailTransporter = () => {
    // Configuración simple para Gmail
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'neptnunestudios888@gmail.com',
            pass: process.env.EMAIL_PASS || 'tu_password_de_aplicacion' // Password de aplicación
        }
    });
};

// ============================================
// VALIDACIONES
// ============================================

const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[A-Za-zÀ-ÿ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('El email es demasiado largo'),
    
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('El mensaje debe tener entre 10 y 2000 caracteres'),
    
    body('phone')
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage('Número de teléfono inválido'),
    
    body('company')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Nombre de empresa demasiado largo'),
    
    body('csrf_token')
        .notEmpty()
        .withMessage('Token CSRF requerido')
];

// ============================================
// RUTAS
// ============================================

// GET /api/contact/csrf - Obtener token CSRF
router.get('/csrf', (req, res) => {
    try {
        const token = generateCSRFToken();
        res.json({ 
            csrf_token: token,
            expires_in: 3600 // 1 hora
        });
    } catch (error) {
        console.error('Error generando token CSRF:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
});

// POST /api/contact/send - Envío simplificado de contacto
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

        // Crear transporter
        const transporter = createEmailTransporter();
        
        // Configurar el email
        const mailOptions = {
            from: `"${name}" <neptnunestudios888@gmail.com>`,
            to: 'neptnunestudios888@gmail.com',
            subject: `Nuevo contacto de ${name} - Neptune Landing Page`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0a0a2e 0%, #2d1b69 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">NEPTUNE STUDIOS</h1>
                        <p style="color: #a855f7; margin: 5px 0;">Nuevo mensaje de contacto</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2d1b69; border-bottom: 2px solid #a855f7; padding-bottom: 10px;">
                            Información del contacto
                        </h2>
                        
                        <div style="margin: 20px 0;">
                            <strong style="color: #2d1b69;">Nombre:</strong>
                            <p style="margin: 5px 0; padding: 10px; background: white; border-left: 4px solid #a855f7;">
                                ${name}
                            </p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <strong style="color: #2d1b69;">Email:</strong>
                            <p style="margin: 5px 0; padding: 10px; background: white; border-left: 4px solid #a855f7;">
                                <a href="mailto:${email}" style="color: #2d1b69; text-decoration: none;">${email}</a>
                            </p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <strong style="color: #2d1b69;">Mensaje:</strong>
                            <div style="margin: 5px 0; padding: 15px; background: white; border-left: 4px solid #a855f7; white-space: pre-wrap;">
                                ${message}
                            </div>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                            <p>📅 Fecha: ${new Date().toLocaleString('es-ES')}</p>
                            <p>🌐 Enviado desde: Neptune Landing Page</p>
                            <p>📧 Responder a: ${email}</p>
                        </div>
                    </div>
                    
                    <div style="background: #2d1b69; padding: 15px; text-align: center;">
                        <p style="color: white; margin: 0; font-size: 14px;">
                            Este mensaje fue enviado automáticamente desde el formulario de contacto
                        </p>
                    </div>
                </div>
            `,
            replyTo: email
        };

        // Enviar email
        await transporter.sendMail(mailOptions);

        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Nos pondremos en contacto a la brevedad. Gracias por confiar en Neptune.'
        });

        console.log(`✅ Email enviado desde: ${email} (${name})`);

    } catch (error) {
        console.error('❌ Error enviando email:', error);
        res.status(500).json({
            success: false,
            error: 'Error enviando el mensaje. Por favor, inténtalo de nuevo.'
        });
    }
});

// POST /api/contact/submit - Enviar formulario de contacto (versión completa)
router.post('/submit', contactValidation, async (req, res) => {
    try {
        // Validar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await logAnalyticsEvent(req, 'form_validation_error', {
                errors: errors.array().map(err => err.msg)
            });
            
            return res.status(400).json({
                error: 'Datos inválidos',
                details: errors.array()
            });
        }

        const { name, email, message, phone, company, csrf_token } = req.body;

        // Validar token CSRF
        if (!validateCSRFToken(csrf_token)) {
            await logAnalyticsEvent(req, 'csrf_validation_error');
            return res.status(403).json({
                error: 'Token CSRF inválido o expirado'
            });
        }

        // Sanitizar datos
        const sanitizedData = {
            name: sanitizeInput(name),
            email: sanitizeInput(email),
            message: sanitizeInput(message),
            phone: phone ? sanitizeInput(phone) : null,
            company: company ? sanitizeInput(company) : null,
            csrf_token: csrf_token,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent')
        };

        // Guardar en base de datos
        const db = await getDatabase();
        
        const insertContact = new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO contacts (
                    name, email, message, phone, company, 
                    csrf_token, ip_address, user_agent, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
            `);
            
            stmt.run([
                sanitizedData.name,
                sanitizedData.email,
                sanitizedData.message,
                sanitizedData.phone,
                sanitizedData.company,
                sanitizedData.csrf_token,
                sanitizedData.ip_address,
                sanitizedData.user_agent
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
            
            stmt.finalize();
        });

        const contactId = await insertContact;
        
        // Cerrar conexión DB
        db.close();

        // Enviar email si está habilitado
        let emailSent = false;
        if (process.env.ENABLE_EMAIL === 'true') {
            try {
                const transporter = createEmailTransporter();
                if (transporter) {
                    const mailOptions = {
                        from: process.env.EMAIL_FROM,
                        to: process.env.EMAIL_TO,
                        subject: `[NEPTUNE] Nuevo contacto de ${sanitizedData.name}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #A855F7; border-bottom: 2px solid #A855F7; padding-bottom: 10px;">
                                    🌌 Nuevo mensaje desde Neptune Landing Page
                                </h2>
                                
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="margin-top: 0; color: #333;">Información de contacto:</h3>
                                    <p><strong>Nombre:</strong> ${sanitizedData.name}</p>
                                    <p><strong>Email:</strong> <a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></p>
                                    ${sanitizedData.phone ? `<p><strong>Teléfono:</strong> ${sanitizedData.phone}</p>` : ''}
                                    ${sanitizedData.company ? `<p><strong>Empresa:</strong> ${sanitizedData.company}</p>` : ''}
                                </div>
                                
                                <div style="background: #ffffff; padding: 20px; border-left: 4px solid #A855F7; margin: 20px 0;">
                                    <h3 style="margin-top: 0; color: #333;">Mensaje:</h3>
                                    <p style="line-height: 1.6; color: #555;">${sanitizedData.message}</p>
                                </div>
                                
                                <div style="background: #f1f3f4; padding: 15px; border-radius: 8px; font-size: 12px; color: #666;">
                                    <p><strong>ID de contacto:</strong> ${contactId}</p>
                                    <p><strong>IP:</strong> ${sanitizedData.ip_address}</p>
                                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</p>
                                    <p><strong>User Agent:</strong> ${sanitizedData.user_agent}</p>
                                </div>
                                
                                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                                    <p style="color: #888; font-size: 12px;">
                                        Este mensaje fue enviado desde el formulario de contacto de Neptune Landing Page
                                    </p>
                                </div>
                            </div>
                        `,
                        replyTo: sanitizedData.email
                    };

                    await transporter.sendMail(mailOptions);
                    emailSent = true;
                }
            } catch (emailError) {
                console.error('Error enviando email:', emailError);
                // No fallar la request por error de email
            }
        }

        // Log analytics
        await logAnalyticsEvent(req, 'contact_form_submit', {
            contactId: contactId,
            emailSent: emailSent,
            hasPhone: !!sanitizedData.phone,
            hasCompany: !!sanitizedData.company
        });

        res.json({
            success: true,
            message: '¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.',
            contactId: contactId,
            emailSent: emailSent
        });

    } catch (error) {
        console.error('Error en formulario de contacto:', error);
        
        await logAnalyticsEvent(req, 'contact_form_error', {
            error: error.message
        });
        
        res.status(500).json({
            error: 'Error interno del servidor. Por favor, intenta de nuevo más tarde.'
        });
    }
});

// GET /api/contact/stats - Estadísticas de contactos (para admin)
router.get('/stats', async (req, res) => {
    try {
        const db = await getDatabase();
        
        const stats = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_contacts,
                    COUNT(CASE WHEN status = 'read' THEN 1 END) as read_contacts,
                    COUNT(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 END) as last_24h,
                    COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as last_week
                FROM contacts
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });
        
        db.close();
        
        res.json({
            stats: stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            error: 'Error obteniendo estadísticas'
        });
    }
});

module.exports = router;
