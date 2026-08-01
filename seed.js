const db = require('./db');
const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, description, price, image, category, stock)
    VALUES (@name, @description, @price, @image, @category, @stock)
  `);
  const products = [
    { name: 'Wireless Headphones', description: 'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.', price: 2499, image: 'https://images.unsplash.com/photo-1528017486352-b49206ec821b?w=400&h=300&fit=crop&auto=format', category: 'Electronics', stock: 25 },
    { name: 'Mechanical Keyboard', description: 'Tactile 87-key mechanical keyboard with RGB backlighting and hot-swappable switches.', price: 3299, image: 'https://images.unsplash.com/photo-1756388371735-cc845c578200?w=400&h=300&fit=crop&auto=format', category: 'Electronics', stock: 15 },
    { name: 'Smart Fitness Band', description: 'Tracks heart rate, sleep, and steps. Water resistant with a 10-day battery.', price: 1899, image: 'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?w=400&h=300&fit=crop&auto=format', category: 'Electronics', stock: 40 },
    { name: 'Canvas Backpack', description: 'Durable 25L canvas backpack with padded laptop sleeve.', price: 1499, image: 'https://images.unsplash.com/photo-1655303219938-3a771279c801?w=400&h=300&fit=crop&auto=format', category: 'Fashion', stock: 30 },
    { name: 'Stainless Steel Bottle', description: 'Insulated 1L bottle, keeps drinks cold for 24 hours or hot for 12.', price: 699, image: 'https://images.unsplash.com/photo-1544003484-3cd181d17917?w=400&h=300&fit=crop&auto=format', category: 'Home', stock: 60 },
    { name: 'Desk Lamp', description: 'Adjustable LED desk lamp with 5 brightness levels and USB charging port.', price: 999, image: 'https://images.unsplash.com/photo-1605194004886-56d82f482d53?w=400&h=300&fit=crop&auto=format', category: 'Home', stock: 20 },
    { name: 'Running Shoes', description: 'Lightweight breathable running shoes with cushioned sole.', price: 2199, image: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=400&h=300&fit=crop&auto=format', category: 'Fashion', stock: 35 },
    { name: 'Coffee Maker', description: 'Programmable 12-cup drip coffee maker with keep-warm plate.', price: 2799, image: 'https://images.unsplash.com/photo-1607273177147-e7304c4d5d6c?w=400&h=300&fit=crop&auto=format', category: 'Home', stock: 12 },
    { name: 'Graphic Tee', description: '100% cotton crew-neck t-shirt, unisex fit.', price: 499, image: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?w=400&h=300&fit=crop&auto=format', category: 'Fashion', stock: 100 },
    { name: 'Portable Power Bank', description: '20000mAh power bank with fast charging, dual USB output.', price: 1299, image: 'https://images.unsplash.com/photo-1693155257465-f29b58ecadaa?w=400&h=300&fit=crop&auto=format', category: 'Electronics', stock: 50 },
    { name: 'Yoga Mat', description: 'Non-slip 6mm yoga mat with carrying strap.', price: 799, image: 'https://images.unsplash.com/photo-1641913640860-ab4c2bfb2bb0?w=400&h=300&fit=crop&auto=format', category: 'Sports', stock: 45 },
    { name: 'Sunglasses', description: 'UV-protected polarized sunglasses with lightweight frame.', price: 899, image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=300&fit=crop&auto=format', category: 'Fashion', stock: 55 },
  ];
  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log('Products already exist, skipping seed.');
}
