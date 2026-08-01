const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

// Simple linear status progression used to simulate order tracking
const STATUS_FLOW = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

router.post('/', (req, res) => {
  const { shipping_address } = req.body || {};

  if (!shipping_address || !shipping_address.trim()) {
    return res.status(400).json({ error: 'Shipping address is required.' });
  }

  const cartItems = db.prepare(`
    SELECT ci.*, p.name AS product_name, p.price, p.stock
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
  `).all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({ error: `Not enough stock for ${item.product_name}.` });
    }
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = db.transaction(() => {
    const orderInfo = db.prepare(
      'INSERT INTO orders (user_id, total, status, shipping_address) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, total, 'Placed', shipping_address.trim());

    const orderId = orderInfo.lastInsertRowid;

    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)'
    );
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.product_name, item.price, item.quantity);
      updateStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    return orderId;
  });

  const orderId = placeOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

  res.status(201).json({ order: { ...order, items } });
});

router.get('/', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  const withItems = orders.map(o => ({
    ...o,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id),
  }));
  res.json({ orders: withItems });
});

router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...order, items }, status_flow: STATUS_FLOW });
});

// Simulates progressing an order to the next status (stand-in for real fulfillment/shipping updates)
router.post('/:id/advance', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) {
    return res.json({ order: { ...order, items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) } });
  }

  const nextStatus = STATUS_FLOW[currentIndex + 1];
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(nextStatus, order.id);

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...updated, items } });
});

module.exports = router;
