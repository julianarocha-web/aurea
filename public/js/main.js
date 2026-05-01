// Registro de plugins de GSAP
gsap.registerPlugin(ScrollToPlugin, Observer);

document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================================================== //
    // --- LÓGICA DE NAVEGACIÓN Y GSAP ---
    // ===================================================================================================== //
    const container = document.querySelector('.snap-container');
    const sections = gsap.utils.toArray(".snap-section");
    const navLinks = document.querySelectorAll('.nav-desktop a');
    let currentIndex = 0;
    let isAnimating = false;

    // --- FUNCIÓN PARA IR A UNA SECCIÓN (GSAP) ---
    function goToSection(index) {
        if (index < 0 || index >= sections.length || isAnimating) return;
        isAnimating = true;
        currentIndex = index;
        
        const isMobile = window.innerWidth < 1024;
        let scrollTarget;
        
        if (isMobile) {
            scrollTarget = sections[index].offsetTop;
            gsap.to(window, {
                scrollTo: { y: scrollTarget, autoKill: false },
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => { isAnimating = false; }
            });
        } else {
            scrollTarget = sections[index].offsetTop;
            gsap.to(container, {
                scrollTo: { y: scrollTarget, autoKill: false },
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => { isAnimating = false; }
            });
        }
    }

    // --- SOPORTE PARA TECLADO ---
    window.addEventListener("keydown", (e) => {
        if (isAnimating) return;
        if (e.key === "ArrowDown" || e.key === "PageDown") {
            goToSection(currentIndex + 1);
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
            goToSection(currentIndex - 1);
        }
    });

    // --- MANEJO DE CLICS EN NAVEGACIÓN ---
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            const targetIndex = sections.indexOf(targetSection);

            if (targetIndex !== -1) {
                const navMenu = document.querySelector('.nav-desktop');
                const menuToggle = document.querySelector('.menu-toggle');
                if (navMenu && navMenu.classList.contains('is-active')) {
                    navMenu.classList.remove('is-active');
                    menuToggle.classList.remove('is-active');
                    document.body.style.overflow = '';
                }
                goToSection(targetIndex);
            }
        });
    });

    // --- OBSERVADOR DE GSAP ---
    if (window.innerWidth >= 1024) {
        Observer.create({
            target: container,
            type: "wheel,touch", 
            wheelSpeed: -1, 
            tolerance: 15,       
            preventDefault: true,
            onUp: () => !isAnimating && goToSection(currentIndex + 1), 
            onDown: () => !isAnimating && goToSection(currentIndex - 1),
            ignore: ".no-scroll, .gallery, .simple-lightbox, .sl-overlay, .sl-wrapper"
        });
    }

    // --- INTERSECTION OBSERVER ---
    const activeLinkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => activeLinkObserver.observe(section));

    // --- HEADER SCROLL ---
    const header = document.querySelector('.main-header');
    const snapContainer = document.querySelector('.snap-container');
    snapContainer.addEventListener('scroll', () => {
        if (snapContainer.scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ===================================================================================================== //
    // --- MENÚ HAMBURGUESA ---
    // ===================================================================================================== //
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-desktop');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            navMenu.classList.toggle('is-active');
            document.body.style.overflow = navMenu.classList.contains('is-active') ? 'hidden' : '';
        });
    }

    // ===================================================================================================== //
    // --- BOTÓN PARA VOLVER ARRIBA ---
    // ===================================================================================================== //
    const backToTopBtn = document.getElementById('backToTop');

    const handleScroll = () => {
        const isMobile = window.innerWidth < 1024;
        let scrollPos;
        
        if (isMobile) {
            scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        } else {
            scrollPos = container ? container.scrollTop : 0;
        }

        if (scrollPos > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    };

    if (container) container.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    // ===================================================================================================== //
    // --- CONFIGURACIÓN (API del servidor) ---
    // ===================================================================================================== //
    
    let cachedConfig = null;
    
    async function cargarConfiguracion() {
        try {
            const response = await fetch('/api/config?t=' + Date.now());
            if (!response.ok) throw new Error('Error al cargar config');
            cachedConfig = await response.json();
            console.log('Configuración cargada:', cachedConfig);
            return cachedConfig;
        } catch (err) {
            console.error("Error cargando configuración:", err);
            return null;
        }
    }

    // ===================================================================================================== //
    // --- CONTADOR DINÁMICO ---
    // ===================================================================================================== //
    async function initContador() {
        try {
            const config = await cargarConfiguracion();
            if (!config) throw new Error('No hay configuración');
            
            const timerContainer = document.getElementById('timer');
            const titleElement = document.getElementById('countdownTitle');
            
            const daysSpan = document.getElementById('days');
            const hoursSpan = document.getElementById('hours');
            const minutesSpan = document.getElementById('minutes');
            const secondsSpan = document.getElementById('seconds');
            
            function setTimerVisible(visible) {
                timerContainer.style.display = visible ? 'flex' : 'none';
            }
            
            function setTitle(title, accentText = null) {
                if (accentText) {
                    titleElement.innerHTML = `${title}<br><span class="accent-color">${accentText}</span>`;
                } else {
                    titleElement.innerHTML = title;
                }
            }
            
            // Verificar si hay fecha válida
            if (!config.eventDate) {
                setTimerVisible(false);
                setTitle('PRÓXIMAMENTE', 'MUY PRONTO');
                return;
            }
            
            const startDate = new Date(config.eventDate).getTime();
            const endDate = config.eventEndDate ? new Date(config.eventEndDate).getTime() : null;
            
            console.log('Fecha inicio:', new Date(startDate));
            console.log('Fecha fin:', endDate ? new Date(endDate) : 'Sin fecha fin');
            
            function updateTimer() {
                const now = new Date().getTime();
                
                // Evento finalizado
                if (endDate && now > endDate) {
                    setTimerVisible(false);
                    setTitle('PRÓXIMAMENTE', 'NUEVA FECHA PRONTO');
                    return;
                }
                
                // Evento ocurriendo ahora
                if (now >= startDate && (!endDate || now <= endDate)) {
                    setTimerVisible(false);
                    setTitle('ESTÁ', 'OCURRIENDO AHORA');
                    return;
                }
                
                // Evento futuro - mostrar contador
                setTimerVisible(true);
                setTitle('¿LISTO PARA CREAR <br>TU PRÓXIMO', 'RECUERDO?');
                
                const distance = startDate - now;
                if (distance <= 0) return;
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                daysSpan.innerHTML = days.toString().padStart(2, '0');
                hoursSpan.innerHTML = hours.toString().padStart(2, '0');
                minutesSpan.innerHTML = minutes.toString().padStart(2, '0');
                secondsSpan.innerHTML = seconds.toString().padStart(2, '0');
            }
            
            updateTimer();
            setInterval(updateTimer, 1000);
            
        } catch (err) {
            console.error("Error cargando contador:", err);
            const timerContainer = document.getElementById('timer');
            const titleElement = document.getElementById('countdownTitle');
            if (timerContainer) timerContainer.style.display = 'none';
            if (titleElement) {
                titleElement.innerHTML = 'PRÓXIMAMENTE<br><span class="accent-color">MUY PRONTO</span>';
            }
        }
    }

    // ===================================================================================================== //
    // --- LINK DEL DRIVE ---
    // ===================================================================================================== //
    async function configurarDrive() {
        try {
            const config = await cargarConfiguracion();
            if (!config) return;
            
            const btnDrive = document.querySelector('.btn-gallery');
            if (btnDrive && config.driveLink && config.driveLink !== '#') {
                btnDrive.href = config.driveLink;
                console.log('Link del Drive actualizado:', config.driveLink);
            }
        } catch (err) {
            console.error("Error configurando Drive:", err);
        }
    }

    // ===================================================================================================== //
    // --- MAPA ---
    // ===================================================================================================== //
    async function initMap() {
        try {
            const config = await cargarConfiguracion();
            if (!config) return;
            
            // Si hay un embed de mapa, usarlo
            if (config.mapEmbed && config.mapEmbed.includes('iframe')) {
                const srcMatch = config.mapEmbed.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    const mapContainer = document.getElementById('mapDiv');
                    if (mapContainer) {
                        const iframe = document.createElement('iframe');
                        iframe.src = srcMatch[1];
                        iframe.width = '100%';
                        iframe.height = '100%';
                        iframe.style.border = '0';
                        iframe.style.borderRadius = '8px';
                        iframe.allowFullscreen = true;
                        iframe.loading = 'lazy';
                        iframe.title = 'Ubicación ÁUREA';
                        
                        mapContainer.parentNode.replaceChild(iframe, mapContainer);
                        iframe.id = 'mapDiv';
                        console.log('Mapa embed cargado');
                        return;
                    }
                }
            }
            
            // Si hay un link de mapa, usarlo
            if (config.mapLink && config.mapLink !== '#') {
                const mapContainer = document.getElementById('mapDiv');
                if (mapContainer) {
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyCmL18misQw9KdwqGaw3zHkitj8vG6QF2Y&q=${encodeURIComponent(config.mapLink)}`;
                    iframe.width = '100%';
                    iframe.height = '100%';
                    iframe.style.border = '0';
                    iframe.style.borderRadius = '8px';
                    iframe.allowFullscreen = true;
                    iframe.loading = 'lazy';
                    
                    mapContainer.parentNode.replaceChild(iframe, mapContainer);
                    iframe.id = 'mapDiv';
                    console.log('Mapa desde link cargado');
                    return;
                }
            }
            
            // Fallback: coordenadas por defecto (Juan B. Justo 62)
            if (typeof google !== 'undefined' && google.maps) {
                const ubicacion = { lat: -34.582, lng: -58.433 };
                const map = new google.maps.Map(document.getElementById("mapDiv"), {
                    zoom: 15,
                    center: ubicacion,
                    styles: []
                });
                new google.maps.Marker({
                    position: ubicacion,
                    map: map,
                    title: "ÁUREA",
                });
                console.log('Mapa con Google Maps API cargado');
            } else {
                console.warn('Google Maps no disponible');
            }
            
        } catch (err) {
            console.error("Error cargando mapa:", err);
        }
    }

    // ===================================================================================================== //
    // --- GALERÍA DINÁMICA & LIGHTBOX---
    // ===================================================================================================== //
    async function initGaleria() {
        try {
            const response = await fetch('/api/imagenes?t=' + Date.now());
            const imagenes = await response.json();
            const gallery = document.querySelector('.gallery');
            
            if (!gallery) {
                console.error('No se encontró el contenedor .gallery');
                return;
            }
            
            if (!imagenes || imagenes.length === 0) {
                gallery.innerHTML = '<div class="error-message">No hay imágenes disponibles. Subí algunas desde el panel de administración.</div>';
                return;
            }
            
            // Crear todas las imágenes (mostrar primeras 6)
            const todasLasImagenesHTML = imagenes.map((foto, index) => `
                <div class="gallery-item" style="${index >= 6 ? 'display: none;' : ''}">
                    <a href="/assets/img/fotos/${foto}" data-lightbox="gallery" data-title="Galería Áurea">
                        <img src="/assets/img/fotos/${foto}" alt="Galería Áurea" loading="lazy">
                    </a>
                </div>
            `).join('');
            
            gallery.innerHTML = todasLasImagenesHTML;
            
            // Configurar SimpleLightbox
            const lightbox = new SimpleLightbox('.gallery a', {
                loop: true,
                captions: false,
                fileExt: false
            });
            lightbox.refresh();
            
            console.log(`Galería cargada con ${imagenes.length} imágenes`);
            
        } catch (err) {
            console.error("Error cargando galería:", err);
            const gallery = document.querySelector('.gallery');
            if (gallery) {
                gallery.innerHTML = '<div class="error-message">Error al cargar la galería. Por favor, intenta más tarde.</div>';
            }
        }
    }

    // ===================================================================================================== //
    // --- INICIALIZACIÓN ---
    // ===================================================================================================== //
    
    async function inicializarTodo() {
        await cargarConfiguracion();
        await initContador();
        await configurarDrive();
        await initMap();
        await initGaleria();
    }
    
    inicializarTodo();

});

// ===================================================================================================== //
// --- ANIMACIONES DEL HERO ---
// ===================================================================================================== //
document.addEventListener('DOMContentLoaded', () => {
    const tl = gsap.timeline();

    tl.from(".text", {
        filter: "blur(20px)",
        opacity: 0,
        scale: 0.9,
        duration: 1.5,
        ease: "power2.out"
    })
    .from(".line1", {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.1,
        ease: "power3.inOut"
    }, "-=0.5")
    .from(".line2", {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.1,
        ease: "power3.inOut"
    }, "-=0.4");
});