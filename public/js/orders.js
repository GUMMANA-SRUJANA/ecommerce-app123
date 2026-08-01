const ordersContainer = document.getElementById('orders-container');
const STATUS_FLOW = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

if (!requireAuth()) { /* redirected */ }

async function loadOrders() {
  try {
    const { orders } = await api('/orders');

    if (orders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-state">
          <p>You haven't placed any orders yet.</p>
          <a href="/index.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = orders.map(orderCard).join('');

    document.querySelectorAll('.advance-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await api(`/orders/${btn.dataset.orderId}/advance`, { method: 'POST' });
        loadOrders();
      });
    });
  } catch (e) {
    ordersContainer.innerHTML = `<div class="empty-state">Failed to load orders: ${escapeHtml(e.message)}</div>`;
  }
}

function orderCard(order) {
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const isDelivered = order.status === 'Delivered';
  const placedDate = new Date(order.created_at + 'Z').toLocaleString();

  return `
    <div class="order-card">
      <div class="order-top">
        <div>
          <div class="order-id">Order #${order.id}</div>
          <div style="font-size:0.8rem; color:var(--ink-soft);">Placed ${placedDate}</div>
        </div>
        <span class="status-pill ${isDelivered ? 'delivered' : ''}">${order.status}</span>
      </div>

      <div class="tracker">
        ${STATUS_FLOW.map((step, i) => `
          <div class="step ${i <= currentIndex ? 'done' : ''}">
            <div class="dot"></div>
            <div>${step}</div>
          </div>
        `).join('')}
      </div>

      <div class="order-items-list">
        ${order.items.map(i => `<div>${i.quantity} × ${escapeHtml(i.product_name)} — ${formatPrice(i.price * i.quantity)}</div>`).join('')}
        <div style="margin-top:8px; font-weight:700; color:var(--ink);">Total: ${formatPrice(order.total)}</div>
        <div style="margin-top:4px;">Shipping to: ${escapeHtml(order.shipping_address)}</div>
      </div>

      ${!isDelivered ? `
        <button class="btn btn-outline advance-btn" data-order-id="${order.id}" style="margin-top:14px;">
          Simulate: Advance to "${STATUS_FLOW[currentIndex + 1]}"
        </button>
      ` : ''}
    </div>
  `;
}

loadOrders();
