// ============================================
// NEPTUNE LANDING PAGE - RUTAS DE TESTIMONIOS
// Fase 3: Backend e Integración
// ============================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { logAnalyticsEvent } = require('../utils/analytics');
const { sanitizeInput } = require('../utils/security');

const router = express.Router();

// ============================================
// VALIDACIONES
// ============================================

const testimonialValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[A-Za-zÀ-ÿ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('company')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Nombre de empresa demasiado largo'),
    
    body('position')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Posición demasiado larga'),
    
    body('text')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('El testimonio debe tener entre 10 y 1000 caracteres'),
    
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('La calificación debe ser entre 1 y 5'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail()
];

// ============================================
// RUTAS PÚBLICAS
// ============================================

// GET /api/testimonials - Obtener testimonios activos
router.get('/', async (req, res) => {
    try {
        const { featured_only, limit = 20, offset = 0 } = req.query;
        
        const db = await getDatabase();
        
        let query = `
            SELECT 
                id, name, company, position, text, rating, avatar_url, is_featured,
                created_at, updated_at
            FROM testimonials 
            WHERE is_active = 1
        `;
        
        const params = [];
        
        if (featured_only === 'true') {
            query += ` AND is_featured = 1`;
        }
        
        query += ` ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const testimonials = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        // Obtener total count
        const totalCount = await new Promise((resolve, reject) => {
            let countQuery = `SELECT COUNT(*) as total FROM testimonials WHERE is_active = 1`;
            if (featured_only === 'true') {
                countQuery += ` AND is_featured = 1`;
            }
            
            db.get(countQuery, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.total);
                }
            });
        });
        
        db.close();
        
        // Log analytics
        await logAnalyticsEvent(req, 'testimonials_viewed', {
            featured_only: featured_only === 'true',
            count: testimonials.length,
            total_available: totalCount
        });
        
        res.json({
            testimonials: testimonials,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: (parseInt(offset) + testimonials.length) < totalCount
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo testimonios:', error);
        res.status(500).json({
            error: 'Error obteniendo testimonios'
        });
    }
});

// GET /api/testimonials/featured - Obtener solo testimonios destacados
router.get('/featured', async (req, res) => {
    try {
        const db = await getDatabase();
        
        const testimonials = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id, name, company, position, text, rating, avatar_url,
                    created_at, updated_at
                FROM testimonials 
                WHERE is_active = 1 AND is_featured = 1
                ORDER BY created_at DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        db.close();
        
        res.json({
            testimonials: testimonials,
            count: testimonials.length
        });
        
    } catch (error) {
        console.error('Error obteniendo testimonios destacados:', error);
        res.status(500).json({
            error: 'Error obteniendo testimonios destacados'
        });
    }
});

// POST /api/testimonials/submit - Enviar nuevo testimonio
router.post('/submit', testimonialValidation, async (req, res) => {
    try {
        // Validar errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await logAnalyticsEvent(req, 'testimonial_validation_error', {
                errors: errors.array().map(err => err.msg)
            });
            
            return res.status(400).json({
                error: 'Datos inválidos',
                details: errors.array()
            });
        }
        
        const { name, company, position, text, rating, email } = req.body;
        
        // Sanitizar datos
        const sanitizedData = {
            name: sanitizeInput(name),
            company: company ? sanitizeInput(company) : null,
            position: position ? sanitizeInput(position) : null,
            text: sanitizeInput(text),
            rating: parseInt(rating),
            email: email ? sanitizeInput(email) : null
        };
        
        // Insertar en base de datos
        const db = await getDatabase();
        
        const testimonialId = await new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO testimonials (
                    name, company, position, text, rating, 
                    is_featured, is_active
                ) VALUES (?, ?, ?, ?, ?, 0, ?)
            `);
            
            // Auto-aprobar si está configurado, sino requiere moderación
            const autoApprove = process.env.TESTIMONIALS_AUTO_APPROVE === 'true' ? 1 : 0;
            
            stmt.run([
                sanitizedData.name,
                sanitizedData.company,
                sanitizedData.position,
                sanitizedData.text,
                sanitizedData.rating,
                autoApprove
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
            
            stmt.finalize();
        });
        
        db.close();
        
        // Log analytics
        await logAnalyticsEvent(req, 'testimonial_submitted', {
            testimonial_id: testimonialId,
            rating: sanitizedData.rating,
            has_company: !!sanitizedData.company,
            has_position: !!sanitizedData.position,
            auto_approved: process.env.TESTIMONIALS_AUTO_APPROVE === 'true'
        });
        
        res.json({
            success: true,
            message: process.env.TESTIMONIALS_AUTO_APPROVE === 'true' 
                ? '¡Gracias por tu testimonio! Ya está publicado.'
                : '¡Gracias por tu testimonio! Será revisado antes de publicarse.',
            testimonial_id: testimonialId,
            requires_approval: process.env.TESTIMONIALS_AUTO_APPROVE !== 'true'
        });
        
    } catch (error) {
        console.error('Error enviando testimonio:', error);
        
        await logAnalyticsEvent(req, 'testimonial_submit_error', {
            error: error.message
        });
        
        res.status(500).json({
            error: 'Error enviando testimonio. Intenta de nuevo más tarde.'
        });
    }
});

