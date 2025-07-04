# 🚀 Guía de Despliegue: Neptune Studios Landing Page

## 📋 Requisitos Previos

1. **Cuenta de GitHub** (gratuita)
2. **Cuenta de Netlify** (gratuita)
3. **Password de aplicación de Gmail** configurado

## 🛠️ Pasos para el Despliegue

### 1. Preparar el Repositorio Git

```bash
# Navegar al directorio del proyecto
cd "c:\Users\juego\OneDrive\Escritorio\Neptune Studios\Landing Page\VsCode Landing Page"

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "🌌 Initial commit: Neptune Studios Landing Page"

# Agregar repositorio remoto (crear primero en GitHub)
git remote add origin https://github.com/TU_USUARIO/neptune-landing-page.git

# Subir a GitHub
git push -u origin main
```

### 2. Desplegar en Netlify

#### Opción A: Desde GitHub (Recomendada)
1. Ve a [netlify.com](https://netlify.com) y haz login
2. Click en "New site from Git"
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio "neptune-landing-page"
5. Configuración de build:
   - **Build command**: (dejar vacío)
   - **Publish directory**: `.` (punto)
   - **Functions directory**: `netlify/functions`

#### Opción B: Deploy Manual
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra toda la carpeta del proyecto al área de deploy

### 3. Configurar Variables de Entorno en Netlify

1. En tu sitio de Netlify, ve a **Site settings**
2. Click en **Environment variables**
3. Agrega estas variables:

```
EMAIL_USER = neptnunestudios888@gmail.com
EMAIL_PASSWORD = tu_password_de_aplicacion_de_16_caracteres
```

**⚠️ IMPORTANTE**: 
- El EMAIL_PASSWORD debe ser el password de aplicación de Gmail
- NO uses espacios en el password
- Debe tener exactamente 16 caracteres

### 4. Configurar el Password de Aplicación de Gmail

1. Ve a tu cuenta de Google (myaccount.google.com)
2. Seguridad > Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Generar nueva contraseña para "Correo"
5. Copia el password de 16 caracteres (sin espacios)
6. Úsalo como EMAIL_PASSWORD en Netlify

## ✅ Verificación del Funcionamiento

### Formulario de Contacto
- **URL local**: `http://localhost:3000` (desarrollo)
- **URL Netlify**: `https://tu-sitio.netlify.app` (producción)

El sistema detecta automáticamente el entorno:
- **Local**: Usa `/api/contact/send` (tu servidor Express)
- **Netlify**: Usa `/.netlify/functions/contact` (función serverless)

### Pruebas
1. Completa el formulario de contacto
2. Verifica que llegue el email a neptnunestudios888@gmail.com
3. Revisa que la notificación de éxito aparezca en pantalla

## 🔧 Solución de Problemas

### Error 500 en el formulario
- Verifica las variables de entorno en Netlify
- Confirma que el password de aplicación es correcto
- Revisa los logs en Netlify Functions

### Email no llega
- Verifica que la autenticación de 2 factores esté activa
- Confirma que el password de aplicación sea de 16 caracteres
- Revisa la bandeja de spam

### Error de CORS
- Ya está configurado en `netlify.toml`
- Si persiste, verifica que el dominio esté correcto

## 📊 Monitoreo

En Netlify puedes ver:
- **Functions**: Logs de ejecución del formulario
- **Analytics**: Estadísticas de visitas
- **Forms**: Si decides usar Netlify Forms en el futuro

## 🔄 Actualizaciones

Para actualizar el sitio:

```bash
# Hacer cambios en el código
git add .
git commit -m "✨ Descripción de los cambios"
git push origin main
```

Netlify se actualizará automáticamente.

## 🎯 URLs Importantes

- **Sitio en vivo**: `https://tu-sitio.netlify.app`
- **Panel de Netlify**: `https://app.netlify.com`
- **Repositorio GitHub**: `https://github.com/TU_USUARIO/neptune-landing-page`

## 📧 Soporte

Si tienes problemas:
1. Revisa los logs de Netlify Functions
2. Verifica las variables de entorno
3. Confirma la configuración de Gmail

¡Tu landing page estará lista para recibir clientes reales! 🚀
