const db = require('./db');

const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, description, price, image, category, stock)
    VALUES (@name, @description, @price, @image, @category, @stock)
  `);

  const products = [
    { name: 'Wireless Headphones', description: 'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.', price: 2499, image: 'https://picsum.photos/seed/headphones/400/300', category: 'Electronics', stock: 25 },
    { name: 'Mechanical Keyboard', description: 'Tactile 87-key mechanical keyboard with RGB backlighting and hot-swappable switches.', price: 3299, image: 'https://picsum.photos/seed/keyboard/400/300', category: 'Electronics', stock: 15 },
    { name: 'Smart Fitness Band', description: 'Tracks heart rate, sleep, and steps. Water resistant with a 10-day battery.', price: 1899, image: 'https://picsum.photos/seed/fitband/400/300', category: 'Electronics', stock: 40 },
    { name: 'Canvas Backpack', description: 'Durable 25L canvas backpack with padded laptop sleeve.', price: 1499, image: 'https://picsum.photos/seed/backpack/400/300', category: 'Fashion', stock: 30 },
    { name: 'Stainless Steel Bottle', description: 'Insulated 1L bottle, keeps drinks cold for 24 hours or hot for 12.', price: 699, image: 'https://picsum.photos/seed/bottle/400/300', category: 'Home', stock: 60 },
    { name: 'Desk Lamp', description: 'Adjustable LED desk lamp with 5 brightness levels and USB charging port.', price: 999, image: 'https://picsum.photos/seed/lamp/400/300', category: 'Home', stock: 20 },
    { name: 'Running Shoes', description: 'Lightweight breathable running shoes with cushioned sole.', price: 2199, image: 'https://picsum.photos/seed/shoes/400/300', category: 'Fashion', stock: 35 },
    { name: 'Coffee Maker', description: 'Programmable 12-cup drip coffee maker with keep-warm plate.', price: 2799, image: 'https://picsum.photos/seed/coffee/400/300', category: 'Home', stock: 12 },
    { name: 'Graphic Tee', description: '100% cotton crew-neck t-shirt, unisex fit.', price: 499, image: 'https://picsum.photos/seed/tee/400/300', category: 'Fashion', stock: 100 },
    { name: 'Portable Power Bank', description: '20000mAh power bank with fast charging, dual USB output.', price: 1299, image: 'https://picsum.photos/seed/powerbank/400/300', category: 'Electronics', stock: 50 },
    { name: 'Yoga Mat', description: 'Non-slip 6mm yoga mat with carrying strap.', price: 799, image: 'https://picsum.photos/seed/yoga/400/300', category: 'Sports', stock: 45 },
    { name: 'Sunglasses', description: 'UV-protected polarized sunglasses with lightweight frame.', price: 899, image: 'https://picsum.photos/seed/sunglasses/400/300', category: 'Fashion', stock: 55 },
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });

  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log('Products already exist, skipping seed.');
}
