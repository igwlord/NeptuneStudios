const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateToken, authLimiter } = require('../middleware/auth');
const { sanitizeInput } = require('../utils/security');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Validaciones para login
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
];

// POST /api/auth/login - Iniciar sesión
router.post('/login', authLimiter, loginValidation, async (req, res) => {
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

    const { email, password } = req.body;

    // Sanitizar datos
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Buscar usuario en base de datos
    const db = new sqlite3.Database(path.join(__dirname, '../database/database.sqlite'));
    
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM admin_users WHERE email = ? AND is_active = 1',
        [sanitizedEmail],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    db.close();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Actualizar último login
    const dbUpdate = new sqlite3.Database(path.join(__dirname, '../database/database.sqlite'));
    dbUpdate.run(
      'UPDATE admin_users SET last_login = ?, login_count = login_count + 1 WHERE id = ?',
      [new Date().toISOString(), user.id]
    );
    dbUpdate.close();

    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/create-admin - Crear primer usuario admin (solo si no existe ninguno)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, contraseña y nombre son requeridos'
      });
    }

    const db = new sqlite3.Database(path.join(__dirname, '../database/database.sqlite'));

    // Verificar si ya existe un admin
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM admin_users WHERE role = "admin"',
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });

    if (existingAdmin > 0) {
      db.close();
      return res.status(403).json({
        success: false,
        error: 'Ya existe un usuario administrador'
      });
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario admin
    const result = await new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO admin_users (email, password_hash, name, role, is_active, created_at)
        VALUES (?, ?, ?, 'admin', 1, ?)
      `);

      stmt.run([
        sanitizeInput(email.toLowerCase()),
        passwordHash,
        sanitizeInput(name),
        new Date().toISOString()
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });

      stmt.finalize();
    });

    db.close();

    res.json({
      success: true,
      message: 'Usuario administrador creado correctamente',
      userId: result.id
    });

  } catch (error) {
    console.error('Error al crear admin:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/verify - Verificar token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requerido'
      });
    }

    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'neptune-secret-key');
      
      res.json({
        success: true,
        valid: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (err) {
      res.json({
        success: true,
        valid: false,
        error: 'Token inválido o expirado'
      });
    }

  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
