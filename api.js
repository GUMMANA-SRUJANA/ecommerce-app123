const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}

function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Renders the shared header/nav on every page
async function renderNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const user = getUser();
  let cartCount = 0;

  if (user) {
    try {
      const { items } = await api('/cart');
      cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
    } catch (e) { /* ignore */ }
  }

  nav.innerHTML = `
    <a href="/index.html">Shop</a>
    ${user ? `
      <a href="/orders.html">My Orders</a>
      <a href="/cart.html">Cart${cartCount ? `<span class="cart-badge">${cartCount}</span>` : ''}</a>
      <span style="color:var(--ink-soft); font-size:0.9rem;">Hi, ${escapeHtml(user.name.split(' ')[0])}</span>
      <button class="link-btn" id="logout-btn">Logout</button>
    ` : `
      <a href="/login.html">Login</a>
      <a href="/register.html" class="btn btn-primary" style="padding:8px 16px;">Sign Up</a>
    `}
  `;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = '/index.html';
    });
  }
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname)}`;
    return false;
  }
  return true;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', renderNav);
