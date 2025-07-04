const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { sanitizeInput } = require('../utils/security');
const { recordEvent, getAnalyticsData, getConversionMetrics } = require('../utils/analytics');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Rate limiting para analytics
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 eventos por IP por minuto
  message: {
    success: false,
    error: 'Demasiados eventos enviados. Por favor, espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validaciones para eventos
const eventValidation = [
  body('event').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Evento inválido'),
  body('data').optional().isObject().withMessage('Datos deben ser un objeto'),
  body('page').optional().isString().trim().isLength({ max: 200 }).withMessage('Página inválida')
];

// POST /api/analytics/event - Registrar evento de analytics
router.post('/event', analyticsLimiter, eventValidation, async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { event, data, page } = req.body;

    // Sanitizar datos
    const sanitizedData = {
      event: sanitizeInput(event),
      data: data ? JSON.parse(JSON.stringify(data)) : {},
      page: page ? sanitizeInput(page) : null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      timestamp: new Date().toISOString()
    };

    // Registrar evento
    await recordEvent(sanitizedData.event, sanitizedData.ip, {
      ...sanitizedData.data,
      page: sanitizedData.page,
      userAgent: sanitizedData.userAgent,
      referer: sanitizedData.referer,
      timestamp: sanitizedData.timestamp
    });

    res.json({
      success: true,
      message: 'Evento registrado correctamente'
    });

  } catch (error) {
    console.error('Error al registrar evento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/analytics/page-view - Registrar vista de página
router.post('/page-view', analyticsLimiter, async (req, res) => {
  try {
    const { page, title, referrer } = req.body;

    const pageData = {
      page: page ? sanitizeInput(page) : '/',
      title: title ? sanitizeInput(title) : 'Neptune Studios',
      referrer: referrer ? sanitizeInput(referrer) : null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    await recordEvent('page_view', pageData.ip, pageData);

    res.json({
      success: true,
      message: 'Vista de página registrada'
    });

  } catch (error) {
    console.error('Error al registrar vista de página:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/analytics/interaction - Registrar interacción del usuario
router.post('/interaction', analyticsLimiter, async (req, res) => {
  try {
    const { type, element, section, value } = req.body;

    const interactionData = {
      type: type ? sanitizeInput(type) : 'click',
      element: element ? sanitizeInput(element) : null,
      section: section ? sanitizeInput(section) : null,
      value: value ? sanitizeInput(value) : null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    await recordEvent('user_interaction', interactionData.ip, interactionData);

    res.json({
      success: true,
      message: 'Interacción registrada'
    });

  } catch (error) {
    console.error('Error al registrar interacción:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/analytics/stats - Obtener estadísticas generales (requiere autenticación)
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate, event } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      event: event ? sanitizeInput(event) : null
    };

    const stats = await getAnalyticsData(filters);

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/analytics/dashboard - Obtener datos para dashboard (requiere autenticación)
router.get('/dashboard', async (req, res) => {
  try {
    const db = new sqlite3.Database(path.join(__dirname, '../database/database.sqlite'));

    // Obtener estadísticas generales
    const totalEvents = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM analytics_events', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const totalContacts = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM contacts', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const totalQuizzes = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM quiz_results', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Obtener eventos recientes
    const recentEvents = await new Promise((resolve, reject) => {
      db.all(`
        SELECT event_type, COUNT(*) as count, DATE(created_at) as date
        FROM analytics_events 
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY event_type, DATE(created_at)
        ORDER BY created_at DESC
        LIMIT 50
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Obtener conversiones
    const conversions = await getConversionMetrics();

    // Obtener páginas más visitadas
    const topPages = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          JSON_EXTRACT(event_data, '$.page') as page,
          COUNT(*) as views
        FROM analytics_events 
        WHERE event_type = 'page_view' 
          AND created_at >= datetime('now', '-30 days')
        GROUP BY JSON_EXTRACT(event_data, '$.page')
        ORDER BY views DESC
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    const dashboardData = {
      summary: {
        totalEvents,
        totalContacts,
        totalQuizzes,
        conversionRate: conversions.conversionRate
      },
      recentEvents,
      conversions,
      topPages,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/analytics/conversion - Obtener métricas de conversión
router.get('/conversion', async (req, res) => {
  try {
    const metrics = await getConversionMetrics();

    res.json({
      success: true,
      metrics: metrics
    });

  } catch (error) {
    console.error('Error al obtener métricas de conversión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/analytics/realtime - Obtener datos en tiempo real
router.get('/realtime', async (req, res) => {
  try {
    const db = new sqlite3.Database(path.join(__dirname, '../database/database.sqlite'));

    // Eventos de los últimos 5 minutos
    const realtimeEvents = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          event_type,
          event_data,
          user_ip,
          created_at
        FROM analytics_events 
        WHERE created_at >= datetime('now', '-5 minutes')
        ORDER BY created_at DESC
        LIMIT 20
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => ({
          ...row,
          event_data: JSON.parse(row.event_data)
        })));
      });
    });

    // Usuarios activos (últimos 30 minutos)
    const activeUsers = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(DISTINCT user_ip) as count
        FROM analytics_events 
        WHERE created_at >= datetime('now', '-30 minutes')
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    db.close();

    res.json({
      success: true,
      data: {
        activeUsers,
        recentEvents: realtimeEvents,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error al obtener datos en tiempo real:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
