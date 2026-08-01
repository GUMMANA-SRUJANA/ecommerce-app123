# CornerStore — Full-Stack E-Commerce App

A functional online store built with **Express.js** (Node.js) on the backend and **vanilla HTML/CSS/JavaScript** on the frontend, using **SQLite** for storage.

## Features

- **Product listing & details** — browse, search, and filter by category; full product detail pages
- **Shopping cart** — add/update/remove items, per-user persistent cart
- **User login & registration** — JWT-based auth with hashed passwords (bcrypt)
- **Order placement & tracking** — checkout with shipping address, stock deduction, order history, and a visual status tracker (Placed → Processing → Shipped → Out for Delivery → Delivered)
- **Database** — SQLite tables for users, products, cart items, orders, and order items

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | SQLite (via `better-sqlite3`) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing |
| Frontend | Plain HTML, CSS, JavaScript (no framework/build step) |

## Project Structure

```
ecommerce-app/
├── server.js              # Express app entry point
├── db.js                  # SQLite connection + schema
├── seed.js                # Seeds 12 sample products on first run
├── middleware/
│   └── auth.js             # JWT verification middleware
├── routes/
│   ├── auth.js              # /api/auth  (register, login, me)
│   ├── products.js          # /api/products (list, filter, detail)
│   ├── cart.js               # /api/cart (get, add, update, remove)
│   └── orders.js             # /api/orders (place, list, detail, advance)
├── public/                 # Frontend (served statically)
│   ├── index.html            # Product listing / search / filter
│   ├── product.html          # Product detail page
│   ├── login.html / register.html
│   ├── cart.html             # Cart + checkout
│   ├── orders.html           # Order history + tracking
│   ├── css/style.css
│   └── js/                   # api.js (shared helper), main.js, product.js, auth.js, cart.js, orders.js
└── data/store.db           # SQLite database file (auto-created)
```

## Setup & Run

**Requirements:** Node.js 18+

```bash
cd ecommerce-app
npm install
npm start
```

The app will be available at **http://localhost:3000**. On first run it automatically creates the SQLite database and seeds it with 12 sample products.

To use a different port:

```bash
PORT=4000 npm start
```

## How It Works

1. **Register / Login** — Create an account on `/register.html`. Passwords are hashed with bcrypt; a JWT is issued and stored in `localStorage`, sent as a `Bearer` token on every authenticated API call.
2. **Browse products** — `/index.html` lists all products with live search and category filtering. Click any product for full details.
3. **Add to cart** — Requires login. Cart is stored server-side per user, so it persists across sessions/devices.
4. **Checkout** — On `/cart.html`, enter a shipping address and place the order. This deducts stock, records order + order line items, and clears the cart in a single database transaction (so it can't leave inconsistent state).
5. **Track orders** — `/orders.html` lists all past orders with a visual progress tracker. Since there's no real fulfillment backend, an "Advance status" button lets you simulate the order moving through Placed → Processing → Shipped → Out for Delivery → Delivered.

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account, returns JWT |
| POST | `/api/auth/login` | No | Log in, returns JWT |
| GET | `/api/auth/me` | Yes | Current user info |
| GET | `/api/products` | No | List products (`?search=&category=`) |
| GET | `/api/products/categories` | No | Distinct category list |
| GET | `/api/products/:id` | No | Single product |
| GET | `/api/cart` | Yes | View cart |
| POST | `/api/cart` | Yes | Add item (`product_id`, `quantity`) |
| PUT | `/api/cart/:cartItemId` | Yes | Update quantity |
| DELETE | `/api/cart/:cartItemId` | Yes | Remove item |
| POST | `/api/orders` | Yes | Place order (`shipping_address`) |
| GET | `/api/orders` | Yes | List my orders |
| GET | `/api/orders/:id` | Yes | Order detail |
| POST | `/api/orders/:id/advance` | Yes | Simulate next tracking status |

## Notes on Production Readiness

This is a fully working demo/learning app. Before shipping it for real use, you'd want to:

- Move `JWT_SECRET` in `middleware/auth.js` to an environment variable (a placeholder default is currently used)
- Add a real payment gateway integration instead of "Place Order" directly confirming
- Replace the `advance` simulation endpoint with real fulfillment/shipping webhook updates
- Add rate limiting, input sanitization hardening, and HTTPS in front of the app
- Swap SQLite for Postgres/MySQL if you expect concurrent write-heavy traffic at scale
