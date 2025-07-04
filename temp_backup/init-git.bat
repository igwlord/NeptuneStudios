@echo off
REM 🚀 Script de Inicialización para Git y Netlify
REM Neptune Studios Landing Page

echo 🌌 Inicializando repositorio Git para Neptune Studios...

REM Verificar si Git está instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git no está instalado. Por favor instala Git primero.
    pause
    exit /b 1
)

REM Inicializar Git si no existe
if not exist ".git" (
    echo 📦 Inicializando repositorio Git...
    git init
    echo ✅ Repositorio Git inicializado
) else (
    echo ✅ Repositorio Git ya existe
)

REM Agregar todos los archivos
echo 📁 Agregando archivos al repositorio...
git add .

REM Hacer el primer commit
echo 💾 Haciendo commit inicial...
git commit -m "🌌 Initial commit: Neptune Studios Landing Page - Landing page moderna con Three.js - Sistema de contacto funcional - Quiz interactivo - Diseño glassmorphism - Totalmente responsive - Preparado para Netlify"

if %errorlevel% equ 0 (
    echo ✅ Commit inicial realizado
) else (
    echo ℹ️  No hay cambios para commitear o commit ya realizado
)

REM Mostrar status
echo.
echo 📊 Estado del repositorio:
git status --short

echo.
echo 🎯 Próximos pasos:
echo 1. Crear repositorio en GitHub: https://github.com/new
echo 2. Agregar remote: git remote add origin https://github.com/TU_USUARIO/neptune-landing.git
echo 3. Push inicial: git push -u origin main
echo 4. Configurar en Netlify: https://netlify.com
echo.
echo 📖 Ver guía completa en: DESPLIEGUE_NETLIFY.md
echo.
echo 🚀 ¡Listo para conquistar el espacio digital!
echo.
pause
