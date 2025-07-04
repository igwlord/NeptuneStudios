# CONFIGURACIÓN DE EMAIL PARA NEPTUNE LANDING PAGE

## Pasos para configurar Gmail con nodemailer:

### 1. Activar Verificación en 2 pasos en tu cuenta de Gmail
- Ve a https://myaccount.google.com/security
- Activa "Verificación en 2 pasos"

### 2. Generar una contraseña de aplicación
- Ve a https://myaccount.google.com/apppasswords
- Selecciona "Correo" como aplicación
- Selecciona "Otro (nombre personalizado)" como dispositivo
- Escribe "Neptune Landing Page"
- Copia la contraseña de 16 caracteres que se genera

### 3. Actualizar el archivo .env
Edita el archivo `.env` y reemplaza:
```
EMAIL_PASS=tu-password-de-aplicacion-aqui
```

Por:
```
EMAIL_PASS=tu-password-de-16-caracteres-sin-espacios
```

### 4. Reiniciar el servidor
Después de actualizar el .env, reinicia el servidor con:
```
npm start
```

## Prueba de funcionamiento:
1. Abre http://localhost:3001 en tu navegador
2. Ve al formulario de contacto al final de la página
3. Llena el formulario con datos de prueba
4. Haz clic en "Enviar Mensaje"
5. Deberías ver el mensaje de éxito y recibir un email en neptnunestudios888@gmail.com

## Mensajes que verás:
- ✅ **Éxito**: "¡Mensaje enviado exitosamente! Nos pondremos en contacto a la brevedad"
- ❌ **Error**: Si no está configurado correctamente, verás un mensaje de error

## Nota importante:
La contraseña de aplicación es DIFERENTE a tu contraseña normal de Gmail. Debe ser la de 16 caracteres que genera Google específicamente para aplicaciones.
