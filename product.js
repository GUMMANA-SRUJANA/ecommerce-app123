const container = document.getElementById('product-detail-container');
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

async function loadProduct() {
  if (!productId) {
    container.innerHTML = '<div class="empty-state">No product specified.</div>';
    return;
  }

  try {
    const { product } = await api(`/products/${productId}`);
    document.title = `${product.name} — CornerStore`;

    container.innerHTML = `
      <div class="product-detail">
        <img src="${product.image}" alt="${escapeHtml(product.name)}">
        <div>
          <span class="category-tag">${escapeHtml(product.category)}</span>
          <h1>${escapeHtml(product.name)}</h1>
          <div class="price">${formatPrice(product.price)}</div>
          <p class="desc">${escapeHtml(product.description || '')}</p>
          <p class="stock-note">${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
          <div id="alert-area"></div>
          <div class="qty-row">
            <label for="qty-input">Qty</label>
            <input type="number" id="qty-input" value="1" min="1" max="${product.stock}">
          </div>
          <button class="btn btn-primary" id="add-to-cart-btn" ${product.stock === 0 ? 'disabled' : ''}>
            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('add-to-cart-btn')?.addEventListener('click', () => addToCart(product));
  } catch (e) {
    container.innerHTML = `<div class="empty-state">Failed to load product: ${escapeHtml(e.message)}</div>`;
  }
}

async function addToCart(product) {
  const alertArea = document.getElementById('alert-area');
  const qty = Number(document.getElementById('qty-input').value) || 1;

  if (!getToken()) {
    window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  try {
    await api('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: product.id, quantity: qty }),
    });
    alertArea.innerHTML = `<div class="alert alert-success">Added to cart!</div>`;
    renderNav();
  } catch (e) {
    alertArea.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}

loadProduct();
