# 🌌 Neptune Studios - Landing Page

**Consultoría Estratégica con Inteligencia Artificial**

Una landing page moderna y profesional construida con tecnologías web de vanguardia, diseñada para convertir visitantes en clientes potenciales.

![Neptune Studios](https://img.shields.io/badge/Neptune-Studios-8B5CF6?style=for-the-badge&logo=star&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-00D4AA?style=for-the-badge)
![Responsive](https://img.shields.io/badge/Design-Responsive-FF6B6B?style=for-the-badge)

## ✨ Características Principales

### 🎨 **Diseño Visual**
- **Fondo espacial animado** con estrellas en movimiento usando Three.js
- **Glassmorphism moderno** con efectos de transparencia y blur
- **Animaciones fluidas** y micro-interacciones
- **Responsive design** optimizado para todos los dispositivos
- **Tipografía futurista** con Orbitron y Inter

### 🚀 **Funcionalidades**
- **Hero animado** con efecto máquina de escribir
- **Quiz interactivo** para calificación de leads
- **Formulario de contacto funcional** con envío real de emails
- **Sistema de notificaciones** visuales en tiempo real
- **Carrusel de testimonios** con efectos hover
- **Contador de caracteres** dinámico en textarea

### 📧 **Sistema de Contacto**
- **Envío real de emails** usando Nodemailer
- **Validación robusta** del frontend y backend
- **Templates HTML** profesionales para emails
- **Feedback visual** inmediato al usuario
- **Compatible con Netlify Functions** para despliegue serverless

### ⚡ **Rendimiento**
- **Código optimizado** y minificado
- **Carga rápida** con técnicas de optimización
- **SEO optimizado** con meta tags apropiados
- **Accesibilidad mejorada** con ARIA labels
- **Compatibilidad cross-browser**

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** semántico y accesible
- **CSS3** moderno con Flexbox y Grid
- **JavaScript ES6+** vanilla
- **Tailwind CSS** para styling utilitario
- **Three.js** para efectos 3D y animaciones
- **Google Fonts** (Orbitron, Inter)

### Backend
- **Node.js** con Express.js
- **Nodemailer** para envío de emails
- **CORS** y **Helmet** para seguridad
- **Validación de datos** robusta
- **Variables de entorno** para configuración

### Despliegue
- **Netlify** con Functions serverless
- **Git** para control de versiones
- **Environment variables** para configuración segura

## 🚀 Despliegue en Producción

### Opción 1: Netlify (Recomendada)
El proyecto está completamente configurado para Netlify:

1. **Sube a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "🌌 Initial commit"
   git remote add origin https://github.com/TU_USUARIO/neptune-landing.git
   git push -u origin main
   ```

2. **Conecta con Netlify**:
   - Ve a [netlify.com](https://netlify.com)
   - "New site from Git" → Selecciona tu repositorio
   - Deploy automático configurado

3. **Configura variables de entorno**:
   ```
   EMAIL_USER = neptnunestudios888@gmail.com
   EMAIL_PASSWORD = tu_password_de_aplicacion_gmail
   ```

**📋 Ver guía completa**: `DESPLIEGUE_NETLIFY.md`

### Opción 2: Desarrollo Local
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor de desarrollo
npm start
```

## 📁 Estructura del Proyecto

```
neptune-landing/
├── 📄 index Neptune Landing page V1.1 OK.html  # Página principal
├── 🎨 styles.css                               # Estilos CSS
├── ⚡ script.js                                # JavaScript principal
├── 🖼️ images/                                  # Imágenes y assets
├── 🌐 netlify/
│   └── functions/
│       ├── 📧 contact.js                       # Función serverless
│       └── 📦 package.json                     # Dependencias functions
├── 🔧 netlify.toml                             # Configuración Netlify
├── 🚫 .gitignore                               # Archivos ignorados
├── 📝 DESPLIEGUE_NETLIFY.md                    # Guía de despliegue
└── 📖 README.md                                # Este archivo
```

## 🎯 Secciones de la Landing Page

1. **🏠 Hero Section**: Animación NEPTUNE + efecto máquina de escribir
2. **👥 Quiénes Somos**: Presentación con glassmorphism
3. **❓ Quiz Diagnóstico**: Interactivo para calificación de leads
4. **⚙️ Nuestros Servicios**: 3 servicios con iconos animados
5. **📋 Nuestro Proceso**: Acordeón con metodología
6. **💬 Testimonios**: Carrusel con efectos hover
7. **📧 Contacto**: Formulario funcional con validación

## 📧 Configuración del Email

### Gmail (Recomendado)
1. Activa **verificación en 2 pasos**
2. Genera **password de aplicación**:
   - Google Account → Seguridad → Contraseñas de aplicaciones
   - Selecciona "Correo" → Genera
   - Usa el password de 16 caracteres (sin espacios)

### Variables de Entorno
```env
EMAIL_USER=neptnunestudios888@gmail.com
EMAIL_PASSWORD=abcd1234efgh5678  # Password de aplicación
```

## 🎨 Personalización

### Colores (CSS Custom Properties)
```css
:root {
  --brand-purple: #8B5CF6;
  --brand-blue: #3B82F6;
  --brand-green: #10B981;
  --brand-glow: #A855F7;
}
```

### Contenido
- **Textos**: Editar directamente en el HTML
- **Servicios**: Modificar iconos y descripciones
- **Testimonios**: Actualizar en `script.js`
- **Quiz**: Personalizar preguntas y resultados

## 🔧 Funcionalidades del Sistema de Contacto

- ✅ **Validación en tiempo real** de campos
- ✅ **Envío asíncrono** sin recargar página
- ✅ **Notificaciones visuales** de estado
- ✅ **Template HTML** profesional para emails
- ✅ **Contador de caracteres** en textarea
- ✅ **Prevención de spam** con rate limiting
- ✅ **Feedback inmediato** al usuario
- ✅ **Compatible con móviles**

## 📊 Métricas y Analytics

### Preparado para:
- **Google Analytics** 4
- **Facebook Pixel**
- **Hotjar** para heatmaps
- **Netlify Analytics** (nativo)

### Conversiones Rastreables:
- Envío de formulario de contacto
- Completado de quiz
- Clicks en CTAs principales
- Tiempo en página por sección

## 🔒 Seguridad

- **CSP (Content Security Policy)** configurado
- **CORS** apropiado para APIs
- **Sanitización** de inputs
- **Rate limiting** en formularios
- **Variables de entorno** para credenciales
- **Headers de seguridad** en Netlify

## 🐛 Solución de Problemas

### Formulario no envía emails
1. Verifica variables de entorno
2. Confirma password de aplicación Gmail
3. Revisa logs de Netlify Functions
4. Verifica que 2FA esté activo en Gmail

### Animaciones no cargan
1. Verifica conexión a CDNs
2. Confirma compatibilidad del navegador
3. Revisa errores en consola

### Estilos rotos
1. Verifica carga de Tailwind CSS
2. Confirma rutas de archivos CSS
3. Revisa conflictos de estilos

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: neptnunestudios888@gmail.com
- **Documentación**: Ver archivos `.md` en el proyecto

## 📜 Licencia

Proyecto privado para Neptune Studios. Todos los derechos reservados.

---

**🚀 ¡Tu landing page está lista para conquistar el espacio digital!** 🌌
