// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    BASE_URL: "https://api-calculadora-v2-ggh9d6fcgyb2cjbu.mexicocentral-01.azurewebsites.net/api"
};

// ============================================
// 1. UTILIDADES DE SEGURIDAD Y VALIDACIÓN
// ============================================

// Validar formato de email
const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Evitar inyección de HTML (Seguridad XSS)
const mostrarResultadoSeguro = (elementoId, texto) => {
    const el = document.getElementById(elementoId);
    if (el) {
        el.textContent = texto; // textContent no ejecuta scripts
    }
};

// ============================================
// 2. FUNCIONES DE CÁLCULO
// ============================================

let sumar = async function() {
    const v1 = Number(document.getElementById("valor1").value);
    const v2 = Number(document.getElementById("valor2").value);
    
    if (isNaN(v1) || isNaN(v2)) {
        document.getElementById("resultado").textContent = "❌ Valores inválidos";
        return;
    }
    
    const suma = v1 + v2;
    mostrarResultadoSeguro("resultado", suma.toString());
    await guardarCalculoEnAzure("Sumatoria", `${v1} + ${v2}`, suma.toString());
};

let calculo_imc = async function() {
    const peso = Number(document.getElementById("valor5").value);
    const altura = Number(document.getElementById("valor6").value);
    
    if (!peso || !altura || altura === 0) {
        mostrarResultadoSeguro("imc_final", "❌ Datos inválidos");
        return;
    }
    
    const imc = peso / (altura * altura);
    let estado = imc < 18.5 ? "Bajo peso" : imc <= 24.9 ? "Normal" : imc <= 29.9 ? "Sobrepeso" : "Obesidad";
    
    const resultadoTexto = `IMC: ${imc.toFixed(2)} (${estado})`;
    mostrarResultadoSeguro("imc_final", resultadoTexto);
    await guardarCalculoEnAzure("IMC", `${peso}kg / ${altura}m`, imc.toFixed(2));
};

// (Nota: Aplica la misma lógica de Number() y mostrarResultadoSeguro a Velocidad y Círculo)

// ============================================
// 3. PERSISTENCIA Y API
// ============================================

async function guardarCalculoEnAzure(tipo, entrada, resultado) {
    const usuarioId = localStorage.getItem('usuarioId') || 'anonimo';
    
    try {
        await fetch(`${CONFIG.BASE_URL}/GuardarCalculo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                tipo, 
                entrada, 
                resultado, 
                usuario_id: usuarioId 
            })
        });
        await cargarHistorial();
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

async function cargarHistorial() {
    const usuarioId = localStorage.getItem('usuarioId') || 'anonimo';
    const container = document.getElementById('historialContainer');
    if (!container) return;

    try {
        const respuesta = await fetch(`${CONFIG.BASE_URL}/ObtenerHistorial?usuario_id=${usuarioId}&limite=20`);
        const data = await respuesta.json();
        
        container.textContent = ""; // Limpiar historial previo de forma segura

        if (!data.success || !data.historial || data.historial.length === 0) {
            container.textContent = "📭 No hay cálculos guardados.";
            return;
        }

        const fragmento = document.createDocumentFragment();
        data.historial.forEach(item => {
            const div = document.createElement("div");
            div.className = "list-group-item bg-transparent text-white border-secondary mb-2 rounded";
            
            // Construcción manual y segura del historial (sin innerHTML)
            const titulo = document.createElement("strong");
            titulo.textContent = `${item.tipo_calculo}: `;
            
            const info = document.createElement("span");
            info.textContent = `${item.datos_entrada} = ${item.resultado}`;
            
            div.appendChild(titulo);
            div.appendChild(info);
            fragmento.appendChild(div);
        });
        container.appendChild(fragmento);
        
    } catch (error) {
        container.textContent = "❌ Error al cargar historial";
    }
}

// ============================================
// 4. AUTENTICACIÓN
// ============================================

async function registrarUsuario() {
    const nombre = document.getElementById('regNombre').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!validarEmail(email)) {
        mostrarMensaje('registroMensaje', '❌ Email no válido', 'danger');
        return;
    }

    try {
        const respuesta = await fetch(`${CONFIG.BASE_URL}/RegistrarUsuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });
        const data = await respuesta.json();
        
        if (respuesta.ok && data.success) {
            mostrarMensaje('registroMensaje', '✅ Registrado correctamente', 'success');
        } else {
            mostrarMensaje('registroMensaje', `❌ ${data.error}`, 'danger');
        }
    } catch (e) {
        mostrarMensaje('registroMensaje', '❌ Error de red', 'danger');
    }
}

function cerrarSesion() {
    // Solo eliminamos lo relacionado a la sesión
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioEmail');
    
    actualizarUIUsuario();
    cargarHistorial();
}

// (Mantén actualizarUIUsuario y mostrarMensaje como estaban, ya son seguros)
