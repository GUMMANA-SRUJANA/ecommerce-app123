const express = require('express');
const db = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

function getCart(userId) {
  return db.prepare(`
    SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price, p.image, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.id DESC
  `).all(userId);
}

router.get('/', (req, res) => {
  const items = getCart(req.user.id);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json({ items, total });
});

router.post('/', (req, res) => {
  const { product_id, quantity } = req.body || {};
  const qty = Number(quantity) || 1;

  if (!product_id || qty < 1) {
    return res.status(400).json({ error: 'product_id and a positive quantity are required.' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (product.stock < qty) return res.status(400).json({ error: 'Not enough stock available.' });

  const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, product_id);

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?')
      .run(existing.quantity + qty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)')
      .run(req.user.id, product_id, qty);
  }

  res.status(201).json({ items: getCart(req.user.id) });
});

router.put('/:cartItemId', (req, res) => {
  const { quantity } = req.body || {};
  const qty = Number(quantity);

  if (!qty || qty < 1) {
    return res.status(400).json({ error: 'A positive quantity is required.' });
  }

  const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?')
    .get(req.params.cartItemId, req.user.id);
  if (!item) return res.status(404).json({ error: 'Cart item not found.' });

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(qty, item.id);
  res.json({ items: getCart(req.user.id) });
});

router.delete('/:cartItemId', (req, res) => {
  const result = db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?')
    .run(req.params.cartItemId, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Cart item not found.' });
  res.json({ items: getCart(req.user.id) });
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ items: [] });
});

module.exports = router;
