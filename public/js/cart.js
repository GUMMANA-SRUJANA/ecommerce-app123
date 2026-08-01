const cartContainer = document.getElementById('cart-container');

if (!requireAuth()) {
  // requireAuth already redirects
}

async function loadCart() {
  try {
    const { items, total } = await api('/cart');

    if (items.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-state">
          <p>Your cart is empty.</p>
          <a href="/index.html" class="btn btn-primary">Continue Shopping</a>
        </div>
      `;
      return;
    }

    cartContainer.innerHTML = `
      <div class="cart-layout">
        <div id="items-list">
          ${items.map(cartItemRow).join('')}
        </div>
        <div class="cart-summary">
          <div class="row"><span>Subtotal</span><span>${formatPrice(total)}</span></div>
          <div class="row"><span>Shipping</span><span>Free</span></div>
          <div class="row total-row"><span>Total</span><span>${formatPrice(total)}</span></div>
          <div id="checkout-alert"></div>
          <div class="form-group" style="margin-top:16px;">
            <label for="shipping-address">Shipping Address</label>
            <textarea id="shipping-address" rows="3" placeholder="Enter your full delivery address"></textarea>
          </div>
          <button class="btn btn-primary btn-block" id="checkout-btn">Place Order</button>
        </div>
      </div>
    `;

    attachCartEvents();
    document.getElementById('checkout-btn').addEventListener('click', placeOrder);
  } catch (e) {
    cartContainer.innerHTML = `<div class="empty-state">Failed to load cart: ${escapeHtml(e.message)}</div>`;
  }
}

function cartItemRow(item) {
  return `
    <div class="cart-item" data-cart-item-id="${item.cart_item_id}">
      <img src="${item.image}" alt="${escapeHtml(item.name)}">
      <div class="info">
        <h4>${escapeHtml(item.name)}</h4>
        <div class="unit-price">${formatPrice(item.price)} each</div>
      </div>
      <div class="qty-controls">
        <button class="qty-decrease" aria-label="Decrease quantity">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-increase" aria-label="Increase quantity">+</button>
      </div>
      <div class="line-total">${formatPrice(item.price * item.quantity)}</div>
      <button class="remove-btn">Remove</button>
    </div>
  `;
}

function attachCartEvents() {
  document.querySelectorAll('.cart-item').forEach(row => {
    const cartItemId = row.dataset.cartItemId;
    const qtyValue = row.querySelector('.qty-value');

    row.querySelector('.qty-increase').addEventListener('click', async () => {
      const newQty = Number(qtyValue.textContent) + 1;
      await updateQty(cartItemId, newQty);
    });

    row.querySelector('.qty-decrease').addEventListener('click', async () => {
      const newQty = Number(qtyValue.textContent) - 1;
      if (newQty < 1) return;
      await updateQty(cartItemId, newQty);
    });

    row.querySelector('.remove-btn').addEventListener('click', async () => {
      await api(`/cart/${cartItemId}`, { method: 'DELETE' });
      loadCart();
      renderNav();
    });
  });
}

async function updateQty(cartItemId, qty) {
  try {
    await api(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: qty }),
    });
    loadCart();
    renderNav();
  } catch (e) {
    alert(e.message);
  }
}

async function placeOrder() {
  const alertArea = document.getElementById('checkout-alert');
  const address = document.getElementById('shipping-address').value.trim();

  if (!address) {
    alertArea.innerHTML = `<div class="alert alert-error">Please enter a shipping address.</div>`;
    return;
  }

  try {
    const { order } = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({ shipping_address: address }),
    });
    window.location.href = `/orders.html?justPlaced=${order.id}`;
  } catch (e) {
    alertArea.innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
  }
}

loadCart();
