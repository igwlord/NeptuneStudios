// ============================================
// NEPTUNE LANDING PAGE - JAVASCRIPT PRINCIPAL
// Fase 2: Código JavaScript separado en archivo externo
// ============================================

import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INICIALIZACIÓN Y PRELOADER CON ANIMACIÓN SECUENCIAL ---
    const name = "NEPTUNE";
    const preloader = document.getElementById('preloader');
    const preloaderTitle = document.getElementById('preloader-title');
    
    // Crear primera animación del preloader
    name.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'preloader-char';
        span.textContent = char;
        span.style.animationDelay = `${index * 0.1}s`;
        preloaderTitle.appendChild(span);
    });

    // Secuencia de animación: Preloader -> Fade Out -> Título Principal -> Slogan -> Botón
    setTimeout(() => {
        startMainTitleSequence();
    }, 1000); // MUY RÁPIDO: Solo 1 segundo de preloader

    function startMainTitleSequence() {
        // 1. Ocultar preloader con fade out SUPER rápido
        preloader.style.transition = 'opacity 0.3s ease-out';
        preloader.style.opacity = '0';
        
        setTimeout(() => {
            preloader.style.display = 'none';
            document.querySelector('.main-content').classList.add('visible');
            
            // 2. Mostrar título principal "NEPTUNE" INMEDIATAMENTE
            setTimeout(() => {
                showMainTitle();
            }, 100); // Solo 0.1s para el título
            
            // 3. Mostrar slogan a los 0.3s
            setTimeout(() => {
                showTypwriterSlogan();
            }, 300); // 0.3s para el slogan
            
            // 4. Mostrar botón a los 0.5s
            setTimeout(() => {
                showCTAButton();
            }, 500); // 0.5s para el botón
        }, 300);
    }

    function showMainTitle() {
        const heroSection = document.querySelector('.hero-section');
        const titleContainer = document.getElementById('neptune-title');
        
        // Limpiar el contenido anterior
        titleContainer.innerHTML = '';
        titleContainer.style.opacity = '0';
        titleContainer.style.display = 'block';
        titleContainer.style.textAlign = 'center';
        titleContainer.style.width = '100%';
        
        // Crear spans para cada letra con animación rápida
        name.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'main-title-char';
            span.textContent = char;
            span.style.animationDelay = `${index * 0.03}s`; // Animación MUY rápida
            titleContainer.appendChild(span);
        });
        
        // Mostrar el título con fade in MUY rápido
        setTimeout(() => {
            titleContainer.style.transition = 'opacity 0.2s ease-in';
            titleContainer.style.opacity = '1';
        }, 20);
    }

    function showTypwriterSlogan() {
        let sloganElement = document.getElementById('hero-slogan');
        
        if (!sloganElement) {
            // Crear el elemento del slogan si no existe
            const heroSection = document.querySelector('.hero-section');
            const sloganDiv = document.createElement('div');
            sloganDiv.id = 'hero-slogan';
            sloganDiv.className = 'hero-slogan typewriter-slogan';
            
            // Insertar después del título y antes del botón
            const titleContainer = document.getElementById('neptune-title');
            const ctaButton = document.querySelector('.cta-button');
            heroSection.insertBefore(sloganDiv, ctaButton);
            sloganElement = sloganDiv;
        }
        
        // Texto del slogan con HTML para las etiquetas
        const sloganText = "Consultor IA, una nueva forma de pensar tu negocio.";
        const sloganTextWithHTML = 'Consultor <span class="ia-text">IA</span>, una nueva forma de pensar tu <span class="ia-text">negocio</span>.';
        
        let i = 0;
        sloganElement.innerHTML = '';
        sloganElement.style.opacity = '1';
        
        // Agregar cursor parpadeante
        sloganElement.classList.add('typewriter-cursor');
        
        function typeWriter() {
            if (i < sloganText.length) {
                // Manejar la palabra "IA" especialmente
                if (sloganText.substr(i, 2) === 'IA') {
                    sloganElement.innerHTML += '<span class="ia-text">IA</span>';
                    i += 2;
                }
                // Manejar la palabra "negocio" especialmente
                else if (sloganText.substr(i, 7) === 'negocio') {
                    sloganElement.innerHTML += '<span class="ia-text">negocio</span>';
                    i += 7;
                } else {
                    sloganElement.innerHTML += sloganText.charAt(i);
                    i++;
                }
                setTimeout(typeWriter, 70); // Velocidad de escritura un poco más lenta
            } else {
                // Quitar cursor después de terminar de escribir
                sloganElement.classList.remove('typewriter-cursor');
            }
        }
        
        // Iniciar efecto de máquina de escribir inmediatamente
        typeWriter();
    }

    function showCTAButton() {
        const ctaButton = document.querySelector('.hero-section .cta-button, .hero-section .bg-gradient-to-r');
        
        if (ctaButton) {
            ctaButton.style.opacity = '0';
            ctaButton.style.transform = 'translateY(15px)';
            ctaButton.style.transition = 'all 0.6s ease-out';
            ctaButton.style.display = 'block';
            
            // Mostrar botón inmediatamente
            setTimeout(() => {
                ctaButton.style.opacity = '1';
                ctaButton.style.transform = 'translateY(0)';
                
                // Inicializar el resto de funcionalidades después de un breve delay
                setTimeout(() => {
                    initPageFunctionality();
                }, 200);
            }, 50);
        } else {
            // Si no hay botón, inicializar funcionalidades
            initPageFunctionality();
        }
    }

    // --- 2. FUNCIÓN DE INICIALIZACIÓN PRINCIPAL ---
    function initPageFunctionality() {
        initHomePageAnimations();
        initNavigation();
        initQuiz();
        initAccordion();
        initTestimonials();
        initContactForm();
        initScrollBehavior();
        
        // Inicializar fondo 3D si está disponible
        if (typeof init3DBackground === 'function') {
            init3DBackground();
            animate3D();
        }
    }

    // --- 3. ANIMACIONES DE LA PÁGINA PRINCIPAL ---
    function initHomePageAnimations() {
        // Las animaciones del título principal ya se manejan en la secuencia inicial
        // Solo inicializar otras animaciones si es necesario
        
        // Inicializar animaciones de partículas si están presentes
        if (typeof initParticles === 'function') {
            initParticles();
        }
    }

    // --- 4. NAVEGACIÓN (MENÚ MÓVIL Y ESTADO ACTIVO) ---
    function initNavigation() {
        const header = document.getElementById('main-header');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const openIcon = document.getElementById('menu-open-icon');
        const closeIcon = document.getElementById('menu-close-icon');
        const navLinks = document.querySelectorAll('header nav a, #mobile-menu a');

        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                    openIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                }
            });
        });

        const sections = document.querySelectorAll('section');
        const desktopNavLinks = document.querySelectorAll('header nav a:not(.brand)');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    desktopNavLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href').substring(1) === entry.target.id);
                    });
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => observer.observe(section));
        
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
    
    // --- 5. LÓGICA DEL MICRO-QUIZ ---
    function initQuiz() {
        const startBtn = document.getElementById('start-quiz-btn');
        const quizStart = document.getElementById('quiz-start');
        const quizQuestions = document.getElementById('quiz-questions');
        const quizResult = document.getElementById('quiz-result');
        const progressBar = document.getElementById('progress-bar-inner');
        const questionContent = document.getElementById('quiz-question-content');

        const questions = [
            { question: "¿Cuál es el mayor desafío actual en tu negocio?", answers: [{ text: "Procesos manuales y repetitivos", profile: "automation" }, { text: "Dificultad para prever la demanda", profile: "prediction" }, { text: "Falta de personalización para clientes", profile: "personalization" }] },
            { question: "¿Qué tipo de datos genera tu negocio en mayor volumen?", answers: [{ text: "Interacciones de clientes y ventas", profile: "personalization" }, { text: "Datos de producción y logística", profile: "automation" }, { text: "Tendencias de mercado y competidores", profile: "prediction" }] },
            { question: "Si tuvieras un 'superpoder' para tu negocio, ¿cuál sería?", answers: [{ text: "Anticipar el futuro del mercado", profile: "prediction" }, { text: "Entender a cada cliente individualmente", profile: "personalization" }, { text: "Hacer que todo funcione sin errores 24/7", profile: "automation" }] }
        ];
        let currentQuestionIndex = 0;
        let scores = { automation: 0, prediction: 0, personalization: 0 };

        startBtn.addEventListener('click', () => {
            quizStart.classList.add('hidden');
            quizQuestions.classList.remove('hidden');
            displayQuestion();
        });

        function displayQuestion() {
            const q = questions[currentQuestionIndex];
            questionContent.innerHTML = `
                <div class="quiz-question-container">
                    <h3 class="font-orbitron text-xl md:text-2xl font-bold text-white text-center mb-8">${q.question}</h3>
                    <div class="space-y-4">
                        ${q.answers.map(answer => `<button data-profile="${answer.profile}" class="quiz-option w-full text-left p-4 rounded-lg border border-gray-600">${answer.text}</button>`).join('')}
                    </div>
                </div>
            `;
            progressBar.style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;
            
            document.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    scores[e.target.dataset.profile]++;
                    currentQuestionIndex++;
                    if (currentQuestionIndex < questions.length) {
                        displayQuestion();
                    } else {
                        progressBar.style.width = '100%';
                        showResult();
                    }
                });
            });
        }

        function showResult() {
            quizQuestions.classList.add('hidden');
            quizResult.classList.remove('hidden');
            const finalProfile = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
            const resultsData = {
                automation: { title: "Tu Oportunidad: Automatización Inteligente", description: "Tu empresa está lista para eliminar tareas repetitivas y optimizar flujos de trabajo. La IA puede ser el motor que impulse tu eficiencia a niveles cósmicos.", cta: "Contácte con un asesor" },
                prediction: { title: "Tu Oportunidad: Visión Predictiva", description: "Posees el potencial de convertir tus datos en informacion clave. <span class=\"ia-text\">Nosotros</span> te podemos ayudar a anticipar tendencias, prever la demanda y tomar decisiones estratégicas con una claridad que te distinga del mercado.", cta: "Contácte con un asesor" },
                personalization: { title: "Tu Resultado: Conexión a tu medida.", description: "El futuro de tu crecimiento reside en entender a tus clientes a un nivel profundo. <span class=\"ia-text\">Nosotros</span> podemos ayudarte a crear experiencias personalizadas que generen resultados medibles.", cta: "Contácte con un asesor" }
            };
            quizResult.innerHTML = `
                <h3 class="font-orbitron text-2xl md:text-3xl font-bold text-white mb-4">${resultsData[finalProfile].title}</h3>
                <p class="text-gray-300 mb-8">${resultsData[finalProfile].description}</p>
                <p class="text-lg font-semibold text-white mb-6">Ahora que conocés tu mayor oportunidad de crecimiento, contactanos para guiarte en cómo implementarla en tu empresa.</p>
                <a href="#contacto" class="cta-button px-8 py-3 text-lg font-bold text-white bg-purple-600 rounded-full">${resultsData[finalProfile].cta}</a>
            `;
        }
    }

    // --- 6. LÓGICA DEL ACCORDION ---
    function initAccordion() {
        const accordionData = [
            { title: "Exploración Cósmica", content: "Iniciamos con una inmersión profunda en tu universo de negocio. Analizamos tus datos, procesos y objetivos para trazar el mapa estelar de tus oportunidades de IA." },
            { title: "Diseño de la Nave", content: "Con el mapa trazado, diseñamos una solución de IA a medida. Creamos la arquitectura, seleccionamos las herramientas y definimos la hoja de ruta para la implementación." },
            { title: "Lanzamiento e Implementación", content: "Es hora del despegue. Integramos la solución de IA en tus sistemas existentes, asegurando una transición suave y capacitando a tu equipo para pilotar la nueva tecnología." },
            { title: "Evolución Continua", content: "El viaje no termina con el lanzamiento. Monitoreamos, optimizamos y evolucionamos continuamente tu ecosistema de IA para asegurar que siempre estés a la vanguardia." }
        ];
        const accordionContainer = document.getElementById('accordion-container');
        accordionContainer.innerHTML = accordionData.map((item, index) => `
            <div class="glassmorphism rounded-lg">
                <h2>
                    <button type="button" class="accordion-button flex items-center justify-between w-full p-5 font-medium text-left text-gray-300 border border-transparent rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500" aria-expanded="${index === 0}">
                        <span class="font-orbitron text-xl">${item.title}</span>
                        <svg class="accordion-icon w-6 h-6 shrink-0 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                    </button>
                </h2>
                <div class="accordion-content">
                    <div class="p-5 border-t border-gray-700/50"><p class="text-gray-300">${item.content}</p></div>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.accordion-button').forEach(button => {
            const content = button.closest('h2').nextElementSibling;
            if(button.getAttribute('aria-expanded') === 'true') {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
                content.style.maxHeight = !isExpanded ? content.scrollHeight + 'px' : '0px';
            });
        });
    }

    // --- 7. LÓGICA DE TESTIMONIOS ---
    function initTestimonials() {
        const testimonials = [
            { name: "CEO de Galactech", text: "Neptune transformó nuestra forma de ver los datos. Ahora, cada decisión es una estrella guía en nuestro camino al éxito.", rating: 5 },
            { name: "Directora de Stardust Inc.", text: "La implementación de IA fue impecable. Su equipo nos guió a través de cada constelación del proceso.", rating: 5 },
            { name: "Fundador de Orbit Solutions", text: "Pensábamos que la IA era de otra galaxia. Neptune la trajo a nuestra Tierra y los resultados son astronómicos.", rating: 5 },
            { name: "Gerente de Nova Corp", text: "Su enfoque estratégico es brillante. No solo implementan tecnología, construyen futuros.", rating: 4 },
            { name: "Líder de Proyectos en Pulsar", text: "Increíble capacidad para simplificar lo complejo. Ahora la IA es nuestro copiloto de confianza.", rating: 5 },
            { name: "CTO de Quasar Systems", text: "El ROI superó todas nuestras expectativas. Es como tener un motor de curvatura para el negocio.", rating: 5 },
            { name: "Jefa de Innovación en Nebula", text: "Un verdadero socio estratégico. Su visión va más allá del código, entienden el núcleo del negocio.", rating: 5 },
        ];
        const slider = document.querySelector('.testimonial-slider');
        const allTestimonials = [...testimonials, ...testimonials];
        slider.innerHTML = allTestimonials.map(t => `
            <div class="testimonial-card">
                <p class="italic">"${t.text}"</p>
                <div class="testimonial-author">- ${t.name}</div>
                <div class="neon-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
            </div>
        `).join('');
    }

    // --- 8. FORMULARIO DE CONTACTO FUNCIONAL ---
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const feedbackEl = document.getElementById('form-feedback');
        const submitButton = document.getElementById('submit-button');
        const messageTextarea = document.getElementById('message');
        const charCounter = document.getElementById('char-counter');

        if (!form) return;

        // Inicializar contador de caracteres
        if (messageTextarea && charCounter) {
            const maxLength = 1000;
            
            function updateCharCounter() {
                const currentLength = messageTextarea.value.length;
                const remaining = maxLength - currentLength;
                
                charCounter.textContent = `${currentLength}/${maxLength} caracteres`;
                
                // Cambiar color según proximidad al límite
                if (remaining <= 50) {
                    charCounter.className = 'text-xs text-red-400 font-semibold';
                } else if (remaining <= 100) {
                    charCounter.className = 'text-xs text-yellow-400';
                } else {
                    charCounter.className = 'text-xs text-gray-400';
                }
                
                console.log('Contador actualizado:', currentLength); // Debug
            }
            
            // Actualizar contador en tiempo real con múltiples eventos
            messageTextarea.addEventListener('input', updateCharCounter);
            messageTextarea.addEventListener('keyup', updateCharCounter);
            messageTextarea.addEventListener('keydown', updateCharCounter);
            messageTextarea.addEventListener('paste', () => {
                setTimeout(updateCharCounter, 10); // Esperar a que se procese el paste
            });
            
            // Inicializar contador
            updateCharCounter();
            
            console.log('Contador de caracteres inicializado'); // Debug
        } else {
            console.error('No se encontraron elementos:', { messageTextarea, charCounter }); // Debug
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) return;
            
            // UI feedback - estado de envío
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando mensaje...';
            submitButton.classList.add('opacity-50');
            
            try {
                // Obtener datos del formulario
                const formData = {
                    nombre: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    mensaje: document.getElementById('message').value.trim()
                };

                // Detectar si estamos en Netlify o desarrollo local
                const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                    ? '/api/contact/send' 
                    : '/.netlify/functions/contact';

                // Enviar al backend
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // Éxito - mostrar mensaje y limpiar formulario
                    showSuccessMessage(result.message);
                    form.reset();
                } else {
                    // Error del servidor
                    showErrorMessage(result.error || 'Error enviando el mensaje');
                }

            } catch (error) {
                console.error('Error enviando formulario:', error);
                showErrorMessage('Error de conexión. Por favor, inténtalo de nuevo.');
            } finally {
                // Restaurar botón
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar Mensaje';
                submitButton.classList.remove('opacity-50');
            }
        });
        
        function validateForm() {
            let isValid = true;
            const inputs = form.querySelectorAll('[required]');
            
            inputs.forEach(input => {
                const value = input.value.trim();
                
                if (!value) {
                    showFieldError(input, 'Este campo es obligatorio.');
                    isValid = false;
                    return;
                }
                
                if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        showFieldError(input, 'Por favor, introduce un email válido.');
                        isValid = false;
                        return;
                    }
                }
                
                if (input.name === 'name' && value.length < 2) {
                    showFieldError(input, 'El nombre debe tener al menos 2 caracteres.');
                    isValid = false;
                    return;
                }
                
                if (input.name === 'message' && value.length < 10) {
                    showFieldError(input, 'El mensaje debe tener al menos 10 caracteres.');
                    isValid = false;
                    return;
                }
                
                clearFieldError(input);
            });
            
            return isValid;
        }

        // Sistema de notificaciones mejorado
        function showNotification(type, title, message, subtitle = '') {
            const container = document.getElementById('notification-container');
            if (!container) return;

            // Crear elemento de notificación
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            // Crear ID único para la notificación
            const notificationId = 'notification-' + Date.now();
            notification.id = notificationId;

            // Icono según el tipo
            const icon = type === 'success' 
                ? '<svg class="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                : '<svg class="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>';

            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-header">
                        ${icon}
                        <h4 class="notification-title">${title}</h4>
                    </div>
                    <p class="notification-message">${message}</p>
                    ${subtitle ? `<p class="notification-subtitle">${subtitle}</p>` : ''}
                </div>
                <button class="notification-close" onclick="closeNotification('${notificationId}')" title="Cerrar notificación">
                    ×
                </button>
            `;

            // Agregar al contenedor
            container.appendChild(notification);

            // Auto-cerrar después de 15 segundos (más tiempo para leer)
            setTimeout(() => {
                closeNotification(notificationId);
            }, 15000);

            // Permitir cerrar haciendo clic en toda la notificación
            notification.addEventListener('click', (e) => {
                if (!e.target.classList.contains('notification-close')) {
                    closeNotification(notificationId);
                }
            });
        }

        // Función global para cerrar notificaciones
        window.closeNotification = function(notificationId) {
            const notification = document.getElementById(notificationId);
            if (notification) {
                notification.style.animation = 'slideOutLeft 0.3s ease-in forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        };

        function showSuccessMessage(message) {
            showNotification(
                'success',
                '¡Mensaje enviado exitosamente!',
                'Nos pondremos en contacto a la brevedad',
                'Revisaremos tu mensaje y te responderemos en las próximas 24 horas'
            );
            
            // Limpiar el feedback del formulario
            if (feedbackEl) {
                feedbackEl.innerHTML = '';
            }
        }

        function showErrorMessage(message) {
            showNotification(
                'error',
                'Error al enviar mensaje',
                message,
                'Por favor, inténtalo de nuevo o contáctanos por WhatsApp'
            );
            
            // Limpiar el feedback del formulario
            if (feedbackEl) {
                feedbackEl.innerHTML = '';
            }
        }

        function showFieldError(input, message) {
            input.classList.add('invalid');
            const errorEl = input.nextElementSibling;
            if (errorEl && errorEl.classList.contains('error-message')) {
                errorEl.textContent = message;
            }
        }

        function clearFieldError(input) {
            input.classList.remove('invalid');
            const errorEl = input.nextElementSibling;
            if (errorEl && errorEl.classList.contains('error-message')) {
                errorEl.textContent = '';
            }
        }
    }
    
    // --- 9. COMPORTAMIENTO DE SCROLL (REVEAL Y BOTÓN "VOLVER ARRIBA") ---
    function initScrollBehavior() {
        const backToTopButton = document.getElementById('back-to-top');
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => observer.observe(el));

        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('opacity-0', window.scrollY <= 300);
            backToTopButton.classList.toggle('translate-y-4', window.scrollY <= 300);
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});

