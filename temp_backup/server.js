// ============================================
// NEPTUNE LANDING PAGE - SERVIDOR BACKEND
// Fase 3: Backend e Integración
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Importar rutas
const contactRoutes = require('./routes/contact');  // Versión completa con email
const testimonialsRoutes = require('./routes/testimonials');
const quizRoutes = require('./routes/quiz');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');

// Importar base de datos
const { initDatabase } = require('./database/simple-init');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

// Helmet para headers de seguridad - CSP relajado para desarrollo
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://cdn.jsdelivr.net", "blob:", "data:"],
            scriptSrcAttr: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "ws:", "wss:"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            workerSrc: ["'self'", "blob:"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutos por defecto
    max: process.env.RATE_LIMIT_MAX || 100, // máximo 100 requests por ventana
    message: {
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
        retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW || 15) * 60)
    },
    standardHeaders: true,
    legacyHeaders: false
});

if (process.env.ENABLE_RATE_LIMITING === 'true') {
    app.use('/api/', limiter);
}

// Rate limiting específico para formulario de contacto
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 envíos de formulario por 15 minutos
    message: {
        error: 'Límite de envíos alcanzado. Puedes enviar máximo 5 mensajes cada 15 minutos.',
        retryAfter: 15 * 60
    }
});

// ============================================
// MIDDLEWARES GENERALES
// ============================================

// Compresión GZIP
app.use(compression());

// Logging
if (process.env.ENABLE_LOGGING === 'true') {
    app.use(morgan('combined'));
}

// CORS configurado
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://neptune-studios.com', 'https://www.neptune-studios.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname), {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Cache headers para recursos estáticos
        if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 año
        } else if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora
        }
    }
}));

// ============================================
// RUTAS DE API
// ============================================

// Aplicar rate limiting específico para contacto
app.use('/api/contact', contactLimiter);

// Rutas principales
app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: require('./package.json').version
    });
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// Middleware para rutas no encontradas
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            error: 'Endpoint no encontrado',
            path: req.path,
            method: req.method
        });
    } else {
        // Para rutas no-API, servir index.html (SPA)
        res.sendFile(path.join(__dirname, 'index Neptune Landing page V1.1 OK.html'));
    }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // No revelar detalles del error en producción
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: isDev ? err.message : 'Error interno del servidor',
        ...(isDev && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================

async function startServer() {
    try {
        // Inicializar base de datos
        await initDatabase();
        console.log('✅ Base de datos inicializada');
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`
🌌 NEPTUNE LANDING PAGE - BACKEND INICIADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Servidor ejecutándose en: http://localhost:${PORT}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
📊 Analytics: ${process.env.ENABLE_ANALYTICS === 'true' ? 'Habilitado' : 'Deshabilitado'}
📧 Email: ${process.env.ENABLE_EMAIL === 'true' ? 'Habilitado' : 'Deshabilitado'}
🛡️  Rate Limiting: ${process.env.ENABLE_RATE_LIMITING === 'true' ? 'Habilitado' : 'Deshabilitado'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🔄 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 Cerrando servidor...');
    process.exit(0);
});

startServer();

module.exports = app;
