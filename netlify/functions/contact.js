const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Método no permitido' 
      })
    };
  }

  try {
    // Parsear el body
    console.log('Body recibido:', event.body);
    const { nombre, email, mensaje } = JSON.parse(event.body);
    console.log('Datos parseados:', { nombre, email, mensaje });
    
    // Limpiar datos (trim)
    const nombreClean = nombre ? nombre.trim() : '';
    const emailClean = email ? email.trim() : '';
    const mensajeClean = mensaje ? mensaje.trim() : '';
    
    console.log('Datos limpiados:', { nombreClean, emailClean, mensajeClean });

    // Validación básica mejorada
    if (!nombreClean || !emailClean || !mensajeClean) {
      console.log('Validación fallida:', { 
        nombre: !!nombreClean, 
        email: !!emailClean, 
        mensaje: !!mensajeClean,
        nombreLength: nombreClean.length,
        emailLength: emailClean.length,
        mensajeLength: mensajeClean.length
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Todos los campos son obligatorios',
          message: 'Todos los campos son obligatorios' 
        })
      };
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      console.log('Email inválido:', emailClean);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Formato de email inválido',
          message: 'Formato de email inválido' 
        })
      };
    }

    // Configurar el transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Configurar el email
    const mailOptions = {
      from: `"${nombreClean}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `💼 Nueva consulta desde Neptune Landing - ${nombreClean}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌌 NEPTUNE STUDIOS</h1>
              <p>Nueva Consulta Recibida</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Nombre Completo:</div>
                <div>${nombreClean}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email de Contacto:</div>
                <div>${emailClean}</div>
              </div>
              <div class="field">
                <div class="label">💬 Mensaje:</div>
                <div>${mensajeClean}</div>
              </div>
              <div class="footer">
                <p>📅 <strong>Fecha:</strong> ${new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires' })}</p>
                <p>🚀 Enviado desde Neptune Landing Page</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Enviar el email
    console.log('Intentando enviar email...');
    console.log('Variables de entorno:', {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD
    });
    
    await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente');

    // Respuesta exitosa
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: '¡Mensaje enviado exitosamente! Nos pondremos en contacto a la brevedad.' 
      })
    };

  } catch (error) {
    console.error('Error completo:', error);
    console.error('Error al enviar email:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor. Por favor, intenta más tarde.',
        message: 'Error interno del servidor. Por favor, intenta más tarde.' 
      })
    };
  }
};
