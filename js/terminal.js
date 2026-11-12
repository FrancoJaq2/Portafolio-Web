import { CONFIG } from './config.js';

export function initTerminal() {
  const output = document.getElementById('terminal-output');
  const input = document.getElementById('terminal-input');
  const terminal = document.getElementById('hero-terminal');
  const skipBtn = document.getElementById('skip-terminal');
  
  if (!output || !input) return;

  const promptStr = "franco@sec-lab:~$";
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function printLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `term-line ${className}`;
    line.innerHTML = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  // Secuencia inicial automática
  async function runBootSequence() {
    output.innerHTML = ''; // Limpiar
    skipBtn.style.display = 'none';

    const sequence = [
      { cmd: "whoami", res: "Franco Javier Aravena Quinteros" },
      { cmd: "cat perfil.txt", res: "Técnico en Ciberseguridad. Enfoque en análisis SOC, SIEM (Wazuh) y hardening de redes." },
      { cmd: "ls proyectos/", res: "SOC-Home-Lab  Laboratorio-Analisis-Phishing  SOC-Lab-Enumeration-Mitigation" }
    ];

    for (let i = 0; i < sequence.length; i++) {
      if (!document.body.contains(output)) return; // Si se salió de la página

      const item = sequence[i];
      printLine(`<span class="term-prompt">${promptStr}</span> ${item.cmd}`);
      
      if (!prefersReducedMotion) await new Promise(r => setTimeout(r, 800));
      
      printLine(`<span class="term-success">${item.res}</span>`);
      if (!prefersReducedMotion) await new Promise(r => setTimeout(r, 600));
    }
    
    printLine('Escribe <span class="term-warn">help</span> para ver los comandos disponibles.');
    input.disabled = false;
    input.focus();
  }

  // Ejecutar al cargar
  if (prefersReducedMotion) {
    // Si el usuario prefiere menos movimiento, mostrar todo de golpe
    output.innerHTML = `
      <div class="term-line"><span class="term-prompt">${promptStr}</span> whoami</div>
      <div class="term-line term-success">Franco Javier Aravena Quinteros</div>
      <div class="term-line"><span class="term-prompt">${promptStr}</span> cat perfil.txt</div>
      <div class="term-line term-success">Técnico en Ciberseguridad. Enfoque en análisis SOC, SIEM (Wazuh) y hardening de redes.</div>
      <div class="term-line"><span class="term-prompt">${promptStr}</span> ls proyectos/</div>
      <div class="term-line term-success">SOC-Home-Lab  Laboratorio-Analisis-Phishing  SOC-Lab-Enumeration-Mitigation</div>
      <div class="term-line">Escribe <span class="term-warn">help</span> para ver los comandos disponibles.</div>
    `;
    input.disabled = false;
  } else {
    input.disabled = true;
    setTimeout(runBootSequence, 1000);
  }

  // Botón de saltar animación
  skipBtn.addEventListener('click', () => {
    runBootSequence(); // Ejecuta de nuevo pero sin demoras si modificamos la lógica, o simplemente forzamos el final
    // Simplificación: forzamos prefers-reduced-motion temporalmente no es lo ideal, así que haremos un bypass:
    output.innerHTML = `
      <div class="term-line"><span class="term-prompt">${promptStr}</span> whoami</div>
      <div class="term-line term-success">Franco Javier Aravena Quinteros</div>
      <div class="term-line"><span class="term-prompt">${promptStr}</span> cat perfil.txt</div>
      <div class="term-line term-success">Técnico en Ciberseguridad. Enfoque en análisis SOC, SIEM (Wazuh) y hardening de redes.</div>
      <div class="term-line"><span class="term-prompt">${promptStr}</span> ls proyectos/</div>
      <div class="term-line term-success">SOC-Home-Lab  Laboratorio-Analisis-Phishing  SOC-Lab-Enumeration-Mitigation</div>
      <div class="term-line">Escribe <span class="term-warn">help</span> para ver los comandos disponibles.</div>
    `;
    skipBtn.style.display = 'none';
    input.disabled = false;
    input.focus();
  });

  // Manejo de comandos manuales
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim().toLowerCase();
      if (!cmd) return;

      printLine(`<span class="term-prompt">${promptStr}</span> ${cmd}`);
      input.value = '';

      switch (cmd) {
        case 'help':
          printLine(`Comandos disponibles:
- whoami: Muestra mi nombre.
- skills: Lista mis habilidades técnicas.
- projects: Muestra mis laboratorios.
- github: Abre mi perfil de GitHub.
- contact: Muestra mi correo.
- clear: Limpia la pantalla.`);
          break;
        case 'whoami':
          printLine(CONFIG.nombre);
          break;
        case 'skills':
          printLine("Wazuh, Nmap, iptables, Wireshark, Linux, análisis de phishing.");
          break;
        case 'projects':
          printLine("SOC-Home-Lab, Laboratorio-Analisis-Phishing, SOC-Lab-Enumeration-Mitigation.");
          break;
        case 'github':
          printLine(`Abriendo GitHub...`);
          window.open(`https://github.com/${CONFIG.githubUser}`, '_blank', 'noopener,noreferrer');
          break;
        case 'contact':
          printLine(`Correo: ${CONFIG.email}`);
          break;
        case 'clear':
          output.innerHTML = '';
          break;
        default:
          printLine(`<span class="term-warn">Comando no reconocido: ${cmd}. Escribe 'help' para ayuda.</span>`);
      }
    }
  });
}