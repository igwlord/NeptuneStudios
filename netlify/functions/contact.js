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
    const { nombre, email, mensaje } = JSON.parse(event.body);

    // Validación básica
    if (!nombre || !email || !mensaje) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Todos los campos son obligatorios' 
        })
      };
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Formato de email inválido' 
        })
      };
    }

    // Configurar el transporter de nodemailer
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Configurar el email
    const mailOptions = {
      from: `"${nombre}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `💼 Nueva consulta desde Neptune Landing - ${nombre}`,
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
                <div>${nombre}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email de Contacto:</div>
                <div>${email}</div>
              </div>
              <div class="field">
                <div class="label">💬 Mensaje:</div>
                <div>${mensaje}</div>
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
    await transporter.sendMail(mailOptions);

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
    console.error('Error al enviar email:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Error interno del servidor. Por favor, intenta más tarde.' 
      })
    };
  }
};
