// ============================================
// NEPTUNE LANDING PAGE - INICIALIZACIÓN DE BASE DE DATOS
// Fase 3: Backend e Integración
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'neptune.db');

// Asegurar que el directorio de base de datos existe
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// ============================================
// CONEXIÓN A LA BASE DE DATOS
// ============================================

function getDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Error al conectar con la base de datos:', err.message);
                reject(err);
            } else {
                console.log('✅ Conectado a la base de datos SQLite');
                resolve(db);
            }
        });
    });
}

// ============================================
// SCHEMAS DE TABLAS
// ============================================

const createTables = async (db) => {
    return new Promise((resolve, reject) => {
        // Ejecutar todas las consultas en serie
        db.serialize(() => {
            
            // 1. TABLA DE CONTACTOS
            db.run(`
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    phone TEXT,
                    company TEXT,
                    source TEXT DEFAULT 'landing_page',
                    csrf_token TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'replied', 'archived')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla contacts:', err);
                else console.log('✅ Tabla contacts creada/verificada');
            });

            // 2. TABLA DE TESTIMONIOS
            db.run(`
                CREATE TABLE IF NOT EXISTS testimonials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    company TEXT,
                    position TEXT,
                    text TEXT NOT NULL,
                    rating INTEGER DEFAULT 5 CHECK(rating >= 1 AND rating <= 5),
                    avatar_url TEXT,
                    is_featured BOOLEAN DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla testimonials:', err);
                else console.log('✅ Tabla testimonials creada/verificada');
            });

            // 3. TABLA DE RESULTADOS DE QUIZ
            db.run(`
                CREATE TABLE IF NOT EXISTS quiz_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    user_email TEXT,
                    answers TEXT NOT NULL, -- JSON con las respuestas
                    result_profile TEXT NOT NULL CHECK(result_profile IN ('automation', 'prediction', 'personalization')),
                    scores TEXT NOT NULL, -- JSON con puntajes por categoría
                    ip_address TEXT,
                    user_agent TEXT,
                    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla quiz_results:', err);
                else console.log('✅ Tabla quiz_results creada/verificada');
            });

            // 4. TABLA DE ANALYTICS
            db.run(`
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL, -- 'page_view', 'form_submit', 'quiz_start', etc.
                    event_data TEXT, -- JSON con datos del evento
                    session_id TEXT,
                    user_id TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    referrer TEXT,
                    page_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla analytics_events:', err);
                else console.log('✅ Tabla analytics_events creada/verificada');
            });

            // 5. TABLA DE CONFIGURACIÓN
            db.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    description TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla settings:', err);
                else console.log('✅ Tabla settings creada/verificada');
            });

            // 6. USUARIOS ADMINISTRADORES
            db.run(`
                CREATE TABLE IF NOT EXISTS admin_users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'moderator')),
                    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
                    last_login DATETIME,
                    login_count INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) console.error('Error creando tabla admin_users:', err);
                else console.log('✅ Tabla admin_users creada/verificada');
            });

            // 7. INDICES PARA PERFORMANCE
            db.run(`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_quiz_profile ON quiz_results(result_profile)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active)`);

            console.log('✅ Índices creados/verificados');
            resolve();
        });
    });
};

// ============================================
// DATOS INICIALES
// ============================================

const insertInitialData = async (db) => {
    return new Promise((resolve, reject) => {
        
        // Insertar testimonios iniciales si no existen
        db.get("SELECT COUNT(*) as count FROM testimonials", (err, row) => {
            if (err) {
                console.error('Error verificando testimonios:', err);
                reject(err);
                return;
            }

            if (row.count === 0) {
                const testimonials = [
                    {
                        name: "CEO de Galactech",
                        company: "Galactech",
                        position: "Chief Executive Officer",
                        text: "Neptune transformó nuestra forma de ver los datos. Ahora, cada decisión es una estrella guía en nuestro camino al éxito.",
                        rating: 5,
                        is_featured: 1
                    },
                    {
                        name: "Directora de Stardust Inc.",
                        company: "Stardust Inc.",
                        position: "Directora de Innovación",
                        text: "La implementación de IA fue impecable. Su equipo nos guió a través de cada constelación del proceso.",
                        rating: 5,
                        is_featured: 1
                    },
                    {
                        name: "Fundador de Orbit Solutions",
                        company: "Orbit Solutions",
                        position: "Founder & CTO",
                        text: "Pensábamos que la IA era de otra galaxia. Neptune la trajo a nuestra Tierra y los resultados son astronómicos.",
                        rating: 5,
                        is_featured: 1
                    },
                    {
                        name: "Gerente de Nova Corp",
                        company: "Nova Corp",
                        position: "Operations Manager",
                        text: "Su enfoque estratégico es brillante. No solo implementan tecnología, construyen futuros.",
                        rating: 4,
                        is_featured: 0
                    },
                    {
                        name: "Líder de Proyectos en Pulsar",
                        company: "Pulsar Technologies",
                        position: "Project Leader",
                        text: "Increíble capacidad para simplificar lo complejo. Ahora la IA es nuestro copiloto de confianza.",
                        rating: 5,
                        is_featured: 0
                    },
                    {
                        name: "CTO de Quasar Systems",
                        company: "Quasar Systems",
                        position: "Chief Technology Officer",
                        text: "El ROI superó todas nuestras expectativas. Es como tener un motor de curvatura para el negocio.",
                        rating: 5,
                        is_featured: 1
                    },
                    {
                        name: "Jefa de Innovación en Nebula",
                        company: "Nebula Enterprises",
                        position: "Head of Innovation",
                        text: "Un verdadero socio estratégico. Su visión va más allá del código, entienden el núcleo del negocio.",
                        rating: 5,
                        is_featured: 1
                    }
                ];

                const stmt = db.prepare(`
                    INSERT INTO testimonials (name, company, position, text, rating, is_featured, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, 1)
                `);

                testimonials.forEach(testimonial => {
                    stmt.run([
                        testimonial.name,
                        testimonial.company,
                        testimonial.position,
                        testimonial.text,
                        testimonial.rating,
                        testimonial.is_featured
                    ]);
                });

                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error insertando testimonios:', err);
                        reject(err);
                    } else {
                        console.log('✅ Testimonios iniciales insertados');
                    }
                });
            }
        });

        // Insertar configuraciones iniciales
        db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
            if (err) {
                console.error('Error verificando configuraciones:', err);
                return;
            }

            if (row.count === 0) {
                const settings = [
                    {
                        key: 'site_title',
                        value: 'NEPTUNE - Consultoría Estratégica con Inteligencia Artificial',
                        description: 'Título principal del sitio web'
                    },
                    {
                        key: 'contact_email',
                        value: 'info@neptune-studios.com',
                        description: 'Email principal de contacto'
                    },
                    {
                        key: 'whatsapp_number',
                        value: '5491123456789',
                        description: 'Número de WhatsApp para contacto'
                    },
                    {
                        key: 'analytics_enabled',
                        value: 'true',
                        description: 'Habilitar seguimiento de analytics'
                    },
                    {
                        key: 'testimonials_auto_approve',
                        value: 'false',
                        description: 'Auto-aprobar nuevos testimonios'
                    }
                ];

                const stmt = db.prepare(`
                    INSERT OR IGNORE INTO settings (key, value, description)
                    VALUES (?, ?, ?)
                `);

                settings.forEach(setting => {
                    stmt.run([setting.key, setting.value, setting.description]);
                });

                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error insertando configuraciones:', err);
                        reject(err);
                    } else {
                        console.log('✅ Configuraciones iniciales insertadas');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
};

// ============================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ============================================

async function initDatabase() {
    try {
        const db = await getDatabase();
        await createTables(db);
        await insertInitialData(db);
        
        // Cerrar conexión de inicialización
        db.close((err) => {
            if (err) {
                console.error('Error cerrando base de datos:', err);
            } else {
                console.log('✅ Base de datos inicializada correctamente');
            }
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        throw error;
    }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

module.exports = {
    initDatabase,
    getDatabase,
    DB_PATH
};
