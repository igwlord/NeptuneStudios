// ============================================
// NEPTUNE LANDING PAGE - UTILIDADES DE SEGURIDAD
// Fase 3: Backend e Integración
// ============================================

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// ============================================
// SANITIZACIÓN DE ENTRADA
// ============================================

/**
 * Sanitiza input del usuario para prevenir XSS y injection attacks
 * @param {string} input - Input del usuario
 * @returns {string} - Input sanitizado
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Remover < y >
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+=/gi, '') // Remover event handlers
        .replace(/&lt;script&gt;/gi, '') // Remover <script> encoded
        .replace(/&lt;\/script&gt;/gi, '') // Remover </script> encoded
        .slice(0, 2000); // Limitar longitud máxima
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { 
        return map[m]; 
    });
}

// ============================================
// TOKENS CSRF
// ============================================

// Store para tokens CSRF en memoria (en producción usar Redis)
const csrfTokens = new Map();

/**
 * Genera un token CSRF válido
 * @returns {string} - Token CSRF
 */
function generateCSRFToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    
    // Guardar token con timestamp (expira en 1 hora)
    csrfTokens.set(token, timestamp);
    
    // Limpiar tokens expirados cada cierto tiempo
    cleanExpiredTokens();
    
    return token;
}

/**
 * Valida un token CSRF
 * @param {string} token - Token a validar
 * @returns {boolean} - True si es válido
 */
function validateCSRFToken(token) {
    if (!token || typeof token !== 'string') {
        return false;
    }
    
    const timestamp = csrfTokens.get(token);
    if (!timestamp) {
        return false;
    }
    
    // Token expira en 1 hora (3600000 ms)
    const isExpired = Date.now() - timestamp > 3600000;
    if (isExpired) {
        csrfTokens.delete(token);
        return false;
    }
    
    // Token válido - eliminar para prevenir reuso
    csrfTokens.delete(token);
    return true;
}

/**
 * Limpia tokens CSRF expirados
 */
function cleanExpiredTokens() {
    const now = Date.now();
    const oneHour = 3600000;
    
    for (const [token, timestamp] of csrfTokens.entries()) {
        if (now - timestamp > oneHour) {
            csrfTokens.delete(token);
        }
    }
}

// Limpiar tokens expirados cada 30 minutos
setInterval(cleanExpiredTokens, 30 * 60 * 1000);

// ============================================
// JWT TOKENS
// ============================================

/**
 * Genera un JWT token
 * @param {object} payload - Datos a incluir en el token
 * @param {string} expiresIn - Tiempo de expiración (ej: '1h', '7d')
 * @returns {string} - JWT token
 */
function generateJWTToken(payload, expiresIn = '1h') {
    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    
    return jwt.sign(payload, secret, {
        expiresIn: expiresIn,
        issuer: 'neptune-landing',
        audience: 'neptune-users'
    });
}

/**
 * Verifica y decodifica un JWT token
 * @param {string} token - Token a verificar
 * @returns {object|null} - Payload decodificado o null si es inválido
 */
function verifyJWTToken(token) {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
        
        return jwt.verify(token, secret, {
            issuer: 'neptune-landing',
            audience: 'neptune-users'
        });
    } catch (error) {
        console.error('Error verificando JWT:', error.message);
        return null;
    }
}

// ============================================
// HASH DE PASSWORDS
// ============================================

const bcrypt = require('bcryptjs');

/**
 * Hashea una contraseña
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verifica una contraseña contra su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>} - True si coincide
 */
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// ============================================
// GENERADORES DE ID ÚNICOS
// ============================================

/**
 * Genera un ID de sesión único
 * @returns {string} - ID de sesión
 */
function generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Genera un ID único para analytics
 * @returns {string} - ID único
 */
function generateUniqueId() {
    return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}

// ============================================
// VALIDACIONES DE SEGURIDAD
// ============================================

/**
 * Valida que una IP no esté en lista negra
 * @param {string} ip - Dirección IP
 * @returns {boolean} - True si es válida
 */
function isValidIP(ip) {
    // Lista negra básica (expandir según necesidades)
    const blacklistedIPs = [
        '0.0.0.0',
        '127.0.0.1', // Excepto para desarrollo
        '::1'
    ];
    
    // En desarrollo, permitir localhost
    if (process.env.NODE_ENV === 'development') {
        return !blacklistedIPs.filter(blockedIP => blockedIP !== '127.0.0.1').includes(ip);
    }
    
    return !blacklistedIPs.includes(ip);
}

/**
 * Valida User Agent para detectar bots maliciosos
 * @param {string} userAgent - String del User Agent
 * @returns {boolean} - True si es válido
 */
function isValidUserAgent(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') {
        return false;
    }
    
    // Lista de patrones sospechosos
    const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python/i,
        /java/i
    ];
    
    // Excepciones para bots legítimos
    const legitimateBots = [
        /googlebot/i,
        /bingbot/i,
        /facebookexternalhit/i,
        /twitterbot/i,
        /linkedinbot/i
    ];
    
    // Verificar si es un bot legítimo
    for (const pattern of legitimateBots) {
        if (pattern.test(userAgent)) {
            return true;
        }
    }
    
    // Verificar patrones sospechosos
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(userAgent)) {
            return false;
        }
    }
    
    return true;
}

// ============================================
// RATE LIMITING HELPERS
// ============================================

// Store para rate limiting en memoria (en producción usar Redis)
const rateLimitStore = new Map();

/**
 * Verifica rate limiting para una IP específica
 * @param {string} ip - Dirección IP
 * @param {number} maxRequests - Máximo número de requests
 * @param {number} windowMs - Ventana de tiempo en ms
 * @returns {object} - {allowed: boolean, remaining: number, resetTime: number}
 */
function checkRateLimit(ip, maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Obtener o crear registro para esta IP
    let ipRecord = rateLimitStore.get(ip) || { requests: [], resetTime: now + windowMs };
    
    // Filtrar requests dentro de la ventana actual
    ipRecord.requests = ipRecord.requests.filter(timestamp => timestamp > windowStart);
    
    // Verificar si excede el límite
    const requestCount = ipRecord.requests.length;
    const allowed = requestCount < maxRequests;
    
    if (allowed) {
        // Agregar request actual
        ipRecord.requests.push(now);
        ipRecord.resetTime = now + windowMs;
        rateLimitStore.set(ip, ipRecord);
    }
    
    return {
        allowed: allowed,
        remaining: Math.max(0, maxRequests - requestCount - (allowed ? 1 : 0)),
        resetTime: ipRecord.resetTime,
        total: maxRequests
    };
}

// Limpiar rate limit store cada hora
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitStore.entries()) {
        if (record.resetTime < now) {
            rateLimitStore.delete(ip);
        }
    }
}, 60 * 60 * 1000);

// ============================================
// EXPORTAR FUNCIONES
// ============================================

module.exports = {
    // Sanitización
    sanitizeInput,
    escapeHtml,
    
    // CSRF
    generateCSRFToken,
    validateCSRFToken,
    
    // JWT
    generateJWTToken,
    verifyJWTToken,
    
    // Passwords
    hashPassword,
    verifyPassword,
    
    // IDs únicos
    generateSessionId,
    generateUniqueId,
    
    // Validaciones
    isValidIP,
    isValidUserAgent,
    
    // Rate limiting
    checkRateLimit
};
