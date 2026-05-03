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

function formatDateTimeLocal(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getSaveMessageElement() {
    return document.getElementById('saveMessage');
}

function showSaveMessage(message, isError = false) {
    const messageElement = getSaveMessageElement();
    if (!messageElement) return;

    messageElement.innerText = message;
    messageElement.style.color = isError ? '#c0392b' : '#2e7d32';
}

async function loadConfig() {
    try {
        const response = await fetch('/api/config?t=' + Date.now());
        if (!response.ok) throw new Error('No se pudo cargar la configuración');

        const config = await response.json();

        const eventDate = document.getElementById('eventDate');
        const eventEndDate = document.getElementById('eventEndDate');
        const driveLink = document.getElementById('driveLink');
        const ticketLink = document.getElementById('ticketLink');
        const mapLink = document.getElementById('mapLink');
        const mapEmbed = document.getElementById('mapEmbed');
        const eventAddress = document.getElementById('eventAddress');
        const nearbyStations = document.getElementById('nearbyStations');

        if (eventDate) eventDate.value = formatDateTimeLocal(config.eventDate);
        if (eventEndDate) eventEndDate.value = formatDateTimeLocal(config.eventEndDate);
        if (driveLink) driveLink.value = config.driveLink || '';
        if (ticketLink) ticketLink.value = config.ticketLink || '';
        if (mapLink) mapLink.value = config.mapLink || '';
        if (mapEmbed) mapEmbed.value = config.mapEmbed || '';
        if (eventAddress) eventAddress.value = config.eventAddress || '';
        if (nearbyStations) nearbyStations.value = config.nearbyStations || '';

        return config;
    } catch (err) {
        console.error('Error cargando configuración:', err);
        showSaveMessage('No se pudo cargar la configuración', true);
        return null;
    }
}

async function saveConfig() {
    const saveButton = document.querySelector('button[onclick="saveConfig()"]');
    const originalText = saveButton ? saveButton.innerText : '';

    if (saveButton) {
        saveButton.innerText = '💾 Guardando...';
        saveButton.disabled = true;
    }

    try {
        const payload = {
            eventDate: document.getElementById('eventDate')?.value || null,
            eventEndDate: document.getElementById('eventEndDate')?.value || null,
            driveLink: document.getElementById('driveLink')?.value || '',
            ticketLink: document.getElementById('ticketLink')?.value || '',
            mapLink: document.getElementById('mapLink')?.value || '',
            mapEmbed: document.getElementById('mapEmbed')?.value || '',
            eventAddress: document.getElementById('eventAddress')?.value || '',
            nearbyStations: document.getElementById('nearbyStations')?.value || ''
        };

        const response = await fetch('/api/config/save', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'No se pudo guardar la configuración');
        }

        showSaveMessage('Configuración guardada correctamente');
        localStorage.setItem('configUpdated', Date.now().toString());
        if (payload.mapEmbed) localStorage.setItem('mapEmbed', payload.mapEmbed); else localStorage.removeItem('mapEmbed');
        if (payload.mapLink) localStorage.setItem('mapLink', payload.mapLink); else localStorage.removeItem('mapLink');
        if (payload.eventAddress) localStorage.setItem('eventAddress', payload.eventAddress); else localStorage.removeItem('eventAddress');
        if (payload.nearbyStations) localStorage.setItem('nearbyStations', payload.nearbyStations); else localStorage.removeItem('nearbyStations');
        await loadConfig();
    } catch (err) {
        console.error('Error guardando configuración:', err);
        showSaveMessage(err.message || 'Error al guardar la configuración', true);
    } finally {
        if (saveButton) {
            saveButton.innerText = originalText || '💾 Guardar todos los cambios';
            saveButton.disabled = false;
        }
    }
}

async function loadGallery() {
    try {
        const response = await fetch('/api/imagenes?t=' + Date.now());
        const images = await response.json();
        const galleryList = document.getElementById('galleryList');

        if (!galleryList) return;

        if (!Array.isArray(images) || images.length === 0) {
            galleryList.innerHTML = '<p class="hint">No hay imágenes cargadas todavía.</p>';
            return;
        }

        galleryList.innerHTML = images.map((filename) => `
            <div class="image-item">
                <img src="/assets/img/fotos/${filename}" alt="${filename}">
                <div class="image-actions">
                    <span>${filename}</span>
                    <button type="button" onclick="deleteImage('${filename}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error cargando galería:', err);
        const galleryList = document.getElementById('galleryList');
        if (galleryList) {
            galleryList.innerHTML = '<p class="error">No se pudo cargar la galería.</p>';
        }
    }
}

async function uploadImage() {
    const input = document.getElementById('newImage');
    const file = input && input.files ? input.files[0] : null;

    if (!file) {
        showSaveMessage('Seleccioná una imagen antes de subirla.', true);
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/imagenes/upload', {
            method: 'POST',
            headers: getAuthHeadersMultipart(),
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'No se pudo subir la imagen');
        }

        if (input) input.value = '';
        showSaveMessage('Imagen subida correctamente');
        await loadGallery();
    } catch (err) {
        console.error('Error subiendo imagen:', err);
        showSaveMessage(err.message || 'Error al subir la imagen', true);
    }
}

async function deleteImage(filename) {
    const confirmed = confirm(`¿Eliminar ${filename}?`);
    if (!confirmed) return;

    try {
        const response = await fetch(`/api/imagenes/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'No se pudo eliminar la imagen');
        }

        showSaveMessage('Imagen eliminada correctamente');
        await loadGallery();
    } catch (err) {
        console.error('Error eliminando imagen:', err);
        showSaveMessage(err.message || 'Error al eliminar la imagen', true);
    }
}

// Iniciar verificación de sesión
checkSession();
