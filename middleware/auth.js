const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP cada 15 minutos
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación. Por favor, espera 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'neptune-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    req.user = user;
    next();
  });
};

// Middleware para verificar roles específicos
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
    }
    next();
  };
};

// Middleware para verificar si es administrador
const requireAdmin = requireRole('admin');

// Generar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'neptune-secret-key',
    { expiresIn: '24h' }
  );
};

// Middleware de logging para rutas administrativas
const adminLogger = (req, res, next) => {
  console.log(`[ADMIN] ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip} - User: ${req.user?.email || 'Anonymous'}`);
  next();
};

module.exports = {
  authLimiter,
  authenticateToken,
  requireRole,
  requireAdmin,
  generateToken,
  adminLogger
};
