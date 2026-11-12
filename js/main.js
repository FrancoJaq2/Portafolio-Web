import { initUI } from './ui.js';
import { initTerminal } from './terminal.js';
import { initGitHub } from './github.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initTerminal();
  initGitHub(); // <-- Nueva función

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Efecto Typewriter
  const typeTarget = document.getElementById('typewriter');
  const words = ["Detección y monitoreo con SIEM", "Respuesta a incidentes", "Análisis de phishing", "Hardening de redes"];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeTarget && !prefersReducedMotion) {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typeTarget.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typeTarget.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }
      let typeSpeed = isDeleting ? 30 : 60;
      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
      }
      setTimeout(type, typeSpeed);
    }
    setTimeout(type, 1000);
  } else if (typeTarget) {
    typeTarget.textContent = words[0];
  }
});