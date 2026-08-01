const grid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');

let debounceTimer;

async function loadCategories() {
  try {
    const { categories } = await api('/products/categories');
    categorySelect.innerHTML = '<option value="">All Categories</option>' +
      categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  } catch (e) { /* ignore */ }
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (categorySelect.value) params.set('category', categorySelect.value);

  grid.innerHTML = '<p>Loading products...</p>';

  try {
    const { products } = await api(`/products?${params.toString()}`);
    if (products.length === 0) {
      grid.innerHTML = '<div class="empty-state">No products match your search.</div>';
      return;
    }
    grid.innerHTML = products.map(productCard).join('');
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">Failed to load products: ${escapeHtml(e.message)}</div>`;
  }
}

function productCard(p) {
  return `
    <a class="product-card" href="/product.html?id=${p.id}">
      <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">
      <div class="product-card-body">
        <span class="category-tag">${escapeHtml(p.category)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <span class="price">${formatPrice(p.price)}</span>
        <span class="stock-note">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
      </div>
    </a>
  `;
}

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 300);
});
categorySelect.addEventListener('change', loadProducts);

loadCategories();
loadProducts();
