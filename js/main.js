
// ----MENÚ HAMBURGUESA----- //
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-desktop');
    const navLinks = document.querySelectorAll('.nav-desktop a');

    // Función para alternar el menú
    const toggleMenu = () => {
        menuToggle.classList.toggle('is-active');
        navMenu.classList.toggle('is-active');
        
        // Bloquear scroll del body cuando el menú está abierto
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

//------- CONTADOR --------//

document.addEventListener('DOMContentLoaded', () => {
    // 1. SETEA TU FECHA AQUÍ (Formato: Año, Mes-1, Día, Hora, Minuto)
    // Nota: Los meses en JS empiezan en 0 (Enero es 0, Diciembre es 11)
    const targetDate = new Date(2026, 4, 31, 23, 59, 59).getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Cálculos de tiempo
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Seleccionamos los elementos del DOM
        const displayNumbers = document.querySelectorAll('.time-block .number');

        if (distance < 0) {
            clearInterval(timerInterval);
            displayNumbers.forEach(num => num.innerHTML = "00");
            return;
        }

        // Actualizamos cada bloque (asumiendo el orden: Días, Horas, Minutos, Segundos)
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