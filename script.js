// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
    // Centralizamos la URL para que sea fácil cambiarla a futuro
    BASE_URL: "https://api-calculadora-v2-ggh9d6fcgyb2cjbu.mexicocentral-01.azurewebsites.net/api"
};

// ============================================
// 1. FUNCIÓN SUMAR
// ============================================
let sumar = async function() {
    const valor1 = parseInt(document.getElementById("valor1").value);
    const valor2 = parseInt(document.getElementById("valor2").value);
    
    if (isNaN(valor1) || isNaN(valor2)) {
        document.getElementById("resultado").innerHTML = "<h2 style='color:#ff6b6b'>❌ Ingresa valores válidos</h2>";
        return;
    }
    
    const suma = valor1 + valor2;
    document.getElementById("resultado").innerHTML = "<h2>" + suma + "</h2>";
    
    await guardarCalculoEnAzure("Sumatoria", `${valor1} + ${valor2}`, suma.toString());
}

// ============================================
// 2. FUNCIÓN CÍRCULO
// ============================================
let circulo = async function() {
    const radio = parseFloat(document.getElementById("radio").value) || 0;
    
    if (radio > 0) {
        const area = Math.PI * Math.pow(radio, 2);
        const perimetro = 2 * Math.PI * radio;
        document.getElementById("area").innerHTML = "<strong>Área:</strong> " + area.toFixed(2);
        document.getElementById("perimetro").innerHTML = "<strong>Perímetro:</strong> " + perimetro.toFixed(2);
        
        await guardarCalculoEnAzure("Círculo", `Radio: ${radio}`, `Área: ${area.toFixed(2)}, Perímetro: ${perimetro.toFixed(2)}`);
    } else {
        document.getElementById("area").innerHTML = "❌ Ingrese un radio válido";
    }
}

// ============================================
// 3. FUNCIÓN VELOCIDAD
// ============================================
let calcular = async function(tipo) {
    const km = parseFloat(document.getElementById("valor3").value) || 0;
    const horas = parseFloat(document.getElementById("valor4").value) || 1;
    
    if (km === 0) {
        document.getElementById("area_resultado").innerHTML = "<h6 style='color:#ff6b6b'>❌ Ingrese una distancia válida</h6>";
        return;
    }
    
    const metros = km * 1000;
    const segundos = horas * 3600;
    const millas = km * 0.621371;
    let resultadoFinal = "";
    let tipoTexto = "";

    if (tipo === 'km') {
        resultadoFinal = (km / horas).toFixed(2) + " km/h";
        tipoTexto = "km/h";
    } else if (tipo === 'ms') {
        resultadoFinal = (metros / segundos).toFixed(2) + " m/s";
        tipoTexto = "m/s";
    } else if (tipo === 'mi') {
        resultadoFinal = (millas / horas).toFixed(2) + " mi/h";
        tipoTexto = "mi/h";
    }

    document.getElementById("area_resultado").innerHTML = "<h6>" + resultadoFinal + "</h6>";
    await guardarCalculoEnAzure("Velocidad", `${km} km en ${horas} horas (${tipoTexto})`, resultadoFinal);
}

// ============================================
// 4. FUNCIÓN IMC
// ============================================
let calculo_imc = async function() {
    const pes_kilos = parseFloat(document.getElementById("valor5").value);
    const alt_metros = parseFloat(document.getElementById("valor6").value);
    
    if (isNaN(pes_kilos) || isNaN(alt_metros) || alt_metros === 0) {
        document.getElementById("imc_final").innerHTML = "<h2 style='color:#ff6b6b'>❌ Ingresa valores válidos</h2>";
        return;
    }
    
    const imc = pes_kilos / Math.pow(alt_metros, 2);
    let estado = "";
    if (imc < 18.5) estado = "Bajo peso";
    else if (imc >= 18.5 && imc <= 24.9) estado = "Peso normal";
    else if (imc >= 25 && imc <= 29.9) estado = "Sobrepeso";
    else estado = "Obesidad";

    const imc_calculado = `Su IMC es: ${imc.toFixed(2)} (${estado})`;
    document.getElementById("imc_final").innerHTML = "<h2>" + imc_calculado + "</h2>";

    await guardarCalculoEnAzure("IMC", `${pes_kilos} kg / ${alt_metros} m`, imc.toFixed(2));
}