// --- 10. ANIMACIÓN DE FONDO CON THREE.JS (OPTIMIZADA) ---
let scene, camera, renderer, stars, atom;

function init3DBackground() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 5;
    
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // MEJORA FASE 1: Estrellas optimizadas según capacidad del dispositivo
    const isMobile = window.innerWidth < 768;
    const isLowPerformance = navigator.hardwareConcurrency < 4;
    const starCount = isMobile ? 3000 : (isLowPerformance ? 5000 : 8000);
    
    const starVertices = [];
    for (let i = 0; i < starCount; i++) {
        starVertices.push(
            (Math.random() - 0.5) * 2000, 
            (Math.random() - 0.5) * 2000, 
            (Math.random() - 1) * 1000
        );
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.8 });
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Átomo de energía para la sección "Quiénes Somos" - DESHABILITADO
    // NOTA: Átomo 3D removido para mejorar performance y eliminar distracción visual
    const atomGroup = new THREE.Group();
    atomGroup.visible = false; // Átomo completamente oculto
    atom = atomGroup;
    scene.add(atom);
    
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);

    // Observer para mostrar/ocultar el átomo - DESHABILITADO
    // const nosotrosSection = document.getElementById('nosotros');
    // const atomObserver = new IntersectionObserver((entries) => {
    //     entries.forEach(entry => {
    //         atom.visible = entry.isIntersecting;
    //     });
    // }, { threshold: 0.1 });
    // atomObserver.observe(nosotrosSection);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
}

