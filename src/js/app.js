/**
 * WLC.IA Smart POS - Core Application Logic
 */

// Simulação de banco de dados local com persistência em localStorage
window.wlcDb = {
  data: JSON.parse(localStorage.getItem('wlc_pos_db') || '{"products":[{"id":1,"name":"Café Expresso","sku":"CAFE01","price":6.50,"stock":50},{"id":2,"name":"Pão de Queijo","sku":"PAO01","price":5.00,"stock":30}],"sales":[]}'),
  
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

// Navegação SPA e Views completas
function renderDashboard() {
  const products = window.wlcDb.collection('products').list();
  const sales = window.wlcDb.collection('sales').list();
  
  const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0);
  const totalSalesCount = sales.length;
  const totalStockItems = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);

  return `
    <div style=\"display: flex; flex-direction: column; gap: var(--space-24);\">
      <div>
        <h2 style=\"font-size: 1.8rem; font-weight: 700; color: var(--color-text);\">Dashboard Executivo</h2>
        <p style=\"color: var(--color-text-muted);\">Visão geral em tempo real da operação comercial.</p>
      </div>

      <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-16);\">
        <div style=\"background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-24);\">
          <span style=\"font-size: 0.875rem; color: var(--color-text-muted);\">Faturamento Total</span>
          <h3 style=\"font-size: 2rem; font-weight: 700; margin-top: var(--space-8); color: var(--color-success);\">R$ ${totalRevenue.toFixed(2)}</h3>
        </div>
        <div style=\"background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-24);\">
          <span style=\"font-size: 0.875rem; color: var(--color-text-muted);\">Vendas Realizadas</span>
          <h3 style=\"font-size: 2rem; font-weight: 700; margin-top: var(--space-8); color: var(--color-accent);\">${totalSalesCount}</h3>
        </div>
        <div style=\"background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-24);\">
          <span style=\"font-size: 0.875rem; color: var(--color-text-muted);\">Itens no Estoque</span>
          <h3 style=\"font-size: 2rem; font-weight: 700; margin-top: var(--space-8); color: var(--color-text);\">${totalStockItems}</h3>
        </div>
      </div>
    </div>
  `;
}

function renderPDV() {
  const products = window.wlcDb.collection('products').list();
  
  return `
    <div style=\"display: flex; flex-direction: column; gap: var(--space-24);\">\n      <div>
        <h2 style=\"font-size: 1.8rem; font-weight: 700; color: var(--color-text);\">Ponto de Venda (PDV)</h2>
        <p style=\"color: var(--color-text-muted);\">Caixa rápido e intuitivo para atendimento.</p>
      </div>

      <div style=\"display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-24);\">\n        <div style=\"background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-24); min-height: 400px;\">
          <h3 style=\"margin-bottom: var(--space-16);\">Produtos Disponíveis</h3>
          <div style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-12);\">
            ${products.map(p => `
              <div onclick=\"addToCart(${p.id})\" style=\"border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-12); cursor: pointer; background: var(--bg-main);\">
                <div style=\"font-weight: 600;\">${p.name}</div>
                <div style=\"color: var(--color-success); font-size: 0.9rem; margin-top: 4px;\">R$ ${p.price.toFixed(2)}</div>
                <div style=\"color: var(--color-text-muted); font-size: 0.75rem;\">Estoque: ${p.stock}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style=\"background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-24); display: flex; flex-direction: column; justify-content: space-between;\">
          <div>
            <h3 style=\"margin-bottom: var(--space-16);\">Carrinho Atual</h3>
            <div id=\"cart-items\" style=\"min-height: 200px; color: var(--color-text-muted); font-size: 0.9rem;\">
              Nenhum item adicionado.
            </div>
          </div>
          <div style=\"border-top: 1px solid var(--border); padding-top: var(--space-16); margin-top: var(--space-16);\">\n            <div style=\"display: flex; justify-content: space-between; font-weight: 700; font-size: 1.2rem; margin-bottom: var(--space-16);\">\n              <span>Total:</span>
              <span id=\"cart-total\">R$ 0,00</span>
            </div>
            <button onclick=\"checkout()\" style=\"width: 100%; background: var(--color-success); color: white; border: none; padding: var(--space-12); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;\">Finalizar Venda (Pix/Dinheiro)</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProdutos() {
  const products = window.wlcDb.collection('products').list();
  
  return `
    <div style=\"display: flex; flex-direction: column; gap: var(--space-24);\">\n      <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n        <div>
          <h2 style=\"font-size: 1.8rem; font-weight: 700; color: var(--color-text);\">Gestão de Produtos</h2>
          <p style=\"color: var(--color-text-muted);\">Cadastro e controle de inventário.</p>
        </div>
      </div>

      <div style=\"background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-24);\">\n        <table style=\"width: 100%; border-collapse: collapse; text-align: left;\">\n          <thead>
            <tr style=\"border-bottom: 1px solid var(--border); color: var(--color-text-muted);\">\n              <th style=\"padding: var(--space-12);\">SKU</th>\n              <th style=\"padding: var(--space-12);\">Nome</th>\n              <th style=\"padding: var(--space-12);\">Preço</th>\n              <th style=\"padding: var(--space-12);\">Estoque</th>\n            </tr>\n          </thead>
          <tbody>
            ${products.map(p => `
              <tr style=\"border-bottom: 1px solid var(--border);\">\n                <td style=\"padding: var(--space-12);\">${p.sku}</td>\n                <td style=\"padding: var(--space-12); font-weight: 600;\">${p.name}</td>\n                <td style=\"padding: var(--space-12); color: var(--color-success);\">R$ ${p.price.toFixed(2)}</td>\n                <td style=\"padding: var(--space-12);\">${p.stock}</td>\n              </tr>\n            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Funções auxiliares globais para interatividade do PDV
window.cart = [];

window.addToCart = function(productId) {
  const products = window.wlcDb.collection('products').list();
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const existing = window.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    window.cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
};

function updateCartUI() {
  const cartContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  if (!cartContainer || !cartTotal) return;
  
  if (window.cart.length === 0) {
    cartContainer.innerHTML = 'Nenhum item adicionado.';
    cartTotal.innerText = 'R$ 0,00';
    return;
  }
  
  let total = 0;
  cartContainer.innerHTML = window.cart.map(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    return `<div style=\"display: flex; justify-content: space-between; margin-bottom: 8px;\"><span>${item.name} (x${item.qty})</span><span>R$ ${subtotal.toFixed(2)}</span></div>`;
  }).join('');
  
  cartTotal.innerText = `R$ ${total.toFixed(2)}`;
}

window.checkout = function() {
  if (window.cart.length === 0) {
    alert('O carrinho está vazio.');
    return;
  }
  
  const total = window.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  window.wlcDb.collection('sales').create({
    items: [...window.cart],
    total,
    paymentMethod: 'Dinheiro/Pix'
  });
  
  window.cart = [];
  updateCartUI();
  alert('Venda finalizada com sucesso!');
  navigate();
};

// Roteador SPA
const routes = {
  '#dashboard': renderDashboard,
  '#pdv': renderPDV,
  '#produtos': renderProdutos
};

function navigate() {
  const hash = window.location.hash || '#dashboard';
  const container = document.getElementById('app-main');
  
  if (routes[hash]) {
    container.innerHTML = routes[hash]();
    if (hash === '#pdv') {
      updateCartUI();
    }
  } else {
    container.innerHTML = `<h1>404</h1><p>Página não encontrada.</p>`;
  }
  
  document.querySelectorAll('aside nav a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
}

window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);
