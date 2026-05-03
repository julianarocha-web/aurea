// ============================================================
// 0. CARGA DE VARIABLES DE ENTORNO (DEBE SER LO PRIMERO)
// ============================================================
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 1. CONFIGURACIÓN DE SEGURIDAD DESDE VARIABLES DE ENTORNO
// ============================================================
// El token se lee desde el archivo .env
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// Verificar que el token exista al iniciar el servidor
if (!ADMIN_TOKEN) {
    console.error('\n❌ ERROR CRÍTICO: No se encontró ADMIN_TOKEN en las variables de entorno');
    console.error('📌 Creá un archivo .env en la raíz del proyecto con:');
    console.error('   ADMIN_TOKEN=tu_token_secreto_aqui\n');
    process.exit(1); // Detiene el servidor si no hay token
}

// La contraseña del panel también desde variables de entorno
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'aura2026';

if (process.env.NODE_ENV !== 'production') {
    console.log('\n🔧 Modo desarrollo activado');
    console.log(`📌 ADMIN_TOKEN cargado: ${ADMIN_TOKEN.substring(0, 10)}...`);
    console.log(`📌 ADMIN_PASSWORD cargada: ${'*'.repeat(ADMIN_PASSWORD.length)}`);
}

// ============================================================
// 2. MIDDLEWARE DE VERIFICACIÓN DE TOKEN
// ============================================================
const verifyToken = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    
    if (!token || token !== ADMIN_TOKEN) {
        return res.status(401).json({ 
            error: 'No autorizado. Token de administración inválido o faltante.' 
        });
    }
    
    next();
};

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ============================================================
// 3. CREACIÓN DE CARPETAS NECESARIAS
// ============================================================
const ensureDirectories = () => {
    const dirs = [
        'public/assets/img/fotos',
        'uploads',
        'panel'
    ];
    dirs.forEach(dir => {
        const fullPath = path.join(__dirname, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`Creada carpeta: ${dir}`);
        }
    });
};
ensureDirectories();

// ============================================================
// 4. ENDPOINTS PÚBLICOS (NO REQUIEREN AUTENTICACIÓN)
// ============================================================

// API para la Galería Dinámica (público - solo lectura)
app.get('/api/imagenes', (req, res) => {
    const dirPath = path.join(__dirname, 'public/assets/img/fotos');
    try {
        if (!fs.existsSync(dirPath)) {
            return res.json([]);
        }
        const files = fs.readdirSync(dirPath).filter(file => 
            /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
        );
        res.json(files);
    } catch (err) {
        console.error('Error leyendo carpeta de fotos:', err);
        res.status(500).json({ error: "No se pudo leer la carpeta de fotos" });
    }
});

// API para el Contador Dinámico (público - solo lectura)
app.get('/api/config', (req, res) => {
    const configPath = path.join(__dirname, 'config.json');
    try {
        if (!fs.existsSync(configPath)) {
            const defaultConfig = {
                driveLink: '#',
                mapLink: '',
                mapEmbed: '',
                eventDate: null,
                eventEndDate: null,
                lastUpdate: new Date().toISOString()
            };
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
            return res.json(defaultConfig);
        }
        const data = fs.readFileSync(configPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error leyendo config.json:', err);
        res.status(500).json({ error: "Error al leer config.json" });
    }
});

// ============================================================
// 4.5. ENDPOINTS DE AUTENTICACIÓN PARA EL PANEL
// ============================================================

// Login - recibe contraseña y devuelve token
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
        // Devolver el token para que el frontend lo almacene
        res.json({ 
            success: true, 
            token: ADMIN_TOKEN,
            message: 'Login exitoso'
        });
    } else {
        res.status(401).json({ 
            error: 'Contraseña incorrecta' 
        });
    }
});

// Verificar si el token es válido
app.get('/api/admin/verify', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Token válido' });
});

// ============================================================
// 5. ENDPOINTS PROTEGIDOS (REQUIEREN TOKEN DE ADMIN)
// ============================================================

// Guardar configuración (desde panel admin) - PROTEGIDO
app.post('/api/config/save', verifyToken, (req, res) => {
    const configPath = path.join(__dirname, 'config.json');
    try {
        const newConfig = {
            ...req.body,
            lastUpdate: new Date().toISOString()
        };
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        console.log('Configuración guardada:', newConfig);
        res.json({ success: true, message: 'Configuración guardada correctamente' });
    } catch (err) {
        console.error('Error guardando config:', err);
        res.status(500).json({ error: "Error al guardar configuración" });
    }
});

// ============================================================
// 6. CONFIGURACIÓN DE MULTER PARA SUBIR IMÁGENES
// ============================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public/assets/img/fotos');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const timestamp = Date.now();
        cb(null, `${name}-${timestamp}${ext}`);
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'));
    }
};

// Inicializar Multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Subir imagen - PROTEGIDO
app.post('/api/imagenes/upload', verifyToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ninguna imagen' });
        }
        
        const dirPath = path.join(__dirname, 'public/assets/img/fotos');
        const files = fs.readdirSync(dirPath).filter(file => 
            /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
        );
        
        console.log(`Imagen subida: ${req.file.filename}`);
        res.json({ 
            success: true, 
            message: 'Imagen subida correctamente',
            filename: req.file.filename,
            images: files
        });
    } catch (err) {
        console.error('Error subiendo imagen:', err);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

// Eliminar imagen - PROTEGIDO
app.delete('/api/imagenes/:filename', verifyToken, (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'public/assets/img/fotos', filename);
    
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`Imagen eliminada: ${filename}`);
            
            const dirPath = path.join(__dirname, 'public/assets/img/fotos');
            const files = fs.existsSync(dirPath) ? 
                fs.readdirSync(dirPath).filter(file => 
                    /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
                ) : [];
            
            res.json({ 
                success: true, 
                message: 'Imagen eliminada correctamente',
                images: files
            });
        } else {
            res.status(404).json({ error: 'La imagen no existe' });
        }
    } catch (err) {
        console.error('Error eliminando imagen:', err);
        res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
});

// ============================================================
// 7. ARCHIVOS ESTÁTICOS Y RUTAS PRINCIPALES
// ============================================================

// Servir archivos estáticos adicionales
app.use('/panel', express.static(path.join(__dirname, 'panel')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ============================================================
// 8. INICIO DEL SERVIDOR
// ============================================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📸 Galería (público): http://localhost:${PORT}/api/imagenes`);
        console.log(`⚙️  Config (público): http://localhost:${PORT}/api/config`);
        console.log(`🔐 Panel Admin: http://localhost:${PORT}/panel/`);
        console.log(`\n🔒 Seguridad:`);
        console.log(`   - Token de API: ${ADMIN_TOKEN.substring(0, 10)}... (desde .env)`);
        console.log(`   - Contraseña panel: ${'*'.repeat(ADMIN_PASSWORD.length)} (desde .env)`);
        console.log(`\n⚠️  Para cambiar estas credenciales, editá el archivo .env`);
    });
}

module.exports = app;