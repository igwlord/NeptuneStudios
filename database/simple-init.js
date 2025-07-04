// ============================================
// NEPTUNE LANDING PAGE - INICIALIZACIÓN SIMPLE DE BASE DE DATOS
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database.sqlite');

// Asegurar que el directorio existe
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error conectando a la base de datos:', err);
                reject(err);
                return;
            }
            console.log('✅ Conectado a la base de datos SQLite');
        });

        db.serialize(() => {
            // 1. TABLA DE CONTACTOS
            db.run(`
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    company TEXT,
                    message TEXT NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    is_processed INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla contacts:', err);
                else console.log('✅ Tabla contacts creada');
            });

            // 2. TABLA DE TESTIMONIOS
            db.run(`
                CREATE TABLE IF NOT EXISTS testimonials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_name TEXT NOT NULL,
                    company TEXT NOT NULL,
                    position TEXT,
                    content TEXT NOT NULL,
                    rating INTEGER DEFAULT 5,
                    is_featured INTEGER DEFAULT 0,
                    is_active INTEGER DEFAULT 1,
                    image_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla testimonials:', err);
                else console.log('✅ Tabla testimonials creada');
            });

            // 3. TABLA DE QUIZ
            db.run(`
                CREATE TABLE IF NOT EXISTS quiz_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    answers TEXT NOT NULL,
                    email TEXT,
                    name TEXT,
                    score INTEGER NOT NULL,
                    recommendation TEXT NOT NULL,
                    user_ip TEXT,
                    user_agent TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla quiz_results:', err);
                else console.log('✅ Tabla quiz_results creada');
            });

            // 4. TABLA DE ANALYTICS
            db.run(`
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    event_data TEXT NOT NULL,
                    user_ip TEXT,
                    session_id TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla analytics_events:', err);
                else console.log('✅ Tabla analytics_events creada');
            });

            // 5. TABLA DE CONFIGURACIONES
            db.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    description TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla settings:', err);
                else console.log('✅ Tabla settings creada');
            });

            // 6. TABLA DE USUARIOS ADMIN
            db.run(`
                CREATE TABLE IF NOT EXISTS admin_users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT DEFAULT 'admin',
                    is_active INTEGER DEFAULT 1,
                    last_login DATETIME,
                    login_count INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla admin_users:', err);
                else console.log('✅ Tabla admin_users creada');
            });

            // Insertar testimonios iniciales
            db.get("SELECT COUNT(*) as count FROM testimonials", (err, row) => {
                if (err) {
                    console.error('Error verificando testimonios:', err);
                    return;
                }

                if (row.count === 0) {
                    console.log('📝 Insertando testimonios iniciales...');
                    
                    const testimonials = [
                        ['CEO de Galactech', 'Galactech', 'Chief Executive Officer', 'Neptune transformó nuestra forma de ver los datos. Ahora, cada decisión es una estrella guía en nuestro camino al éxito.', 5, 1, 1],
                        ['Directora de Stardust Inc.', 'Stardust Inc.', 'Directora de Innovación', 'La implementación de IA fue impecable. Su equipo nos guió a través de cada constelación del proceso.', 5, 1, 1],
                        ['Fundador de Orbit Solutions', 'Orbit Solutions', 'Founder & CTO', 'Pensábamos que la IA era de otra galaxia. Neptune la trajo a nuestra Tierra y los resultados son astronómicos.', 5, 1, 1]
                    ];

                    const stmt = db.prepare("INSERT INTO testimonials (client_name, company, position, content, rating, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    
                    testimonials.forEach(testimonial => {
                        stmt.run(testimonial);
                    });
                    
                    stmt.finalize();
                    console.log('✅ Testimonios iniciales insertados');
                }
            });

            // Insertar configuraciones iniciales
            db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
                if (err) {
                    console.error('Error verificando configuraciones:', err);
                    return;
                }

                if (row.count === 0) {
                    console.log('⚙️ Insertando configuraciones iniciales...');
                    
                    const settings = [
                        ['site_title', 'Neptune Studios', 'Título del sitio web'],
                        ['site_description', 'Consultoría en IA y Automatización de Procesos', 'Descripción del sitio'],
                        ['contact_email', 'contacto@neptunestudios.com', 'Email de contacto principal'],
                        ['analytics_enabled', 'true', 'Habilitar analytics'],
                        ['maintenance_mode', 'false', 'Modo de mantenimiento']
                    ];

                    const stmt = db.prepare("INSERT INTO settings (key, value, description) VALUES (?, ?, ?)");
                    
                    settings.forEach(setting => {
                        stmt.run(setting);
                    });
                    
                    stmt.finalize();
                    console.log('✅ Configuraciones iniciales insertadas');
                }
            });
        });

        // Cerrar la base de datos después de un breve delay para asegurar que todas las operaciones terminen
        setTimeout(() => {
            db.close((err) => {
                if (err) {
                    console.error('Error cerrando base de datos:', err);
                    reject(err);
                } else {
                    console.log('✅ Base de datos inicializada correctamente');
                    resolve();
                }
            });
        }, 1000);
    });
};

module.exports = {
    initDatabase,
    DB_PATH
};
