// Registro de plugins de GSAP
gsap.registerPlugin(ScrollToPlugin, Observer);

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA DE NAVEGACIÓN Y GSAP (Se mantiene igual) --- //

    // VARIABLES GLOBALES DE NAVEGACIÓN
    const container = document.querySelector('.snap-container');
    const sections = gsap.utils.toArray(".snap-section");
    const navLinks = document.querySelectorAll('.nav-desktop a');
    let currentIndex = 0;
    let isAnimating = false;

    // --- FUNCIÓN PARA IR A UNA SECCIÓN (GSAP)
    function goToSection(index) {
        // Bloqueo si está animando o si el índice se sale de los límites
        if (index < 0 || index >= sections.length || isAnimating) return;
        isAnimating = true;
        currentIndex = index;
        
        // Detectar si estamos en mobile o desktop
        const isMobile = window.innerWidth < 1024;
        let scrollTarget;
        
        if (isMobile) {
            // En mobile, el scroll es sobre el body/html
            scrollTarget = sections[index].offsetTop;
            gsap.to(window, {
                scrollTo: { y: scrollTarget, autoKill: false },
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => { isAnimating = false; }
            });
        } else {
            // En desktop, el scroll es sobre el container
            scrollTarget = sections[index].offsetTop;
            gsap.to(container, {
                scrollTo: { y: scrollTarget, autoKill: false },
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => { isAnimating = false; }
            });
        }
    }

    // --- SOPORTE PARA TECLADO (Flechas arriba/abajo) ---
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
                // Cerrar menú mobile si estuviera abierto
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

    // --- OBSERVADOR DE GSAP (Mouse, Trackpad y Touch) ---
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

    // --- INTERSECTION OBSERVER (Resaltar links activos) ---
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


    const header = document.querySelector('.main-header');
const snapContainer = document.querySelector('.snap-container');

