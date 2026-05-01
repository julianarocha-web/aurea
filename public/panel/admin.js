// Contraseña (cambiar en producción)
const ADMIN_PASSWORD = 'aura2026';

// URL base para las API
const API_BASE = '';

// Estado de login
function login() {
    const password = document.getElementById('password').value;
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'block';
        loadConfig();
        loadGallery();
    } else {
        document.getElementById('loginError').innerText = 'Contraseña incorrecta';
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
}

// Verificar login al cargar
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
    loadConfig();
    loadGallery();
}

// Cargar configuración actual
async function loadConfig() {
    try {
        const response = await fetch(`${API_BASE}/api/config?t=${Date.now()}`);
        if (response.ok) {
            const config = await response.json();
            
            if (config.eventDate) {
                document.getElementById('eventDate').value = config.eventDate.replace(' ', 'T');
            }
            if (config.eventEndDate) {
                document.getElementById('eventEndDate').value = config.eventEndDate.replace(' ', 'T');
            }
            if (config.driveLink) document.getElementById('driveLink').value = config.driveLink;
            if (config.mapLink) document.getElementById('mapLink').value = config.mapLink;
            if (config.mapEmbed) document.getElementById('mapEmbed').value = config.mapEmbed;
        }
    } catch (err) {
        console.error('Error cargando config:', err);
        showMessage('Error al cargar configuración', 'error');
    }
}

// Guardar configuración
async function saveConfig() {
    const config = {
        eventDate: document.getElementById('eventDate').value?.replace('T', ' ') || null,
        eventEndDate: document.getElementById('eventEndDate').value?.replace('T', ' ') || null,
        driveLink: document.getElementById('driveLink').value || null,
        mapLink: document.getElementById('mapLink').value || null,
        mapEmbed: document.getElementById('mapEmbed').value || null
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/config/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        
        if (response.ok) {
            showMessage('✅ Configuración guardada correctamente', 'success');
        } else {
            throw new Error('Error al guardar');
        }
    } catch (err) {
        console.error('Error:', err);
        showMessage('❌ Error al guardar configuración', 'error');
    }
}

// Cargar galería
async function loadGallery() {
    try {
        const response = await fetch(`${API_BASE}/api/imagenes?t=${Date.now()}`);
        const imagenes = await response.json();
        const galleryList = document.getElementById('galleryList');
        
        if (!imagenes || imagenes.length === 0) {
            galleryList.innerHTML = '<p>📭 No hay imágenes. Subí la primera.</p>';
            return;
        }
        
        galleryList.innerHTML = imagenes.map(img => `
            <div class="image-item">
                <img src="/assets/img/fotos/${img}" alt="${img}">
                <p>${img.length > 30 ? img.substring(0, 27) + '...' : img}</p>
                <button onclick="deleteImage('${img}')">🗑️ Eliminar</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error cargando galería:', err);
        document.getElementById('galleryList').innerHTML = '<p>❌ Error al cargar imágenes</p>';
    }
}

// Subir imagen
async function uploadImage() {
    const fileInput = document.getElementById('newImage');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('📁 Seleccioná una imagen primero');
        return;
    }
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        alert('❌ Solo se permiten imágenes');
        return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ La imagen no debe superar los 5MB');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    const uploadBtn = event.target;
    const originalText = uploadBtn.innerText;
    uploadBtn.innerText = '📤 Subiendo...';
    uploadBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/api/imagenes/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('✅ Imagen subida correctamente');
            fileInput.value = '';
            loadGallery();
            showMessage('Imagen subida con éxito', 'success');
        } else {
            throw new Error('Error al subir');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('❌ Error al subir la imagen');
    } finally {
        uploadBtn.innerText = originalText;
        uploadBtn.disabled = false;
    }
}

// Eliminar imagen
async function deleteImage(filename) {
    if (!confirm(`¿Eliminar "${filename}"?`)) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/imagenes/${filename}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage(`✅ Imagen "${filename}" eliminada`, 'success');
            loadGallery();
        } else {
            throw new Error('Error al eliminar');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('❌ Error al eliminar la imagen');
    }
}

// Mostrar mensaje temporal
function showMessage(msg, type) {
    const messageDiv = document.getElementById('saveMessage');
    messageDiv.innerText = msg;
    messageDiv.className = type === 'error' ? 'error' : 'success';
    setTimeout(() => {
        messageDiv.innerText = '';
        messageDiv.className = '';
    }, 3000);
}