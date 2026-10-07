const productList = document.getElementById('product-list');
const productSelect = document.getElementById('productSelect');
const sellerUpi = document.getElementById('sellerUpi');
const sellerEmail = document.getElementById('sellerEmail');
const payUpi = document.getElementById('payUpi');

async function loadConfig() {
  const res = await fetch('/api/config');
  const config = await res.json();

  sellerUpi.textContent = config.sellerUpi;
  sellerEmail.textContent = config.sellerEmail;
  payUpi.textContent = config.sellerUpi;
}

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();

  productList.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.title}" />
          <div class="product-body">
            <h3>${product.title}</h3>
            <p>${product.author}</p>
            <div class="price-row">
              <span>₹${product.price}</span>
              <span>${product.condition}</span>
            </div>
            <p>${product.description}</p>
            <button type="button" data-id="${product.id}">Buy Now</button>
          </div>
        </article>
      `
    )
    .join('');

  productSelect.innerHTML = '<option value="">Select a book</option>' +
    products
      .map(
        (product) => `<option value="${product.id}">${product.title} - ₹${product.price}</option>`
      )
      .join('');

  const buyButtons = document.querySelectorAll('[data-id]');
  buyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedProductId = button.getAttribute('data-id');
      productSelect.value = selectedProductId;
      document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

document.getElementById('sell-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries());

  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  alert(result.message || 'Product added successfully.');
  event.target.reset();
  loadProducts();
});

document.getElementById('order-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const productId = productSelect.value;
  if (!productId) {
    alert('Please select a book before ordering.');
    return;
  }

  const body = {
    customerName: document.getElementById('customerName').value,
    customerPhone: document.getElementById('customerPhone').value,
    customerAddress: document.getElementById('customerAddress').value,
    productId,
    quantity: document.getElementById('quantity').value,
    paymentMethod: document.getElementById('paymentMethod').value,
    upiId: sellerUpi.textContent
  };

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();
  alert(result.message || 'Order placed successfully.');
  event.target.reset();
});

(async function init() {
  await loadConfig();
  await loadProducts();
})();
