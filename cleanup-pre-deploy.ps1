# Script de Limpieza Pre-Deploy
# Elimina archivos no necesarios para producción en Netlify

Write-Host "🧹 LIMPIEZA PRE-DEPLOY - NEPTUNE STUDIOS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Función para eliminar archivos/carpetas de forma segura
function Remove-SafelyIfExists {
    param($Path)
    if (Test-Path $Path) {
        try {
            Remove-Item $Path -Recurse -Force
            Write-Host "✅ Eliminado: $Path" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error eliminando: $Path - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  No encontrado: $Path" -ForegroundColor Yellow
    }
}

Write-Host "`n📁 Eliminando archivos de servidor local..." -ForegroundColor Yellow

# Eliminar archivos de servidor local (no necesarios en Netlify)
Remove-SafelyIfExists "server.js"
Remove-SafelyIfExists "setup.js"
Remove-SafelyIfExists "configurar-email.js"

Write-Host "`n📁 Eliminando carpetas de backend..." -ForegroundColor Yellow

# Eliminar carpetas de backend
Remove-SafelyIfExists "routes"
Remove-SafelyIfExists "middleware"
Remove-SafelyIfExists "utils"
Remove-SafelyIfExists "database"

Write-Host "`n📁 Eliminando archivos de prueba..." -ForegroundColor Yellow

# Eliminar archivos de prueba
Remove-SafelyIfExists "test-email.js"
Remove-SafelyIfExists "test-form.js"
Remove-SafelyIfExists "demo-notifications.js"

Write-Host "`n📁 Eliminando archivos de inicialización..." -ForegroundColor Yellow

# Eliminar scripts de inicialización
Remove-SafelyIfExists "init-git.bat"
Remove-SafelyIfExists "init-git.sh"

Write-Host "`n📁 Limpiando documentación redundante..." -ForegroundColor Yellow

# Mantener solo README principal y archivos clave
Remove-SafelyIfExists "README.md" # Mantener README_NUEVO.md como principal

Write-Host "`n📊 Verificando archivos restantes..." -ForegroundColor Cyan

# Mostrar archivos que quedan (solo los necesarios)
$remainingFiles = Get-ChildItem -File | Where-Object { 
    $_.Name -notlike ".*" -and 
    $_.Name -ne "package-lock.json" -and
    $_.Name -ne "node_modules"
}

Write-Host "`n✅ Archivos listos para deploy:" -ForegroundColor Green
foreach ($file in $remainingFiles) {
    Write-Host "   📄 $($file.Name)" -ForegroundColor White
}

# Mostrar carpetas importantes
$importantDirs = @("netlify", "images", ".git")
Write-Host "`n📁 Carpetas importantes mantenidas:" -ForegroundColor Green
foreach ($dir in $importantDirs) {
    if (Test-Path $dir) {
        Write-Host "   📁 $dir" -ForegroundColor White
    }
}

Write-Host "`n🎯 RESUMEN DE LIMPIEZA:" -ForegroundColor Cyan
Write-Host "✅ Archivos de servidor local eliminados" -ForegroundColor Green
Write-Host "✅ Carpetas de backend eliminadas" -ForegroundColor Green
Write-Host "✅ Archivos de prueba eliminados" -ForegroundColor Green
Write-Host "✅ Documentación consolidada" -ForegroundColor Green

Write-Host "`n🚀 El proyecto está listo para deploy en Netlify!" -ForegroundColor Green
Write-Host "   Archivos esenciales mantenidos:" -ForegroundColor White
Write-Host "   - index Neptune Landing page V1.1 OK.html" -ForegroundColor White
Write-Host "   - styles.css" -ForegroundColor White
Write-Host "   - script.js" -ForegroundColor White
Write-Host "   - netlify/" -ForegroundColor White
Write-Host "   - netlify.toml" -ForegroundColor White
Write-Host "   - package.json (functions)" -ForegroundColor White
Write-Host "   - .env files" -ForegroundColor White

Write-Host "`n💡 Siguiente paso: git add . && git commit && git push" -ForegroundColor Cyan