snapContainer.addEventListener('scroll', () => {
    // Si el scroll baja más de 50px (o la altura de tu hero), activa el modo compacto
    if (snapContainer.scrollTop > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

    // --- MENÚ HAMBURGUESA ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-desktop');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            navMenu.classList.toggle('is-active');
            document.body.style.overflow = navMenu.classList.contains('is-active') ? 'hidden' : '';
        });
    }

    // --- BOTÓN BACK TO TOP ---
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

    // --- CONTADOR DINÁMICO ---
    async function initContador() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            
            const timerElement = document.getElementById('timer');
            const titleElement = document.querySelector('.countdown-content h2');
            
            // Caso 1: No hay fecha planificada
            if (!config.eventDate || config.eventDate === null) {
                if (timerElement) timerElement.style.display = 'none';
                if (titleElement) {
                    titleElement.innerHTML = 'PRÓXIMAMENTE<br><span class="accent-color">MUY PRONTO</span>';
                }
                return;
            }
            
            const startDate = new Date(config.eventDate).getTime();
            const endDate = config.eventEndDate ? new Date(config.eventEndDate).getTime() : null;
            const now = new Date().getTime();
            
            const updateTimer = () => {
                const now = new Date().getTime();
                const displayNumbers = document.querySelectorAll('.time-block .number');
                
                // Caso 2: Proximamente (si tiene endDate y ya pasó)
                if (endDate && now > endDate) {
                    if (timerElement) timerElement.style.display = 'none';
                    if (titleElement) {
                        titleElement.innerHTML = 'PRÓXIMAMENTE<br><span class="accent-color">PROXIMAMENTE</span>';
                    }
                    return;
                }
                
                // Caso 3: Evento ocurriendo ahora (startDate <= now <= endDate)
                if (now >= startDate && (!endDate || now <= endDate)) {
                    if (timerElement) timerElement.style.display = 'none';
                    if (titleElement) {
                        titleElement.innerHTML = 'ESTÁ<br><span class="accent-color">OCURRIENDO AHORA</span>';
                    }
                    return;
                }
                
                // Caso 4: Evento futuro - mostrar contador
                if (timerElement) timerElement.style.display = 'flex';
                if (titleElement) {
                    titleElement.innerHTML = '¿LISTO PARA CREAR <br>TU PRÓXIMO <span class="accent-color">RECUERDO</span>?';
                }
                
                const distance = startDate - now;
                
                if (distance <= 0) return;
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                const timeValues = [days, hours, minutes, seconds];
                if (displayNumbers.length > 0) {
                    displayNumbers.forEach((num, i) => {
                        num.innerHTML = timeValues[i].toString().padStart(2, '0');
                    });
                }
            };
            
            setInterval(updateTimer, 1000);
            updateTimer();
            
        } catch (err) {
            console.error("Error cargando contador:", err);
            const timerElement = document.getElementById('timer');
            const titleElement = document.querySelector('.countdown-content h2');
            if (timerElement) timerElement.style.display = 'none';
            if (titleElement) {
                titleElement.innerHTML = 'PRÓXIMAMENTE<br><span class="accent-color">MUY PRONTO</span>';
            }
        }
    }

    // --- GALERÍA DINÁMICA & LIGHTBOX---
    async function initGaleria() {
        try {
            const response = await fetch('/api/imagenes');
            const imagenes = await response.json();
            const gallery = document.querySelector('.gallery');
            const primeras6 = imagenes.slice(0, 6);
            
            // Crear un array con todas las imágenes para el lightbox (pero solo mostrar las primeras 6)
            const todasLasImagenesHTML = imagenes.map(foto => `
                <div class="gallery-item" style="${imagenes.indexOf(foto) >= 6 ? 'display: none;' : ''}">
                    <a href="assets/img/fotos/${foto}" data-lightbox="gallery" data-title="Galería Áurea">
                        <img src="assets/img/fotos/${foto}" alt="Galería Áurea" loading="lazy">
                    </a>
                </div>
            `).join('');
            
            // Insertar todas las imágenes en el DOM (las primeras 6 visibles, las demás ocultas)
            gallery.innerHTML = todasLasImagenesHTML;
            
            // Configurar SimpleLightbox para que incluya TODAS las imágenes
            const lightbox = new SimpleLightbox('.gallery-grid-wrapper .gallery a', {
                loop: true,
                captions: false,
                fileExt: false
            });
            
            // Forzar a que el lightbox reconozca todos los enlaces
            lightbox.refresh();
            
        } catch (err) {
            console.error("Error cargando galería:", err);
            
            // Fallback: mostrar mensaje de error en la galería
            const gallery = document.querySelector('.gallery');
            if (gallery) {
                gallery.innerHTML = '<div class="error-message">Error al cargar la galería. Por favor, intenta más tarde.</div>';
            }
        }
    }

    // --- Link del Drive dinámico ---
    async function cargarConfiguracion() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();

        // 1. Configurar el link del Drive
        const btnDrive = document.querySelector('.btn-gallery');
        if (btnDrive && config.driveLink) {
            btnDrive.href = config.driveLink;
        }

        // 2. Configurar el Contador (Tu lógica existente)
        iniciarLogicaContador(config.eventDate);

    } catch (err) {
        console.error("Error cargando la configuración:", err);
    }
}

    // Lanzamos las funciones dinámicas
    initContador();
    initGaleria();
    cargarConfiguracion();
    
    // --- MAPA (Google Maps API) ---
    function initMap() {
    const ubicacion = { lat: -34.582, lng: -58.433 }; // Coordenadas de Juan B. Justo 62
    const map = new google.maps.Map(document.getElementById("mapDiv"), {
        zoom: 15,
        center: ubicacion,
        styles: []
    });

    const marker = new google.maps.Marker({
        position: ubicacion,
        map: map,
        title: "ÁUREA",
    });

}

});



document.addEventListener('DOMContentLoaded', () => {
    const tl = gsap.timeline();

    // 1. Aparece el Título (H1)
    tl.from(".text", {
        filter: "blur(20px)",
        opacity: 0,
        scale: 0.9,
        duration: 1.5,
        ease: "power2.out"
    })
    // 2. Aparece la primera línea del P
    .from(".line1", {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.1,
        ease: "power3.inOut"
    }, "-=0.5") // Empieza un poquito antes de que termine el h1
    // 3. Aparece la segunda línea del P
    .from(".line2", {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.1,
        ease: "power3.inOut"
    }, "-=0.4"); // Empieza un poquito antes de que termine la línea 1
});