function onMouseMove(event) {
    if (camera) {
        const mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
        
        // Mueve la cámara principal
        camera.position.x += (mouseX * 0.1 - camera.position.x) * 0.02;
        camera.position.y += (mouseY * 0.1 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        // Animación del átomo removida para mejor performance
    }
}

let clock = new THREE.Clock();
function animate3D() {
    requestAnimationFrame(animate3D);
    if (document.hidden) { return; }
    
    const elapsedTime = clock.getElapsedTime();
    
    // Animación de estrellas
    stars.position.z = (elapsedTime * 0.1) % 5;
    
    // Animación del átomo removida - mejor performance

    renderer.render(scene, camera);
}

// ============================================
// INTEGRACIÓN CON BACKEND - FASE 3
// ============================================

// --- API CLIENT Y CONFIGURACIÓN ---
const API_BASE_URL = window.location.origin + '/api';
let csrfToken = null;

// Obtener token CSRF al cargar la página
async function getCSRFToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/contact/csrf-token`);
        const data = await response.json();
        if (data.success) {
            csrfToken = data.csrfToken;
        }
    } catch (error) {
        console.error('Error al obtener token CSRF:', error);
    }
}

// --- ANALYTICS CLIENT ---
class AnalyticsClient {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.pageLoadTime = Date.now();
        this.eventsQueue = [];
        this.isOnline = navigator.onLine;
        
        this.initEventListeners();
        this.trackPageView();
        this.startHeartbeat();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    initEventListeners() {
        // Detectar cuando el usuario se va
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_exit', {
                timeOnPage: Date.now() - this.pageLoadTime,
                scrollDepth: this.getScrollDepth()
            });
            this.flushEvents();
        });

        // Detectar cambios de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushEvents();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Trackear scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', throttle(() => {
            const currentDepth = this.getScrollDepth();
            if (currentDepth > maxScrollDepth) {
                maxScrollDepth = currentDepth;
                if (currentDepth > 75) {
                    this.trackEvent('scroll_deep', { depth: currentDepth });
                }
            }
        }, 1000));
    }

    getScrollDepth() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return Math.round((scrollTop / docHeight) * 100);
    }

    async trackPageView() {
        const data = {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        };

        await this.sendEvent('page_view', data);
    }

    async trackEvent(eventType, data = {}) {
        const eventData = {
            event: eventType,
            data: {
                ...data,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            }
        };

        if (this.isOnline) {
            await this.sendEvent('event', eventData);
        } else {
            this.eventsQueue.push(eventData);
        }
    }

    async trackInteraction(type, element, section = null, value = null) {
        const data = {
            type,
            element,
            section,
            value,
            sessionId: this.sessionId
        };

        await this.sendEvent('interaction', data);
    }

    async sendEvent(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error enviando evento ${endpoint}:`, error);
            // Guardar en cola para reintento
            this.eventsQueue.push({ endpoint, data });
        }
    }

    async flushEvents() {
        if (this.eventsQueue.length === 0 || !this.isOnline) return;

        const events = [...this.eventsQueue];
        this.eventsQueue = [];

        for (const event of events) {
            await this.sendEvent(event.endpoint, event.data);
        }
    }

    startHeartbeat() {
        // Enviar heartbeat cada 30 segundos para usuarios activos
        setInterval(() => {
            if (!document.hidden) {
                this.trackEvent('heartbeat', {
                    timeOnPage: Date.now() - this.pageLoadTime
                });
            }
        }, 30000);
    }
}

