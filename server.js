const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Asegurar que existan las carpetas necesarias
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

// ---  API para la Galería Dinámica
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

// ---  API para el Contador Dinámico ============
app.get('/api/config', (req, res) => {
    const configPath = path.join(__dirname, 'config.json');
    try {
        if (!fs.existsSync(configPath)) {
            // Crear archivo por defecto si no existe
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

// ---  Guardar configuración (desde panel admin)
app.post('/api/config/save', (req, res) => {
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

// ---  Configuración de Multer para subir imágenes
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

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// --- Subir imagen 
app.post('/api/imagenes/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ninguna imagen' });
        }
        
        // Actualizar lista de imágenes
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

// --- Eliminar imagen
app.delete('/api/imagenes/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'public/assets/img/fotos', filename);
    
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`Imagen eliminada: ${filename}`);
            
            // Actualizar lista de imágenes
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

// --- Servir archivos estáticos adicionales
app.use('/panel', express.static(path.join(__dirname, 'public/panel')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// --- Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📸 Galería: http://localhost:${PORT}/api/imagenes`);
    console.log(`⚙️  Config: http://localhost:${PORT}/api/config`);
    console.log(`🔐 Panel Admin: http://localhost:${PORT}/panel/`);
    console.log(`\nContraseña por defecto del panel: aura2026`);
});