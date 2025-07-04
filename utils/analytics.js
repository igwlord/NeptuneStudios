// ============================================
// NEPTUNE LANDING PAGE - UTILIDADES DE ANALYTICS
// Fase 3: Backend e Integración
// ============================================

const { getDatabase } = require('../database/init');
const { generateUniqueId, generateSessionId } = require('./security');

// ============================================
// FUNCIONES DE ANALYTICS
// ============================================

/**
 * Registra un evento de analytics en la base de datos
 * @param {object} req - Request object de Express
 * @param {string} eventType - Tipo de evento
 * @param {object} eventData - Datos adicionales del evento
 * @returns {Promise<number>} - ID del evento registrado
 */
async function logAnalyticsEvent(req, eventType, eventData = {}) {
    try {
        // Solo registrar si analytics está habilitado
        if (process.env.ENABLE_ANALYTICS !== 'true') {
            return null;
        }

        const db = await getDatabase();
        
        const analyticsData = {
            event_type: eventType,
            event_data: JSON.stringify(eventData),
            session_id: getSessionId(req),
            user_id: getUserId(req),
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer') || req.get('Referrer'),
            page_url: req.originalUrl || req.url
        };

        const eventId = await new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO analytics_events (
                    event_type, event_data, session_id, user_id,
                    ip_address, user_agent, referrer, page_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run([
                analyticsData.event_type,
                analyticsData.event_data,
                analyticsData.session_id,
                analyticsData.user_id,
                analyticsData.ip_address,
                analyticsData.user_agent,
                analyticsData.referrer,
                analyticsData.page_url
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
        return eventId;

    } catch (error) {
        console.error('Error registrando evento de analytics:', error);
        return null;
    }
}

/**
 * Obtiene o genera un session ID para el usuario
 * @param {object} req - Request object
 * @returns {string} - Session ID
 */
function getSessionId(req) {
    // Verificar si ya existe en headers o cookies
    let sessionId = req.get('X-Session-ID') || req.cookies?.sessionId;
    
    if (!sessionId) {
        sessionId = generateSessionId();
        // En una implementación real, guardar en cookie o session store
    }
    
    return sessionId;
}

/**
 * Obtiene el user ID si está autenticado
 * @param {object} req - Request object
 * @returns {string|null} - User ID o null
 */
function getUserId(req) {
    // En el futuro, obtener de JWT token o session
    return req.user?.id || null;
}

/**
 * Obtiene estadísticas de analytics
 * @param {string} startDate - Fecha inicio (ISO string)
 * @param {string} endDate - Fecha fin (ISO string)
 * @returns {Promise<object>} - Estadísticas
 */
async function getAnalyticsStats(startDate, endDate) {
    try {
        const db = await getDatabase();
        
        const stats = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    event_type,
                    COUNT(*) as count,
                    DATE(created_at) as date
                FROM analytics_events
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY event_type, DATE(created_at)
                ORDER BY created_at DESC
            `, [startDate, endDate], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Obtener estadísticas generales
        const generalStats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total_events,
                    COUNT(DISTINCT session_id) as unique_sessions,
                    COUNT(DISTINCT ip_address) as unique_visitors,
                    COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
                    COUNT(CASE WHEN event_type = 'contact_form_submit' THEN 1 END) as form_submissions,
                    COUNT(CASE WHEN event_type = 'quiz_completed' THEN 1 END) as quiz_completions
                FROM analytics_events
                WHERE created_at >= ? AND created_at <= ?
            `, [startDate, endDate], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        // Obtener top páginas
        const topPages = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    page_url,
                    COUNT(*) as views
                FROM analytics_events
                WHERE event_type = 'page_view' AND created_at >= ? AND created_at <= ?
                GROUP BY page_url
                ORDER BY views DESC
                LIMIT 10
            `, [startDate, endDate], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Obtener referrers
        const topReferrers = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    referrer,
                    COUNT(*) as visits
                FROM analytics_events
                WHERE referrer IS NOT NULL AND referrer != '' AND created_at >= ? AND created_at <= ?
                GROUP BY referrer
                ORDER BY visits DESC
                LIMIT 10
            `, [startDate, endDate], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        db.close();

        return {
            general: generalStats,
            events_by_type: stats,
            top_pages: topPages,
            top_referrers: topReferrers,
            period: {
                start: startDate,
                end: endDate
            }
        };

    } catch (error) {
        console.error('Error obteniendo estadísticas de analytics:', error);
        throw error;
    }
}

/**
 * Registra una vista de página
 * @param {object} req - Request object
 * @param {string} pageTitle - Título de la página
 * @returns {Promise<number>} - ID del evento
 */
async function logPageView(req, pageTitle = null) {
    return await logAnalyticsEvent(req, 'page_view', {
        page_title: pageTitle,
        timestamp: new Date().toISOString()
    });
}

/**
 * Registra un clic en botón o enlace
 * @param {object} req - Request object
 * @param {string} elementId - ID del elemento
 * @param {string} elementText - Texto del elemento
 * @param {string} targetUrl - URL de destino (para enlaces)
 * @returns {Promise<number>} - ID del evento
 */
async function logButtonClick(req, elementId, elementText, targetUrl = null) {
    return await logAnalyticsEvent(req, 'button_click', {
        element_id: elementId,
        element_text: elementText,
        target_url: targetUrl,
        timestamp: new Date().toISOString()
    });
}

/**
 * Registra el inicio de un quiz
 * @param {object} req - Request object
 * @returns {Promise<number>} - ID del evento
 */
async function logQuizStart(req) {
    return await logAnalyticsEvent(req, 'quiz_start', {
        timestamp: new Date().toISOString()
    });
}

/**
 * Registra la finalización de un quiz
 * @param {object} req - Request object
 * @param {string} resultProfile - Perfil resultado del quiz
 * @param {object} scores - Puntajes del quiz
 * @returns {Promise<number>} - ID del evento
 */
async function logQuizCompletion(req, resultProfile, scores) {
    return await logAnalyticsEvent(req, 'quiz_completed', {
        result_profile: resultProfile,
        scores: scores,
        timestamp: new Date().toISOString()
    });
}

/**
 * Registra tiempo de permanencia en la página
 * @param {object} req - Request object
 * @param {number} timeSpent - Tiempo en segundos
 * @returns {Promise<number>} - ID del evento
 */
async function logTimeSpent(req, timeSpent) {
    return await logAnalyticsEvent(req, 'time_spent', {
        time_seconds: timeSpent,
        timestamp: new Date().toISOString()
    });
}

/**
 * Registra scroll profundidad
 * @param {object} req - Request object
 * @param {number} maxScrollPercentage - Porcentaje máximo de scroll
 * @returns {Promise<number>} - ID del evento
 */
async function logScrollDepth(req, maxScrollPercentage) {
    return await logAnalyticsEvent(req, 'scroll_depth', {
        max_scroll_percentage: maxScrollPercentage,
        timestamp: new Date().toISOString()
    });
}

/**
 * Obtiene el rendimiento de conversión
 * @param {string} startDate - Fecha inicio
 * @param {string} endDate - Fecha fin
 * @returns {Promise<object>} - Métricas de conversión
 */
async function getConversionMetrics(startDate, endDate) {
    try {
        const db = await getDatabase();
        
        const metrics = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) as total_visitors,
                    COUNT(DISTINCT CASE WHEN event_type = 'quiz_start' THEN session_id END) as quiz_starters,
                    COUNT(DISTINCT CASE WHEN event_type = 'quiz_completed' THEN session_id END) as quiz_completers,
                    COUNT(DISTINCT CASE WHEN event_type = 'contact_form_submit' THEN session_id END) as form_submitters,
                    
                    ROUND(
                        CAST(COUNT(DISTINCT CASE WHEN event_type = 'quiz_start' THEN session_id END) AS FLOAT) /
                        CAST(COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) AS FLOAT) * 100, 2
                    ) as quiz_start_rate,
                    
                    ROUND(
                        CAST(COUNT(DISTINCT CASE WHEN event_type = 'quiz_completed' THEN session_id END) AS FLOAT) /
                        CAST(COUNT(DISTINCT CASE WHEN event_type = 'quiz_start' THEN session_id END) AS FLOAT) * 100, 2
                    ) as quiz_completion_rate,
                    
                    ROUND(
                        CAST(COUNT(DISTINCT CASE WHEN event_type = 'contact_form_submit' THEN session_id END) AS FLOAT) /
                        CAST(COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) AS FLOAT) * 100, 2
                    ) as conversion_rate
                    
                FROM analytics_events
                WHERE created_at >= ? AND created_at <= ?
            `, [startDate, endDate], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        db.close();
        return metrics;

    } catch (error) {
        console.error('Error obteniendo métricas de conversión:', error);
        throw error;
    }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

module.exports = {
    logAnalyticsEvent,
    getAnalyticsStats,
    getConversionMetrics,
    
    // Eventos específicos
    logPageView,
    logButtonClick,
    logQuizStart,
    logQuizCompletion,
    logTimeSpent,
    logScrollDepth,
    
    // Utilidades
    getSessionId,
    getUserId
};
