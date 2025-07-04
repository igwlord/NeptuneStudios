#!/usr/bin/env node

// ============================================
// NEPTUNE LANDING PAGE - SCRIPT DE INICIALIZACIÓN
// ============================================

const { initDatabase } = require('./database/simple-init');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdminUser() {
  console.log('\n🔐 Configuración del Usuario Administrador\n');
  
  const name = await ask('Nombre del administrador: ');
  const email = await ask('Email del administrador: ');
  let password = await ask('Contraseña (mínimo 8 caracteres): ');
  
  // Validar contraseña
  while (password.length < 8) {
    console.log('❌ La contraseña debe tener al menos 8 caracteres');
    password = await ask('Contraseña (mínimo 8 caracteres): ');
  }
  
  try {
    const db = new sqlite3.Database(path.join(__dirname, 'database/database.sqlite'));
    
    // Verificar si ya existe un admin
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM admin_users WHERE role = "admin"',
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });

    if (existingAdmin > 0) {
      console.log('⚠️  Ya existe un usuario administrador. Omitiendo creación...');
      db.close();
      return;
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario admin
    const result = await new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO admin_users (email, password_hash, name, role, is_active, created_at)
        VALUES (?, ?, ?, 'admin', 1, ?)
      `);

      stmt.run([
        email.toLowerCase().trim(),
        passwordHash,
        name.trim(),
        new Date().toISOString()
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });

      stmt.finalize();
    });

    db.close();

    console.log(`✅ Usuario administrador creado correctamente (ID: ${result.id})`);
    console.log(`📧 Email: ${email}`);
    
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
  }
}

async function insertDefaultSettings() {
  try {
    const db = new sqlite3.Database(path.join(__dirname, 'database/database.sqlite'));
    
    const defaultSettings = [
      { key: 'site_title', value: 'Neptune Studios', description: 'Título del sitio web' },
      { key: 'site_description', value: 'Consultoría en IA y Automatización de Procesos', description: 'Descripción del sitio' },
      { key: 'contact_email', value: 'contacto@neptunestudios.com', description: 'Email de contacto principal' },
      { key: 'analytics_enabled', value: 'true', description: 'Habilitar analytics' },
      { key: 'maintenance_mode', value: 'false', description: 'Modo de mantenimiento' },
      { key: 'max_testimonials_home', value: '6', description: 'Máximo de testimonios en página principal' }
    ];

    for (const setting of defaultSettings) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)',
          [setting.key, setting.value, setting.description],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    db.close();
    console.log('✅ Configuraciones por defecto insertadas');
    
  } catch (error) {
    console.error('❌ Error al insertar configuraciones:', error);
  }
}

async function main() {
  console.log(`
🚀 NEPTUNE LANDING PAGE - INICIALIZACIÓN
=========================================
  `);

  try {
    // 1. Inicializar base de datos
    console.log('📦 Inicializando base de datos...');
    await initDatabase();
    
    // 2. Insertar configuraciones por defecto
    console.log('⚙️  Insertando configuraciones por defecto...');
    await insertDefaultSettings();
    
    // 3. Crear usuario administrador
    await createAdminUser();
    
    console.log(`
✅ ¡Inicialización completada!

📝 Próximos pasos:
   1. Instalar dependencias: npm install
   2. Configurar variables de entorno en .env
   3. Iniciar servidor: npm start
   4. Acceder a la aplicación: http://localhost:3000

🔧 Para administración:
   - Crear admin: POST /api/auth/create-admin
   - Login: POST /api/auth/login
   - Dashboard: /admin (proximamente)

💡 Documentación completa en README.md
    `);
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createAdminUser, insertDefaultSettings };
