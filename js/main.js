// Registro de plugins de GSAP
gsap.registerPlugin(ScrollToPlugin, Observer);

document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES GLOBALES DE NAVEGACIÓN ---
    const container = document.querySelector('.snap-container');
    const sections = gsap.utils.toArray(".snap-section");
    const navLinks = document.querySelectorAll('.nav-desktop a');
    let currentIndex = 0;
    let isAnimating = false;

    // --- FUNCIÓN PARA IR A UNA SECCIÓN (GSAP) ---
    function goToSection(index) {
        // Bloqueo si está animando o si el índice se sale de los límites
        if (index < 0 || index >= sections.length || isAnimating) return;

        isAnimating = true;
        currentIndex = index;

        gsap.to(container, {
            scrollTo: { y: sections[index].offsetTop, autoKill: false },
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                isAnimating = false;
            }
        });
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
            type: "wheel,touch,pointer", 
            wheelSpeed: -1, 
            tolerance: 15,       
            preventDefault: true,
            onUp: () => !isAnimating && goToSection(currentIndex + 1), 
            onDown: () => !isAnimating && goToSection(currentIndex - 1),
            ignore: ".no-scroll" 
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
        let scrollPos = (window.innerWidth >= 1024 && container) 
            ? container.scrollTop 
            : (window.pageYOffset || document.documentElement.scrollTop);

        if (scrollPos > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    };

    if (container) container.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    // --- CONTADOR ---
    const targetDate = new Date(2026, 4, 31, 23, 59, 59).getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        const displayNumbers = document.querySelectorAll('.time-block .number');

        if (distance < 0 || displayNumbers.length === 0) {
            displayNumbers.forEach(num => num.innerHTML = "00");
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        displayNumbers[0].innerHTML = days.toString().padStart(2, '0');
        displayNumbers[1].innerHTML = hours.toString().padStart(2, '0');
        displayNumbers[2].innerHTML = minutes.toString().padStart(2, '0');
        displayNumbers[3].innerHTML = seconds.toString().padStart(2, '0');
    };

    setInterval(updateTimer, 1000);
    updateTimer();
});
