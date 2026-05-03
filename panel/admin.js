// ===================================================================================================== //
// --- SESION DEL ADMIN ---
// ===================================================================================================== //

// Función para manejar el login del admin
async function login() {
    const password = document.getElementById('password').value;
    const loginBtn = event.target;
    const originalText = loginBtn.innerText;
    
    loginBtn.innerText = '🔄 Verificando...';
    loginBtn.disabled = true;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });
        
        if (response.ok) {
            const data = await response.json();
            // El servidor nos devuelve el token
            sessionStorage.setItem('adminToken', data.token);
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminContainer').style.display = 'block';
            loadConfig();
            loadGallery();
        } else {
            const error = await response.json();
            document.getElementById('loginError').innerText = error.error || 'Contraseña incorrecta';
        }
    } catch (err) {
        console.error('Error en login:', err);
        document.getElementById('loginError').innerText = 'Error al conectar con el servidor';
    } finally {
        loginBtn.innerText = originalText;
        loginBtn.disabled = false;
    }
}

// Función para manejar el logout del admin
function logout() {
    sessionStorage.removeItem('adminToken');
    location.reload();
}

// Verificar login al cargar
async function checkSession() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;
    
    try {
        const response = await fetch('/api/admin/verify', {
            headers: { 'x-admin-token': token }
        });
        
        if (response.ok) {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminContainer').style.display = 'block';
            loadConfig();
            loadGallery();
        } else {
            sessionStorage.removeItem('adminToken');
        }
    } catch (err) {
        console.error('Error verificando sesión:', err);
    }
}

// Función para obtener headers con token
function getAuthHeaders() {
    const token = sessionStorage.getItem('adminToken');
    return {
        'x-admin-token': token,
        'Content-Type': 'application/json'
    };
}

// Función para obtener headers con token para multipart/form-data
function getAuthHeadersMultipart() {
    const token = sessionStorage.getItem('adminToken');
    return {
        'x-admin-token': token
    };
}

// Iniciar verificación de sesión
checkSession();