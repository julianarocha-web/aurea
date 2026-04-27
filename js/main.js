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