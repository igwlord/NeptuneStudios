# ⚡ DEPLOY RÁPIDO A NETLIFY

## 🚀 Pasos Rápidos (5-10 minutos)

### **1. Subir a GitHub (si no lo has hecho)**
```bash
git add .
git commit -m "feat: Neptune Landing Page ready for production"
git push origin main
```

### **2. Deploy en Netlify**
1. Ir a https://app.netlify.com
2. "Add new site" → "Import from Git"
3. Conectar GitHub → Seleccionar tu repositorio
4. **Deploy settings:**
   - Build command: `(dejar vacío)`
   - Publish directory: `./`
   - Functions directory: `netlify/functions`
5. Click "Deploy site"

### **3. Configurar Email (CRÍTICO)**
1. **Site Settings** → Environment Variables
2. **Add variable:**
   ```
   EMAIL_USER = tu-email@gmail.com
   EMAIL_PASSWORD = [tu-app-password-de-gmail]
   ```

### **4. Obtener Gmail App Password**
1. Google Account → Security → 2-Step Verification
2. App passwords → Generate
3. Select "Mail" → Copy el password de 16 caracteres
4. Usar como `EMAIL_PASSWORD`

### **5. Test Final**
1. Abrir tu site URL (ej: `https://amazing-site-123.netlify.app`)
2. Probar formulario con datos reales
3. Verificar que llega el email

---

## ✅ LISTO PARA PRODUCCIÓN

**Estado actual:** ✅ READY TO DEPLOY  
**Tiempo estimado:** 5-10 minutos  
**Resultado:** Site completamente funcional en Netlify

¡Go for it! 🚀
