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
    const navOverlay = document.getElementById('nav-overlay');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('is-active');
            menuToggle.classList.toggle('is-active');
            
            if (navOverlay) navOverlay.classList.toggle('is-active');

            if (isActive) {
                document.body.style.overflow = 'hidden';
                gsap.fromTo(".nav-desktop.is-active li", 
                    { x: -30, opacity: 0 }, 
                    { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power4.out", delay: 0.2 }
                );
            } else {
                cerrarNavDesplegable();
            }
        });

        document.querySelectorAll('.nav-desktop a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('is-active')) {
                    cerrarNavDesplegable();
                }
            });
        });

        function cerrarNavDesplegable() {
            gsap.to(".nav-desktop li", {
                x: 20,
                opacity: 0,
                duration: 0.4,
                stagger: { each: 0.05, from: "end" },
                ease: "power2.in",
                onComplete: () => {
                    navMenu.classList.remove('is-active');
                    menuToggle.classList.remove('is-active');
                    if (navOverlay) navOverlay.classList.remove('is-active');
                    document.body.style.overflow = '';
                }
            });
        }

        if (navOverlay) {
            navOverlay.addEventListener('click', cerrarNavDesplegable);
        }
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
            
            // Actualizar información de ubicación en la UI
            updateLocationInfo(cachedConfig);
            
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
                    titleElement.innerHTML = `${title} <span class="accent-color">${accentText}</span>`;
                } else {
                    titleElement.innerHTML = title;
                }
            }
            
            if (!config.eventDate) {
                setTimerVisible(false);
                setTitle('PRÓXIMAMENTE', 'MUY PRONTO');
                return;
            }
            
            const startDate = new Date(config.eventDate).getTime();
            const endDate = config.eventEndDate ? new Date(config.eventEndDate).getTime() : null;
            
            function updateTimer() {
                const now = new Date().getTime();
                
                if (endDate && now > endDate) {
                    setTimerVisible(false);
                    setTitle('MUY PRONTO,', 'NUEVA FECHA.');
                    return;
                }
                
                if (now >= startDate && (!endDate || now <= endDate)) {
                    setTimerVisible(false);
                    setTitle('ÁUREA', 'ESTÁ SUCEDIENDO!');
                    return;
                }
                
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
    // --- ACTUALIZAR INFORMACIÓN DE UBICACIÓN ---
    // ===================================================================================================== //
    function updateLocationInfo(config) {
        if (!config) return;
        
        const addressSpan = document.querySelector('.detail-block .text span');
        if (addressSpan && config.eventAddress) {
            addressSpan.innerHTML = config.eventAddress.replace(/\n/g, '<br>');
        }
        
        const stationsSpan = document.querySelectorAll('.detail-block .text span')[1];
        if (stationsSpan && config.nearbyStations) {
            stationsSpan.innerHTML = config.nearbyStations.split(',').map(s => s.trim()).join(', ');
        }
    }

    // ===================================================================================================== //
    // --- MAPA ---
    // ===================================================================================================== //
    async function initMap() {
        try {
            const config = await cargarConfiguracion();
            if (!config) return;
            
            const mapContainer = document.querySelector('.map-box');
            if (!mapContainer) return;
            
            let mapEmbed = config.mapEmbed;
            let mapLink = config.mapLink;
            
            const currentIframe = mapContainer.querySelector('iframe');
            if (currentIframe) {
                const srcMatch = mapEmbed?.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    currentIframe.src = srcMatch[1];
                } else if (mapEmbed) {
                    mapContainer.innerHTML = mapEmbed;
                }
            } else if (mapEmbed) {
                mapContainer.innerHTML = mapEmbed;
            }
            
            const mapButton = document.querySelector('.btn-maps-cta');
            if (mapButton && mapLink) {
                mapButton.href = mapLink;
            } else if (mapButton && !mapLink && mapEmbed) {
                const srcMatch = mapEmbed.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    const coordsMatch = srcMatch[1].match(/!3d([-\d.]+)!2d([-\d.]+)/);
                    if (coordsMatch) {
                        mapButton.href = `https://www.google.com/maps?q=${coordsMatch[1]},${coordsMatch[2]}`;
                    }
                }
            }
            
            console.log('Mapa actualizado');
            
        } catch (err) {
            console.error("Error cargando mapa:", err);
        }
    }

    // ===================================================================================================== //
    // --- DETECTAR CAMBIOS EN LOCALSTORAGE (PANEL ADMIN) ---
    // ===================================================================================================== //
    function listenForMapUpdates() {
        const savedEmbed = localStorage.getItem('mapEmbed');
        const savedLink = localStorage.getItem('mapLink');
        const eventAddress = localStorage.getItem('eventAddress');
        const nearbyStations = localStorage.getItem('nearbyStations');
        
        if (savedEmbed) {
            const mapContainer = document.querySelector('.map-box');
            if (mapContainer) {
                const currentIframe = mapContainer.querySelector('iframe');
                if (currentIframe) {
                    const srcMatch = savedEmbed.match(/src="([^"]+)"/);
                    if (srcMatch && srcMatch[1]) {
                        currentIframe.src = srcMatch[1];
                    }
                } else {
                    mapContainer.innerHTML = savedEmbed;
                }
            }
            
            const mapButton = document.querySelector('.btn-maps-cta');
            if (mapButton && savedLink) {
                mapButton.href = savedLink;
            }
            
            localStorage.removeItem('mapUpdated');
            localStorage.removeItem('mapEmbed');
            localStorage.removeItem('mapLink');
        }
        
        if (eventAddress) {
            const addressSpan = document.querySelector('.detail-block .text span');
            if (addressSpan) {
                addressSpan.innerHTML = eventAddress.replace(/\n/g, '<br>');
            }
            localStorage.removeItem('eventAddress');
        }
        
        if (nearbyStations) {
            const stationsSpan = document.querySelectorAll('.detail-block .text span')[1];
            if (stationsSpan) {
                stationsSpan.innerHTML = nearbyStations.split(',').map(s => s.trim()).join(', ');
            }
            localStorage.removeItem('nearbyStations');
        }
    }

    window.addEventListener('storage', (event) => {
        if (event.key === 'mapEmbed' && event.newValue) {
            const mapContainer = document.querySelector('.map-box');
            if (mapContainer) {
                const currentIframe = mapContainer.querySelector('iframe');
                if (currentIframe) {
                    const srcMatch = event.newValue.match(/src="([^"]+)"/);
                    if (srcMatch && srcMatch[1]) {
                        currentIframe.src = srcMatch[1];
                    }
                } else {
                    mapContainer.innerHTML = event.newValue;
                }
                console.log('Mapa actualizado automáticamente');
            }
        }
        
        if (event.key === 'mapLink' && event.newValue) {
            const mapButton = document.querySelector('.btn-maps-cta');
            if (mapButton) mapButton.href = event.newValue;
        }
        
        if (event.key === 'eventAddress' && event.newValue) {
            const addressSpan = document.querySelector('.detail-block .text span');
            if (addressSpan) {
                addressSpan.innerHTML = event.newValue.replace(/\n/g, '<br>');
            }
        }
        
        if (event.key === 'nearbyStations' && event.newValue) {
            const stationsSpan = document.querySelectorAll('.detail-block .text span')[1];
            if (stationsSpan) {
                stationsSpan.innerHTML = event.newValue.split(',').map(s => s.trim()).join(', ');
            }
        }
    });

    // ===================================================================================================== //
    // --- GALERÍA DINÁMICA ---
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
            
            const todasLasImagenesHTML = imagenes.map((foto, index) => `
                <div class="gallery-item" style="${index >= 6 ? 'display: none;' : ''}">
                    <a href="/assets/img/fotos/${foto}" data-lightbox="gallery" data-title="Galería Áurea">
                        <img src="/assets/img/fotos/${foto}" alt="Galería Áurea" loading="lazy">
                    </a>
                </div>
            `).join('');
            
            gallery.innerHTML = todasLasImagenesHTML;
            
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
        listenForMapUpdates();
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