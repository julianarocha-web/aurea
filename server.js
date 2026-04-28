const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// API para la Galería Dinámica
app.get('/api/imagenes', (req, res) => {
    const dirPath = path.join(__dirname, 'public/assets/img/fotos');
    try {
        const files = fs.readdirSync(dirPath).filter(file => 
            /\.(jpg|jpeg|png|webp)$/i.test(file)
        );
        res.json(files);
    } catch (err) {
        res.status(500).send('No se pudo leer la carpeta de fotos');
    }
});

// API para el Contador Dinámico
app.get('/api/config', (req, res) => {
    try {
        const data = fs.readFileSync('./config.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "Error al leer config.json" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});