import { CONFIG } from './config.js';

export async function initGitHub() {
  const grid = document.getElementById('projects-grid');
  const otherReposGrid = document.getElementById('other-repos-grid');
  const timeline = document.getElementById('activity-timeline');
  
  if (!grid) return;

  try {
    const response = await fetch(`https://api.github.com/users/${CONFIG.githubUser}/repos?per_page=100&sort=pushed`);
    if (!response.ok) throw new Error('Error al conectar con GitHub');
    const repos = await response.json();

    const jsonResponse = await fetch('./data/projects.json');
    const projectsData = await jsonResponse.json();

    grid.innerHTML = '';
    otherReposGrid.innerHTML = '';
    if (timeline) timeline.innerHTML = '';

    const curatedRepos = [];
    const otherRepos = [];

    repos.forEach(repo => {
      if (CONFIG.reposOcultos.includes(repo.name) || repo.fork) return;
      if (CONFIG.reposCurados.includes(repo.name)) curatedRepos.push(repo);
      else otherRepos.push(repo);
    });

    const sortedCurated = CONFIG.reposCurados.map(name => curatedRepos.find(r => r.name === name)).filter(Boolean);

    // Renderizar proyectos y buscar sus commits
    sortedCurated.forEach(async repo => {
      const meta = projectsData[repo.name] || {};
      const card = createProjectCard(repo, meta);
      grid.appendChild(card);

      // Cargar actividad (últimos 3 commits por repo)
      if (timeline) {
        try {
          const commitRes = await fetch(`https://api.github.com/repos/${CONFIG.githubUser}/${repo.name}/commits?per_page=3`);
          if (commitRes.ok) {
            const commits = await commitRes.json();
            commits.forEach(c => {
              const date = new Date(c.commit.author.date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
              const div = document.createElement('div');
              div.className = 'commit-item';
              div.innerHTML = `
                <p class="commit-msg">${c.commit.message}</p>
                <div class="commit-meta">
                  <span><i data-lucide="git-commit" class="icon-sm"></i> ${repo.name}</span>
                  <span>${date}</span>
                </div>
              `;
              timeline.appendChild(div);
            });
          }
        } catch (e) { console.error("Error commits", e); }
      }
    });

    // Otros repos
    if (otherRepos.length > 0) {
      otherRepos.slice(0, 6).forEach(repo => {
        otherReposGrid.appendChild(createOtherRepoCard(repo));
      });
    } else {
      document.querySelector('.other-repos-section').style.display = 'none';
    }

    // Actualizar métrica de repos
    const metricRepos = document.getElementById('metric-repos');
    if (metricRepos) {
      metricRepos.textContent = repos.length;
      metricRepos.dataset.count = repos.length;
    }

    // Iniciar Filtros
    initFilters();
    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (error) {
    console.error("Fallo al cargar GitHub:", error);
    grid.innerHTML = `<p class="error-msg" style="color:var(--warning)">No se pudieron cargar los proyectos en vivo. Revisa tu conexión.</p>`;
  }

  setupDrawer();
}

function initFilters() {
  const filterBtns = document.querySelectorAll('.chip-filter');
  const cards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === 'todo' || card.dataset.tags.includes(filter)) {
          card.classList.remove('is-dimmed');
        } else {
          card.classList.add('is-dimmed');
        }
      });
    });
  });
}

function createProjectCard(repo, meta) {
  const article = document.createElement('article');
  article.className = 'project-card';
  article.dataset.tags = meta.filtros ? meta.filtros.join(' ') : 'all';

  const title = meta.titulo || repo.name;
  const desc = meta.descripcion || repo.description || 'Sin descripción.';
  const updatedDate = new Date(repo.pushed_at).toLocaleDateString('es-CL', { month: 'short', day: 'numeric', year: 'numeric' });

  article.innerHTML = `
    <div class="project-header">
      <h3 class="project-title">${title}</h3>
    </div>
    <p class="project-desc">${desc}</p>
    <div class="project-meta">
      ${meta.tags ? meta.tags.map(t => `<span class="tag tag-blue">${t}</span>`).join('') : ''}
    </div>
    <div class="project-stats">
      <span><i data-lucide="star" class="icon-sm"></i> ${repo.stargazers_count}</span>
      <span><i data-lucide="clock" class="icon-sm"></i> ${updatedDate}</span>
    </div>
    <div class="project-actions">
      <button class="btn btn-primary btn-sm open-drawer-btn" data-repo="${repo.name}">Ver informe</button>
      <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">GitHub</a>
    </div>
  `;
  return article;
}

