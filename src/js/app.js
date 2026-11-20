/**
 * WLC.IA Smart POS - Core Application Logic
 */

// Simulação de banco de dados local
window.wlcDb = {
  data: JSON.parse(localStorage.getItem('wlc_pos_db') || '{}'),
  
  collection(name) {
    if (!this.data[name]) this.data[name] = [];
    return {
      create: (item) => {
        const entry = { ...item, id: Date.now(), createdAt: new Date().toISOString() };
        this.data[name].unshift(entry);
        this.save();
        return entry;
      },
      list: () => [...this.data[name]]
    };
  },
  
  save() {
    localStorage.setItem('wlc_pos_db', JSON.stringify(this.data));
  }
};

// Navegação SPA
const routes = {
  '#dashboard': 'Dashboard Content',
  '#pdv': 'PDV Content',
  '#produtos': 'Produtos Content'
};

function navigate() {
  const hash = window.location.hash || '#dashboard';
  const container = document.getElementById('app-main');
  
  // Renderização simples das views
  if (routes[hash]) {
    container.innerHTML = `<h1>${hash.replace('#', '').toUpperCase()}</h1><div class="view-content">${routes[hash]}</div>`;
  } else {
    container.innerHTML = `<h1>404</h1><p>Página não encontrada.</p>`;
  }
  
  // Atualiza estado visual da sidebar
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
}

window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);
