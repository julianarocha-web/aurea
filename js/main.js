
const navLinksActive = document.querySelectorAll('.nav-desktop a');

const activeLinkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinksActive.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.6 });

document.querySelectorAll('section[id]').forEach(section => {
    activeLinkObserver.observe(section);
});


// ----MENÚ HAMBURGUESA----- //
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-desktop');
    const navLinks = document.querySelectorAll('.nav-desktop a');

    // Función para alternar el menú
    const toggleMenu = () => {
        menuToggle.classList.toggle('is-active');
        navMenu.classList.toggle('is-active');

        document.body.style.overflow = navMenu.classList.contains('is-active') ? 'hidden' : '';
    };
    menuToggle.addEventListener('click', toggleMenu);

    // Cerrar el menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('is-active')) {
                toggleMenu();
            }
        });
    });
});

//--- BOTON HOME ---//
const backToTopBtn = document.getElementById('backToTop');
const snapContainer = document.querySelector('.snap-container');

const handleScroll = () => {
    let scrollPos;
    if (window.innerWidth >= 1024 && snapContainer) {
        scrollPos = snapContainer.scrollTop;
    } else {
        scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    }

    if (scrollPos > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
};

if (snapContainer) {
    snapContainer.addEventListener('scroll', handleScroll);
}
window.addEventListener('scroll', handleScroll);

//------- CONTADOR --------//

document.addEventListener('DOMContentLoaded', () => {
    // 1. SETEA TU FECHA AQUÍ (Formato: Año, Mes-1, Día, Hora, Minuto)
    const targetDate = new Date(2026, 4, 31, 23, 59, 59).getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Cálculos de tiempo
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const displayNumbers = document.querySelectorAll('.time-block .number');

        if (distance < 0) {
            clearInterval(timerInterval);
            displayNumbers.forEach(num => num.innerHTML = "00");
            return;
        }

        displayNumbers[0].innerHTML = days < 10 ? '0' + days : days;
        displayNumbers[1].innerHTML = hours < 10 ? '0' + hours : hours;
        displayNumbers[2].innerHTML = minutes < 10 ? '0' + minutes : minutes;
        displayNumbers[3].innerHTML = seconds < 10 ? '0' + seconds : seconds;
    };

    // Ejecutar cada segundo
    const timerInterval = setInterval(updateTimer, 1000);
    
    // Ejecutar una vez al cargar para evitar el "00" inicial
    updateTimer();
});


document.addEventListener('DOMContentLoaded', () => {
    // Registramos los plugins
    gsap.registerPlugin(ScrollToPlugin, Observer);

    const container = document.querySelector('.snap-container');
    const sections = gsap.utils.toArray(".snap-section");
    let currentIndex = 0;
    let isAnimating = false;

    // Función para ir a una sección específica
    function goToSection(index) {
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

    // Observador para detectar el scroll
    Observer.create({
        target: container,
        type: "wheel,touch,pointer",

        // --- AJUSTES DE SENSIBILIDAD ---
        wheelSpeed: -0.5, // Probá valores entre -0.1 y -1. Un número más cercano a 0 suele ser más sensible en algunos mouses.
        tolerance: 1,     // Bajalo al mínimo para que reaccione al instante.
        // -------------------------------
    
        onUp: () => !isAnimating && goToSection(currentIndex + 1), 
        onDown: () => !isAnimating && goToSection(currentIndex - 1),
        preventDefault: true
    });

});
