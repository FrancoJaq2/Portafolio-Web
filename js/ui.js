import { CONFIG } from './config.js';

export function initUI() {
  // 1. Tema (Claro / Oscuro)
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // 2. Menú Móvil
  const menuToggle = document.getElementById('menu-toggle');
  const navbar = document.getElementById('navbar');
  
  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Navbar: Sombra al hacer scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }, { passive: true });

  // 4. Barra de progreso de lectura
  const progressBar = document.getElementById('reading-progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }, { passive: true });
  }

  // 5. Animaciones al hacer scroll (Reveal)
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // 6. Botón Volver Arriba
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // 7. Fecha del año actual en el footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 8. Configurar botones de contacto
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const linkEmail = document.getElementById('link-email');
  const linkWhatsapp = document.getElementById('link-whatsapp');
  const linkLinkedin = document.getElementById('link-linkedin');
  const linkGithub = document.getElementById('link-github');

  if (linkEmail) linkEmail.href = `mailto:${CONFIG.email}`;
  if (linkWhatsapp) linkWhatsapp.href = `https://wa.me/${CONFIG.telefonoWhatsapp}`;
  if (linkLinkedin) linkLinkedin.href = CONFIG.linkedin;
  if (linkGithub) linkGithub.href = `https://github.com/${CONFIG.githubUser}`;

  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.email);
        const originalText = btnCopyEmail.innerHTML;
        btnCopyEmail.textContent = '¡Copiado!';
        setTimeout(() => { btnCopyEmail.innerHTML = originalText; }, 2000);
      } catch (err) {
        console.error('Error al copiar el correo');
      }
    });
  }

  // 9. Command Palette (Ctrl+K)
  const paletteOverlay = document.getElementById('palette-overlay');
  const palette = document.getElementById('command-palette');
  const paletteInput = document.getElementById('palette-input');
  const paletteList = document.getElementById('palette-list');
  const cmdKButtons = document.querySelectorAll('.cmd-k-btn');

  function togglePalette() {
    const isOpen = palette.classList.contains('is-open');
    if (isOpen) {
      palette.classList.remove('is-open');
      paletteOverlay.classList.remove('is-open');
      palette.setAttribute('aria-hidden', 'true');
    } else {
      palette.classList.add('is-open');
      paletteOverlay.classList.add('is-open');
      palette.setAttribute('aria-hidden', 'false');
      paletteInput.value = '';
      filterPalette('');
      setTimeout(() => paletteInput.focus(), 100);
    }
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      togglePalette();
    }
    if (e.key === 'Escape' && palette.classList.contains('is-open')) {
      togglePalette();
    }
  });

  cmdKButtons.forEach(btn => btn.addEventListener('click', togglePalette));
  if (paletteOverlay) paletteOverlay.addEventListener('click', togglePalette);

  function filterPalette(query) {
    if (!paletteList) return;
    const items = paletteList.querySelectorAll('li');
    const lowerQuery = query.toLowerCase();
    
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(lowerQuery)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  if (paletteInput) {
    paletteInput.addEventListener('input', (e) => filterPalette(e.target.value));
  }

  if (paletteList) {
    paletteList.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        const target = e.target.getAttribute('data-target');
        if (target) {
          togglePalette();
          document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // 10. Formulario de Contacto (mailto)
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('cf-feedback');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      const correo = form.correo.value.trim();
      const mensaje = form.mensaje.value.trim();

      if (!nombre || !correo || !mensaje) {
        if(feedback) {
          feedback.textContent = "Por favor, completa todos los campos.";
          feedback.style.color = "var(--danger)";
        }
        return;
      }

      const subject = encodeURIComponent(`Contacto desde Portafolio - ${nombre}`);
      const body = encodeURIComponent(`Nombre: ${nombre}\nCorreo: ${correo}\n\nMensaje:\n${mensaje}`);
      
      window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
      
      if(feedback) {
        feedback.textContent = "Abriendo tu gestor de correo...";
        feedback.style.color = "var(--success)";
        form.reset();
      }
    });
  }

    // 11. Animación de contadores (Métricas)
  const counters = document.querySelectorAll('.counter');
  const speed = 200; 

  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-count');
      const count = +counter.innerText;
      const inc = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + inc);
        setTimeout(updateCount, 15);
      } else {
        counter.innerText = target;
      }
    };
    // Un pequeño retraso para que se vea el efecto
    setTimeout(updateCount, 500);
  });
}