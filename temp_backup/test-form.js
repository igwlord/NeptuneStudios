// ============================================
// TEST SIMPLE DE FORMULARIO - NEPTUNE
// ============================================

const testFormSubmission = async () => {
    const testData = {
        name: "Usuario de Prueba",
        email: "test@ejemplo.com", 
        message: "Este es un mensaje de prueba para verificar que el formulario funciona correctamente."
    };

    try {
        console.log('🧪 Enviando datos de prueba al servidor...');
        
        const response = await fetch('http://localhost:3001/api/contact/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ ÉXITO: Formulario funcionando correctamente!');
            console.log('📧 Mensaje:', result.message);
        } else {
            console.log('❌ ERROR:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
};

// Auto-ejecutar el test
testFormSubmission();
