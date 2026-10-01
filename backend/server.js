const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const productsFile = path.join(__dirname, 'products.json');
const ordersFile = path.join(__dirname, 'orders.json');

app.get('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  res.json(products);
});

app.post('/api/orders', (req, res) => {
  const { items, shipping } = req.body;
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

  if (!Array.isArray(items) || !items.length || !shipping || !Object.keys(shipping).length) {
    return res.status(400).json({ error: 'Missing items or shipping details' });
  }

  let total = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ error: 'Invalid item in order' });
    }
    total += product.price * item.quantity;
  }

  const orders = fs.existsSync(ordersFile)
    ? JSON.parse(fs.readFileSync(ordersFile, 'utf8'))
    : [];
  const order = { id: `LL-${Date.now()}`, items, shipping, total, createdAt: new Date().toISOString() };
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.status(201).json({ orderId: order.id });
});

app.listen(3000, () => console.log('API running on http://localhost:3000'));