#!/bin/bash

# 🚀 Script de Inicialización para Git y Netlify
# Neptune Studios Landing Page

echo "🌌 Inicializando repositorio Git para Neptune Studios..."

# Verificar si Git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado. Por favor instala Git primero."
    exit 1
fi

# Inicializar Git si no existe
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositorio Git..."
    git init
    echo "✅ Repositorio Git inicializado"
else
    echo "✅ Repositorio Git ya existe"
fi

# Agregar .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    echo "🚫 Creando .gitignore..."
    cat > .gitignore << EOL
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production.local

# Logs
logs
*.log

# OS generated files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Netlify
.netlify/
EOL
    echo "✅ .gitignore creado"
fi

# Agregar todos los archivos
echo "📁 Agregando archivos al repositorio..."
git add .

# Verificar si hay cambios para commit
if git diff --staged --quiet; then
    echo "ℹ️  No hay cambios para commitear"
else
    # Hacer el primer commit
    echo "💾 Haciendo commit inicial..."
    git commit -m "🌌 Initial commit: Neptune Studios Landing Page

    ✨ Características:
    - Landing page moderna con Three.js
    - Sistema de contacto funcional
    - Quiz interactivo
    - Diseño glassmorphism
    - Totalmente responsive
    - Preparado para Netlify"
    
    echo "✅ Commit inicial realizado"
fi

# Mostrar status
echo ""
echo "📊 Estado del repositorio:"
git status --short

echo ""
echo "🎯 Próximos pasos:"
echo "1. Crear repositorio en GitHub: https://github.com/new"
echo "2. Agregar remote: git remote add origin https://github.com/TU_USUARIO/neptune-landing.git"
echo "3. Push inicial: git push -u origin main"
echo "4. Configurar en Netlify: https://netlify.com"
echo ""
echo "📖 Ver guía completa en: DESPLIEGUE_NETLIFY.md"
echo ""
echo "🚀 ¡Listo para conquistar el espacio digital!"