// --- ENHANCED CONTACT FORM ---
function initEnhancedContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Analytics
        analytics.trackEvent('form_submit_attempt', {
            formType: 'contact'
        });

        // UI feedback
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        submitButton.classList.add('opacity-50');

        try {
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                message: formData.get('message'),
                csrf_token: csrfToken
            };

            const response = await fetch(`${API_BASE_URL}/contact/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Éxito
                analytics.trackEvent('form_submit_success', {
                    formType: 'contact',
                    hasCompany: !!data.company
                });

                showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                form.reset();
            } else {
                throw new Error(result.error || 'Error al enviar el mensaje');
            }

        } catch (error) {
            console.error('Error al enviar formulario:', error);
            analytics.trackEvent('form_submit_error', {
                formType: 'contact',
                error: error.message
            });
            showNotification('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error');
        } finally {
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            submitButton.classList.remove('opacity-50');
        }
    });
}

// --- ENHANCED QUIZ ---
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizAnswers = [];

async function initEnhancedQuiz() {
    try {
        // Cargar preguntas del quiz
        const response = await fetch(`${API_BASE_URL}/quiz/questions`);
        const data = await response.json();
        
        if (data.success) {
            quizQuestions = data.questions;
            setupQuizUI();
        }
    } catch (error) {
        console.error('Error al cargar quiz:', error);
    }
}

function setupQuizUI() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;

    // Trackear inicio del quiz
    analytics.trackEvent('quiz_started', {
        totalQuestions: quizQuestions.length
    });

    renderCurrentQuestion();
}

function renderCurrentQuestion() {
    const quizContainer = document.getElementById('quiz-container');
    const question = quizQuestions[currentQuestionIndex];
    
    if (!question) return;

    const questionHTML = `
        <div class="quiz-question" data-question="${currentQuestionIndex}">
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-400">Pregunta ${currentQuestionIndex + 1} de ${quizQuestions.length}</span>
                    <div class="w-32 bg-gray-700 rounded-full h-2">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                             style="width: ${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%"></div>
                    </div>
                </div>
                <h3 class="text-xl font-bold text-white mb-4">${question.question}</h3>
            </div>
            
            <div class="quiz-options space-y-3">
                ${question.options.map((option, index) => `
                    <button class="quiz-option w-full p-4 text-left rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-200"
                            data-value="${option}" data-index="${index}">
                        <span class="text-white">${option}</span>
                    </button>
                `).join('')}
            </div>
            
            <div class="mt-6 flex justify-between">
                <button id="quiz-prev" class="px-4 py-2 text-gray-400 hover:text-white transition-colors" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                    ← Anterior
                </button>
                <button id="quiz-next" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg opacity-50 cursor-not-allowed" disabled>
                    ${currentQuestionIndex === quizQuestions.length - 1 ? 'Finalizar' : 'Siguiente →'}
                </button>
            </div>
        </div>
    `;

    quizContainer.innerHTML = questionHTML;

    // Event listeners para opciones
    const options = quizContainer.querySelectorAll('.quiz-option');
    const nextButton = document.getElementById('quiz-next');
    const prevButton = document.getElementById('quiz-prev');

    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remover selección anterior
            options.forEach(opt => opt.classList.remove('border-blue-500', 'bg-blue-500/20'));
            
            // Seleccionar nueva opción
            option.classList.add('border-blue-500', 'bg-blue-500/20');
            
            // Guardar respuesta
            quizAnswers[currentQuestionIndex] = option.dataset.value;
            
            // Habilitar botón siguiente
            nextButton.disabled = false;
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');

            // Analytics
            analytics.trackEvent('quiz_question_answered', {
                questionIndex: currentQuestionIndex,
                questionText: question.question,
                answer: option.dataset.value
            });
        });
    });

    nextButton.addEventListener('click', () => {
        if (currentQuestionIndex === quizQuestions.length - 1) {
            submitQuiz();
        } else {
            currentQuestionIndex++;
            renderCurrentQuestion();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderCurrentQuestion();
        }
    });
}

async function submitQuiz() {
    try {
        analytics.trackEvent('quiz_submit_attempt', {
            totalQuestions: quizQuestions.length,
            answeredQuestions: quizAnswers.filter(a => a).length
        });

        const data = {
            answers: quizAnswers,
            csrf_token: csrfToken
        };

        const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            analytics.trackEvent('quiz_submit_success', {
                score: result.result.score,
                recommendation: result.result.recommendation
            });

            showQuizResults(result.result);
        } else {
            throw new Error(result.error || 'Error al procesar quiz');
        }

    } catch (error) {
        console.error('Error al enviar quiz:', error);
        analytics.trackEvent('quiz_submit_error', {
            error: error.message
        });
        showNotification('Error al procesar el quiz. Por favor, inténtalo de nuevo.', 'error');
    }
}

function showQuizResults(result) {
    const quizContainer = document.getElementById('quiz-container');
    
    const resultsHTML = `
        <div class="quiz-results text-center">
            <div class="mb-6">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">¡Quiz Completado!</h3>
                <p class="text-blue-400 text-lg">Puntuación: ${result.score}/100</p>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-6 mb-6 text-left">
                <h4 class="text-lg font-semibold text-white mb-3">Nuestra Recomendación:</h4>
                <p class="text-gray-300 mb-4">${result.recommendation}</p>
                
                ${result.services.length > 0 ? `
                    <h5 class="text-md font-semibold text-white mb-2">Servicios Recomendados:</h5>
                    <ul class="text-blue-400 space-y-1 mb-4">
                        ${result.services.map(service => `<li>• ${service}</li>`).join('')}
                    </ul>
                ` : ''}
                
                <h5 class="text-md font-semibold text-white mb-2">Próximos Pasos:</h5>
                <ol class="text-gray-300 space-y-1">
                    ${result.nextSteps.map((step, index) => `<li>${index + 1}. ${step}</li>`).join('')}
                </ol>
            </div>
            
            <div class="space-y-3">
                <button id="contact-us-quiz" class="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                    Solicitar Consulta Gratuita
                </button>
                <button id="restart-quiz" class="w-full py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-blue-500 hover:text-white transition-all duration-200">
                    Repetir Quiz
                </button>
            </div>
        </div>
    `;

    quizContainer.innerHTML = resultsHTML;

    // Event listeners
    document.getElementById('contact-us-quiz').addEventListener('click', () => {
        analytics.trackEvent('quiz_result_contact_clicked', {
            score: result.score
        });
        
        // Scroll al formulario de contacto
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    document.getElementById('restart-quiz').addEventListener('click', () => {
        analytics.trackEvent('quiz_restarted');
        
        currentQuestionIndex = 0;
        quizAnswers = [];
        renderCurrentQuestion();
    });
}

// --- ENHANCED TESTIMONIALS ---
async function loadTestimonials() {
    try {
        const response = await fetch(`${API_BASE_URL}/testimonials`);
        const data = await response.json();
        
        if (data.success && data.testimonials.length > 0) {
            renderTestimonials(data.testimonials);
            analytics.trackEvent('testimonials_loaded', {
                count: data.testimonials.length
            });
        }
    } catch (error) {
        console.error('Error al cargar testimonios:', error);
    }
}

function renderTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    const testimonialsHTML = testimonials.map(testimonial => `
        <div class="testimonial-card bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ${testimonial.client_name.charAt(0)}
                </div>
                <div class="ml-4">
                    <h4 class="text-white font-semibold">${testimonial.client_name}</h4>
                    <p class="text-gray-400 text-sm">${testimonial.company}</p>
                </div>
                <div class="ml-auto">
                    <div class="flex text-yellow-400">
                        ${'★'.repeat(Math.floor(testimonial.rating))}${'☆'.repeat(5 - Math.floor(testimonial.rating))}
                    </div>
                </div>
            </div>
            <p class="text-gray-300">${testimonial.content}</p>
        </div>
    `).join('');

    container.innerHTML = testimonialsHTML;
}

// --- NOTIFICATION SYSTEM ---
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        'bg-blue-600'
    } text-white max-w-sm`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="flex-1">${message}</span>
            <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// --- UTILITY FUNCTIONS ---
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- INICIALIZACIÓN SIMPLIFICADA ---
document.addEventListener('DOMContentLoaded', async () => {
    // Comentado temporalmente para evitar errores 404/500
    // analytics = new AnalyticsClient();
    // await getCSRFToken();
    
    // Inicializar funciones básicas
    // initEnhancedContactForm(); // Reemplazado por initContactForm()
    // initEnhancedQuiz(); // Comentado temporalmente
    // await loadTestimonials(); // Comentado temporalmente
    
    console.log('Página cargada correctamente');
});

// Inicializar el fondo 3D cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    init3DBackground();
    animate3D();
});