function createOtherRepoCard(repo) {
  const div = document.createElement('div');
  div.className = 'other-repo-card';
  div.innerHTML = `
    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
      <i data-lucide="folder-git-2" class="icon-sm"></i> ${repo.name}
    </a>
    <span class="tag">${repo.language || 'N/A'}</span>
  `;
  return div;
}

function setupDrawer() {
  const drawer = document.getElementById('project-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('drawer-close');
  const titleEl = document.getElementById('drawer-title');
  const panelReport = document.getElementById('panel-report');
  const panelReadme = document.getElementById('panel-readme');
  const tabReport = document.getElementById('tab-report');
  const tabReadme = document.getElementById('tab-readme');
  
  if (!drawer) return;

  function openDrawer() { drawer.classList.add('is-open'); overlay.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); }
  function closeDrawer() { drawer.classList.remove('is-open'); overlay.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  if (tabReport && tabReadme) {
    tabReport.addEventListener('click', () => {
      tabReport.classList.add('is-active'); tabReadme.classList.remove('is-active');
      tabReport.setAttribute('aria-selected', 'true'); tabReadme.setAttribute('aria-selected', 'false');
      panelReport.classList.remove('is-hidden'); panelReadme.classList.add('is-hidden');
    });
    tabReadme.addEventListener('click', () => {
      tabReadme.classList.add('is-active'); tabReport.classList.remove('is-active');
      tabReadme.setAttribute('aria-selected', 'true'); tabReport.setAttribute('aria-selected', 'false');
      panelReadme.classList.remove('is-hidden'); panelReport.classList.add('is-hidden');
    });
  }

  document.getElementById('projects-grid').addEventListener('click', async (e) => {
    if (e.target.classList.contains('open-drawer-btn')) {
      const repoName = e.target.dataset.repo;
      if(tabReport) tabReport.click();
      
      try {
        const res = await fetch('./data/projects.json');
        const data = await res.json();
        const meta = data[repoName];
        titleEl.textContent = meta ? meta.titulo : repoName;
        
        if (meta && meta.informe) {
          const inf = meta.informe;
          panelReport.innerHTML = `
            <div class="report-section"><h3>Resumen</h3><p>${inf.resumen}</p></div>
            <div class="report-section"><h3>Alcance</h3><p>${inf.alcance}</p></div>
            <div class="report-section"><h3>Metodología</h3><p>${inf.metodologia}</p></div>
            <div class="report-section"><h3>Hallazgos</h3><ul>${inf.hallazgos.map(h => `<li>${h}</li>`).join('')}</ul></div>
            <div class="report-section"><h3>Respuesta / Mitigación</h3><p>${inf.respuesta}</p></div>
            <div class="report-section"><h3>Marcos aplicados</h3><p>${inf.marcos}</p></div>
            <div class="report-section"><h3>Aprendizajes</h3><p>${inf.aprendizajes}</p></div>
          `;
        } else {
          panelReport.innerHTML = `<p>No hay informe detallado para este proyecto.</p>`;
        }
      } catch (err) {
        panelReport.innerHTML = `<p>Error al cargar el informe.</p>`;
      }

      panelReadme.innerHTML = `<p>Cargando README...</p>`;
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${CONFIG.githubUser}/${repoName}/readme`, {
          headers: { 'Accept': 'application/vnd.github.raw+json' }
        });
        if (readmeRes.ok) {
          const rawMarkdown = await readmeRes.text();
          if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
            panelReadme.innerHTML = DOMPurify.sanitize(marked.parse(rawMarkdown));
          } else {
            panelReadme.textContent = rawMarkdown;
          }
        } else {
          panelReadme.innerHTML = `<p>No se encontró README en este repositorio.</p>`;
        }
      } catch (err) {
        panelReadme.innerHTML = `<p>Error al cargar el README.</p>`;
      }

      openDrawer();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });
}