// ============================================
// RUTAS DE ADMINISTRACIÓN (FUTURO)
// ============================================

// GET /api/testimonials/pending - Obtener testimonios pendientes de aprobación
router.get('/pending', async (req, res) => {
    try {
        // TODO: Agregar middleware de autenticación de admin
        
        const db = await getDatabase();
        
        const pendingTestimonials = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id, name, company, position, text, rating, 
                    created_at, updated_at
                FROM testimonials 
                WHERE is_active = 0
                ORDER BY created_at ASC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        db.close();
        
        res.json({
            pending_testimonials: pendingTestimonials,
            count: pendingTestimonials.length
        });
        
    } catch (error) {
        console.error('Error obteniendo testimonios pendientes:', error);
        res.status(500).json({
            error: 'Error obteniendo testimonios pendientes'
        });
    }
});

// PUT /api/testimonials/:id/approve - Aprobar testimonio
router.put('/:id/approve', async (req, res) => {
    try {
        // TODO: Agregar middleware de autenticación de admin
        
        const testimonialId = parseInt(req.params.id);
        const { featured = false } = req.body;
        
        if (!testimonialId || isNaN(testimonialId)) {
            return res.status(400).json({
                error: 'ID de testimonio inválido'
            });
        }
        
        const db = await getDatabase();
        
        const result = await new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                UPDATE testimonials 
                SET is_active = 1, is_featured = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            
            stmt.run([featured ? 1 : 0, testimonialId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
            
            stmt.finalize();
        });
        
        db.close();
        
        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Testimonio no encontrado'
            });
        }
        
        await logAnalyticsEvent(req, 'testimonial_approved', {
            testimonial_id: testimonialId,
            featured: featured
        });
        
        res.json({
            success: true,
            message: 'Testimonio aprobado correctamente',
            featured: featured
        });
        
    } catch (error) {
        console.error('Error aprobando testimonio:', error);
        res.status(500).json({
            error: 'Error aprobando testimonio'
        });
    }
});

// DELETE /api/testimonials/:id - Eliminar testimonio
router.delete('/:id', async (req, res) => {
    try {
        // TODO: Agregar middleware de autenticación de admin
        
        const testimonialId = parseInt(req.params.id);
        
        if (!testimonialId || isNaN(testimonialId)) {
            return res.status(400).json({
                error: 'ID de testimonio inválido'
            });
        }
        
        const db = await getDatabase();
        
        const result = await new Promise((resolve, reject) => {
            const stmt = db.prepare(`DELETE FROM testimonials WHERE id = ?`);
            
            stmt.run([testimonialId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
            
            stmt.finalize();
        });
        
        db.close();
        
        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Testimonio no encontrado'
            });
        }
        
        await logAnalyticsEvent(req, 'testimonial_deleted', {
            testimonial_id: testimonialId
        });
        
        res.json({
            success: true,
            message: 'Testimonio eliminado correctamente'
        });
        
    } catch (error) {
        console.error('Error eliminando testimonio:', error);
        res.status(500).json({
            error: 'Error eliminando testimonio'
        });
    }
});

// GET /api/testimonials/stats - Estadísticas de testimonios
router.get('/stats', async (req, res) => {
    try {
        const db = await getDatabase();
        
        const stats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active,
                    COUNT(CASE WHEN is_active = 0 THEN 1 END) as pending,
                    COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured,
                    ROUND(AVG(rating), 2) as average_rating,
                    COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as last_30_days
                FROM testimonials
            `, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        db.close();
        
        res.json({
            stats: stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas de testimonios:', error);
        res.status(500).json({
            error: 'Error obteniendo estadísticas'
        });
    }
});

module.exports = router;
