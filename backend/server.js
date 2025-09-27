
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const products = require('../shared/products.json');

// In-memory \"DB\" for orders/age checks (demo)
let ORDERS = [];
let AGE_CHECKS = [];
let PAYMENTS = [];

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.post('/api/orders', (req, res) => {
  const { channel = 'STOREFRONT', items = [], customer = null, fulfillment = 'PICKUP' } = req.body || {};
  const id = `ORD-${Math.floor(Math.random()*1e6)}`;
  const total = items.reduce((s, l) => {
    const p = products.find(p => p.id === l.productId);
    return s + (p ? (p.mrp * (1 + p.taxRate) * l.qty) : 0);
  }, 0);
  const order = { id, channel, items, customer, fulfillment, status: 'OPEN', totals: { grand_total: total } };
  ORDERS.push(order);
  res.status(201).json(order);
});

app.post('/api/age-checks', (req, res) => {
  const { orderId, idType = 'DRIVING_LICENSE', passed = true, staff = 'cashier1' } = req.body || {};
  const rec = { orderId, idType, passed, staff, checked_at: new Date().toISOString() };
  AGE_CHECKS.push(rec);
  res.status(201).json(rec);
});

app.post('/api/payments', (req, res) => {
  const { orderId, method = 'UPI', amount = 0, external_ref = '' } = req.body || {};
  const p = { orderId, method, amount, external_ref, received_at: new Date().toISOString() };
  PAYMENTS.push(p);
  res.status(201).json(p);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));
