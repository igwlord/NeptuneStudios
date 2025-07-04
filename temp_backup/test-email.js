// ============================================
// SCRIPT DE PRUEBA PARA ENVÍO DE EMAILS
// Ejecutar con: node test-email.js
// ============================================

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailSending() {
    console.log('🧪 PRUEBA DE ENVÍO DE EMAIL - NEPTUNE LANDING PAGE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // Verificar configuración
        console.log('📧 Email configurado:', process.env.EMAIL_USER || 'NO CONFIGURADO');
        console.log('🔑 Password configurado:', process.env.EMAIL_PASS ? '****** (SÍ)' : 'NO CONFIGURADO');
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('❌ ERROR: Falta configuración de email en .env');
            console.log('');
            console.log('Por favor configura:');
            console.log('EMAIL_USER=neptnunestudios888@gmail.com');
            console.log('EMAIL_PASS=tu-password-de-aplicacion-de-16-caracteres');
            return;
        }

        // Crear transporter
        console.log('🔄 Creando transporter...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verificar conexión
        console.log('🔄 Verificando conexión con Gmail...');
        await transporter.verify();
        console.log('✅ Conexión exitosa con Gmail');

        // Enviar email de prueba
        console.log('🔄 Enviando email de prueba...');
        const mailOptions = {
            from: `"Prueba Neptune" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: '🧪 Prueba de Envío - Neptune Landing Page',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0a0a2e 0%, #2d1b69 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">🌌 NEPTUNE STUDIOS</h1>
                        <p style="color: #a855f7; margin: 5px 0;">Prueba de Configuración Exitosa</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2d1b69;">✅ ¡Felicidades!</h2>
                        <p>El sistema de envío de emails está funcionando correctamente.</p>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
                            <strong>✅ Configuración verificada:</strong>
                            <ul>
                                <li>Conexión con Gmail: OK</li>
                                <li>Autenticación: OK</li>
                                <li>Envío de emails: OK</li>
                            </ul>
                        </div>
                        
                        <p><strong>Fecha de prueba:</strong> ${new Date().toLocaleString('es-ES')}</p>
                        <p><strong>Origen:</strong> Neptune Landing Page Backend</p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado exitosamente!');
        console.log('📨 Message ID:', result.messageId);
        console.log('');
        console.log('🎉 ¡CONFIGURACIÓN COMPLETA Y FUNCIONAL!');
        console.log('📝 Ahora puedes probar el formulario en: http://localhost:3001');

    } catch (error) {
        console.log('❌ ERROR durante la prueba:', error.message);
        
        if (error.code === 'EAUTH') {
            console.log('');
            console.log('💡 SOLUCIÓN PARA ERROR DE AUTENTICACIÓN:');
            console.log('1. Verifica que tengas activada la verificación en 2 pasos en Gmail');
            console.log('2. Genera una nueva contraseña de aplicación específica para esta app');
            console.log('3. Usa esa contraseña de 16 caracteres en EMAIL_PASS (sin espacios)');
        }
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.log('');
            console.log('💡 SOLUCIÓN PARA ERROR DE CONEXIÓN:');
            console.log('1. Verifica tu conexión a internet');
            console.log('2. Asegúrate de que no haya firewalls bloqueando el puerto 587');
        }
    }
}

// Ejecutar la prueba
testEmailSending();
