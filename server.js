const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const productsFile = path.join(__dirname, 'data', 'products.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function readProducts() {
  if (!fs.existsSync(productsFile)) {
    fs.mkdirSync(path.dirname(productsFile), { recursive: true });
    fs.writeFileSync(productsFile, JSON.stringify([], null, 2));
  }

  const data = fs.readFileSync(productsFile, 'utf8');
  return JSON.parse(data || '[]');
}

function writeProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    sellerName: process.env.SELLER_NAME || 'Tusundoku Society',
    sellerEmail: process.env.SELLER_EMAIL || 'yourgmail@gmail.com',
    sellerUpi: process.env.SELLER_UPI || 'yourupi@upi'
  });
});

app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const {
    title,
    author,
    category,
    price,
    condition,
    image,
    description,
    stock
  } = req.body;

  if (!title || !author || !category || !price) {
    return res.status(400).json({ message: 'Please fill in the required product fields.' });
  }

  const products = readProducts();

  const newProduct = {
    id: Date.now(),
    title: String(title).trim(),
    author: String(author).trim(),
    category: String(category).trim(),
    price: Number(price),
    condition: condition || 'Good',
    image: image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    description: description || 'A book available for resale.',
    stock: Number(stock) || 1
  };

  products.unshift(newProduct);
  writeProducts(products);

  res.status(201).json({
    message: 'Product added successfully.',
    product: newProduct
  });
});

app.post('/api/orders', async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    productId,
    quantity,
    paymentMethod,
    upiId
  } = req.body;

  if (!customerName || !customerPhone || !customerAddress || !productId) {
    return res.status(400).json({ message: 'Please provide your full order details.' });
  }

  const products = readProducts();
  const selectedProduct = products.find((product) => String(product.id) === String(productId));

  if (!selectedProduct) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const qty = Number(quantity) || 1;
  const total = Number(selectedProduct.price) * qty;

  const orderSummary = `
New Book Order Received
-----------------------
Customer Name: ${customerName}
Phone: ${customerPhone}
Address: ${customerAddress}
Product: ${selectedProduct.title} by ${selectedProduct.author}
Quantity: ${qty}
Total: ₹${total}
Payment Method: ${paymentMethod || 'UPI'}
UPI ID: ${upiId || process.env.SELLER_UPI || 'Not provided'}
  `;

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: '"' + (process.env.SELLER_NAME || 'Tusundoku Society') + '" <' + (process.env.SELLER_EMAIL || 'yourgmail@gmail.com') + '>',
        to: process.env.SELLER_EMAIL || 'yourgmail@gmail.com',
        subject: `New order: ${selectedProduct.title}`,
        text: orderSummary
      });
    }

    res.json({
      message: 'Order placed successfully. The seller has been notified by email.',
      total,
      productTitle: selectedProduct.title
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({
      message: 'Order placed, but email notification failed. Please check your Gmail setup.'
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Tusundoku Society is running on http://localhost:${PORT}`);
});
