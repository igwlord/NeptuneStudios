const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { sanitizeInput } = require('../utils/security');
const { recordEvent, getQuizStats } = require('../utils/analytics');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Rate limiting para quiz
const quizLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 intentos por IP cada 15 minutos
  message: {
    success: false,
    error: 'Demasiados intentos. Por favor, espera 15 minutos antes de intentar de nuevo.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validaciones para el quiz
const quizValidation = [
  body('answers').isArray({ min: 1, max: 10 }).withMessage('Las respuestas deben ser un array válido'),
  body('answers.*').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Cada respuesta debe ser válida'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Nombre inválido'),
  body('csrf_token').notEmpty().withMessage('Token CSRF requerido')
];

// GET /api/quiz/questions - Obtener preguntas del quiz
router.get('/questions', async (req, res) => {
  try {
    // Registrar evento de analytics
    await recordEvent('quiz_questions_requested', req.ip, {
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    const questions = [
      {
        id: 1,
        question: "¿Cuál es el principal desafío de tu negocio actualmente?",
        type: "multiple",
        options: [
          "Generar más leads y ventas",
          "Mejorar la presencia online",
          "Optimizar procesos internos",
          "Expandir a nuevos mercados",
          "Reducir costos operativos"
        ]
      },
      {
        id: 2,
        question: "¿Qué tamaño tiene tu empresa?",
        type: "multiple",
        options: [
          "1-10 empleados",
          "11-50 empleados",
          "51-200 empleados",
          "200+ empleados"
        ]
      },
      {
        id: 3,
        question: "¿Cuál es tu presupuesto mensual para consultoría?",
        type: "multiple",
        options: [
          "Menos de $1,000",
          "$1,000 - $5,000",
          "$5,000 - $15,000",
          "$15,000 - $50,000",
          "Más de $50,000"
        ]
      },
      {
        id: 4,
        question: "¿En qué industria opera tu empresa?",
        type: "multiple",
        options: [
          "Tecnología",
          "Salud",
          "Finanzas",
          "Retail/E-commerce",
          "Manufactura",
          "Servicios",
          "Otra"
        ]
      },
      {
        id: 5,
        question: "¿Qué servicios te interesan más?",
        type: "multiple",
        options: [
          "Estrategia de crecimiento",
          "Marketing digital",
          "Optimización de procesos",
          "Transformación digital",
          "Análisis de datos",
          "Desarrollo de producto"
        ]
      }
    ];

    res.json({
      success: true,
      questions: questions
    });

  } catch (error) {
    console.error('Error al obtener preguntas del quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/quiz/submit - Enviar respuestas del quiz
router.post('/submit', quizLimiter, quizValidation, async (req, res) => {
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

    const { answers, email, name } = req.body;

    // Sanitizar datos
    const sanitizedData = {
      answers: answers.map(answer => sanitizeInput(answer)),
      email: email ? sanitizeInput(email) : null,
      name: name ? sanitizeInput(name) : null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // Calcular puntuación y recomendación
    const result = calculateQuizResult(sanitizedData.answers);

    // Guardar en base de datos
    const db = new sqlite3.Database(path.join(__dirname, '../database/database.sqlite'));
    
    const insertResult = await new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO quiz_results (
          answers, email, name, score, recommendation, 
          user_ip, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        JSON.stringify(sanitizedData.answers),
        sanitizedData.email,
        sanitizedData.name,
        result.score,
        result.recommendation,
        sanitizedData.ip,
        sanitizedData.userAgent,
        sanitizedData.timestamp
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });

      stmt.finalize();
    });

    db.close();

    // Registrar evento de analytics
    await recordEvent('quiz_completed', req.ip, {
      score: result.score,
      recommendation: result.recommendation,
      hasContact: !!(sanitizedData.email || sanitizedData.name),
      userAgent: sanitizedData.userAgent,
      timestamp: sanitizedData.timestamp
    });

    res.json({
      success: true,
      result: {
        id: insertResult.id,
        score: result.score,
        recommendation: result.recommendation,
        services: result.services,
        nextSteps: result.nextSteps
      }
    });

  } catch (error) {
    console.error('Error al procesar quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/quiz/stats - Obtener estadísticas del quiz (requiere autenticación)
router.get('/stats', async (req, res) => {
  try {
    const stats = await getQuizStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Función para calcular resultado del quiz
function calculateQuizResult(answers) {
  let score = 0;
  const services = [];
  
  // Lógica de puntuación basada en respuestas
  answers.forEach((answer, index) => {
    switch(index) {
      case 0: // Principal desafío
        if (answer.includes('leads') || answer.includes('ventas')) {
          score += 30;
          services.push('Marketing Digital', 'Estrategia de Crecimiento');
        } else if (answer.includes('presencia')) {
          score += 25;
          services.push('Marketing Digital', 'Transformación Digital');
        } else if (answer.includes('procesos')) {
          score += 35;
          services.push('Optimización de Procesos', 'Análisis de Datos');
        }
        break;
      case 1: // Tamaño empresa
        if (answer.includes('1-10')) score += 10;
        else if (answer.includes('11-50')) score += 20;
        else if (answer.includes('51-200')) score += 30;
        else score += 40;
        break;
      case 2: // Presupuesto
        if (answer.includes('1,000')) score += 10;
        else if (answer.includes('5,000')) score += 20;
        else if (answer.includes('15,000')) score += 30;
        else score += 40;
        break;
    }
  });

  // Determinar recomendación
  let recommendation = '';
  let nextSteps = [];

  if (score >= 80) {
    recommendation = 'Tu empresa está lista para una transformación completa. Recomendamos nuestro paquete Enterprise con consultoría estratégica integral.';
    nextSteps = [
      'Agendar una consulta estratégica gratuita',
      'Análisis completo de tu negocio',
      'Propuesta personalizada de transformación'
    ];
  } else if (score >= 60) {
    recommendation = 'Tu empresa tiene un buen potencial de crecimiento. Nuestro paquete Professional te ayudará a optimizar áreas clave.';
    nextSteps = [
      'Consulta inicial para identificar prioridades',
      'Implementación por fases',
      'Seguimiento y optimización continua'
    ];
  } else if (score >= 40) {
    recommendation = 'Es un buen momento para comenzar a optimizar tu negocio. Nuestro paquete Starter es perfecto para ti.';
    nextSteps = [
      'Evaluación gratuita de 30 minutos',
      'Plan de acción inicial',
      'Implementación de mejoras básicas'
    ];
  } else {
    recommendation = 'Recomendamos comenzar con nuestros recursos gratuitos y una consulta inicial para evaluar tus necesidades.';
    nextSteps = [
      'Descarga nuestro kit de herramientas gratuito',
      'Consulta inicial sin costo',
      'Plan de crecimiento personalizado'
    ];
  }

  return {
    score,
    recommendation,
    services: [...new Set(services)], // Eliminar duplicados
    nextSteps
  };
}

module.exports = router;
