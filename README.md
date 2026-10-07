# Tusundoku Society

A simple book reselling website where a seller can:
- add books/products to the catalog
- receive customer orders via email
- show their UPI ID to receive payment
- let customers browse and order books without major setup

## Features

- Product listing page
- Sell a book form to add products
- Order form for customers
- Seller email notifications using Gmail SMTP
- UPI payment display
- Responsive frontend

## Technologies

- Node.js
- Express
- Nodemailer
- HTML/CSS/JavaScript

## Setup

1. Install dependencies:
   npm install

2. Create a `.env` file based on `.env.example`:
   cp .env.example .env

3. Update your Gmail and UPI details in `.env`:
   - SELLER_EMAIL=yourgmail@gmail.com
   - SELLER_UPI=yourupi@upi
   - SMTP_USER=yourgmail@gmail.com
   - SMTP_PASS=your-google-app-password

4. Start the app:
   npm start

5. Open in browser:
   http://localhost:3000

## Gmail setup

For Gmail SMTP, use an App Password:
- Go to Google Account > Security
- Enable 2-Step Verification
- Generate an App Password
- Use that password in `SMTP_PASS`

## Notes

This project is a strong starter for a book resale marketplace and can later be expanded with:
- login and admin dashboard
- MongoDB database
- real payment gateway (Razorpay / UPI / Stripe)
- image upload support
- order status tracking