// ============================================
// 5. FUNCIÓN GENÉRICA PARA GUARDAR
// ============================================
async function guardarCalculoEnAzure(tipo, entrada, resultado) {
    const usuarioId = localStorage.getItem('usuarioId') || 'anonimo';
    
    try {
        const respuesta = await fetch(`${CONFIG.BASE_URL}/GuardarCalculo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                tipo: tipo,
                entrada: entrada,
                resultado: resultado,
                usuario_id: usuarioId 
            })
        });
        
        if (respuesta.ok) {
            mostrarToast(`${tipo} guardado correctamente ✅`, 'success');
            await cargarHistorial();
        }
    } catch (error) {
        console.error("Error de red:", error);
    }
}

// ============================================
// 6. SISTEMA DE AUTENTICACIÓN
// ============================================

async function registrarUsuario() {
    const nombre = document.getElementById('regNombre').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!nombre || !email || !password) {
        mostrarMensaje('registroMensaje', '❌ Todos los campos son obligatorios', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        mostrarMensaje('registroMensaje', '❌ Las contraseñas no coinciden', 'danger');
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
            mostrarMensaje('registroMensaje', '✅ ¡Registro exitoso! Ya puedes iniciar sesión', 'success');
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('modalRegistro')).hide();
                new bootstrap.Modal(document.getElementById('modalLogin')).show();
            }, 1500);
        } else {
            mostrarMensaje('registroMensaje', `❌ ${data.error || 'Error al registrar'}`, 'danger');
        }
    } catch (error) {
        mostrarMensaje('registroMensaje', '❌ Error de conexión', 'danger');
    }
}

async function iniciarSesion() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        mostrarMensaje('loginMensaje', '❌ Ingresa email y contraseña', 'danger');
        return;
    }
    
    try {
        const respuesta = await fetch(`${CONFIG.BASE_URL}/LoginUsuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        const data = await respuesta.json();
        
        if (respuesta.ok && data.success) {
            localStorage.setItem('usuarioId', data.usuario.id);
            localStorage.setItem('usuarioNombre', data.usuario.nombre);
            localStorage.setItem('usuarioEmail', data.usuario.email);
            
            bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
            actualizarUIUsuario();
            await cargarHistorial();
            mostrarToast(`✅ ¡Bienvenido ${data.usuario.nombre}!`, 'success');
        } else {
            mostrarMensaje('loginMensaje', `❌ ${data.error || 'Error al iniciar sesión'}`, 'danger');
        }
    } catch (error) {
        mostrarMensaje('loginMensaje', '❌ Error de conexión', 'danger');
    }
}

// ============================================
// 7. UTILIDADES DE UI
// ============================================

function cerrarSesion() {
    localStorage.clear();
    actualizarUIUsuario();
    cargarHistorial();
    mostrarToast('👋 Sesión cerrada correctamente', 'info');
}

function actualizarUIUsuario() {
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioNombre = localStorage.getItem('usuarioNombre');
    
    const btnLoginNavLi = document.getElementById('btnLoginNavLi');
    const usuarioInfoLi = document.getElementById('usuarioInfoLi');
    const usuarioNombreSpan = document.getElementById('usuarioNombre');
    const btnCerrarSesionLi = document.getElementById('btnCerrarSesionLi');
    
    if (usuarioId) {
        if (btnLoginNavLi) btnLoginNavLi.classList.add('d-none');
        if (usuarioInfoLi) {
            usuarioInfoLi.classList.remove('d-none');
            if (usuarioNombreSpan) usuarioNombreSpan.innerHTML = `👤 ${usuarioNombre}`;
        }
        if (btnCerrarSesionLi) btnCerrarSesionLi.classList.remove('d-none');
    } else {
        if (btnLoginNavLi) btnLoginNavLi.classList.remove('d-none');
        if (usuarioInfoLi) usuarioInfoLi.classList.add('d-none');
        if (btnCerrarSesionLi) btnCerrarSesionLi.classList.add('d-none');
    }
}

async function cargarHistorial() {
    const usuarioId = localStorage.getItem('usuarioId') || 'anonimo';
    const container = document.getElementById('historialContainer');
    if (!container) return;
    
    try {
        const respuesta = await fetch(`${CONFIG.BASE_URL}/ObtenerHistorial?usuario_id=${usuarioId}&limite=20`);
        const data = await respuesta.json();
        
        if (!data.success || !data.historial || data.historial.length === 0) {
            container.innerHTML = '<div class="text-center text-muted p-4">📭 No hay cálculos guardados.</div>';
            return;
        }
        
        let html = '<div class="list-group">';
        data.historial.forEach(item => {
            const fecha = new Date(item.fecha_creacion).toLocaleString('es-ES');
            html += `
                <div class="list-group-item bg-transparent text-white border-secondary mb-2 rounded">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary">${item.tipo_calculo}</span>
                        <small class="text-muted">${fecha}</small>
                    </div>
                    <div class="mt-2">
                        <strong>📥 Entrada:</strong> ${item.datos_entrada}<br>
                        <strong>📤 Resultado:</strong> <span class="fw-bold text-info">${item.resultado}</span>
                    </div>
                </div>`;
        });
        container.innerHTML = html + '</div>';
    } catch (error) {
        container.innerHTML = '<div class="text-center text-danger p-4">❌ Error al cargar historial</div>';
    }
}

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.textContent = mensaje;
    toast.style.cssText = `position:fixed; bottom:20px; right:20px; padding:12px 24px; border-radius:8px; color:white; z-index:9999; font-weight:bold; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: opacity 0.3s; background-color: ${tipo === 'success' ? '#28a745' : '#dc3545'}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function mostrarMensaje(elementId, mensaje, tipo) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = mensaje;
        el.className = `alert alert-${tipo} d-block`;
        setTimeout(() => el.classList.add('d-none'), 3000);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    actualizarUIUsuario();
    cargarHistorial();
});
