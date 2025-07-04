# 🔄 SCRIPT DE RE-DEPLOY RÁPIDO

## Para Ejecutar en PowerShell:

```powershell
# Navegar al proyecto
cd "c:\Users\juego\OneDrive\Escritorio\Neptune Studios\Landing Page\VsCode Landing Page"

# Verificar archivos esenciales
Write-Host "Verificando archivos..." -ForegroundColor Yellow
$files = @("index.html", "styles.css", "script.js", "netlify.toml")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file - OK" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MISSING" -ForegroundColor Red
    }
}

# Verificar tamaño de index.html (debe ser > 10KB)
$indexSize = (Get-Item "index.html").Length
if ($indexSize -gt 10000) {
    Write-Host "✅ index.html size: $($indexSize) bytes - OK" -ForegroundColor Green
} else {
    Write-Host "⚠️ index.html size: $($indexSize) bytes - Might be too small" -ForegroundColor Yellow
}

# Subir cambios a Git
Write-Host "Subiendo cambios a Git..." -ForegroundColor Yellow
git add .
git commit -m "fix: actualizar configuración netlify y documentación 404"
git push origin main

Write-Host "✅ Deploy actualizado. Verifica en Netlify en 1-2 minutos." -ForegroundColor Green
```

## Acciones Manuales en Netlify:

1. **Ve a tu Dashboard de Netlify**
2. **Opción 1 - Trigger Deploy**:
   - Site settings > Build & deploy
   - "Trigger deploy" > "Deploy site"

3. **Opción 2 - Verificar Build Settings**:
   - Site settings > Build & deploy
   - Build command: `echo 'Building Neptune Landing Page...'`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`

4. **Opción 3 - Deploy Manual (Emergencia)**:
   - Crear ZIP con: index.html, styles.css, script.js, images/, netlify/
   - Arrastrar ZIP al panel de Netlify

## URLs para Testing Post-Deploy:

- **Sitio principal**: `https://[tu-sitio].netlify.app/`
- **Test de favicon**: `https://[tu-sitio].netlify.app/images/favicon.webp`
- **Test de función**: Llenar formulario de contacto

---
*Script rápido para resolver error 404 en Netlify*
