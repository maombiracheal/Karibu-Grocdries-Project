// 1. Import Dependencies
require('dotenv').config(); // Loads variables from .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./KGL-Backend/config/database');

const path = require('path');

// 2. Import Routes
const userRoutes = require('./KGL-Backend/routes/User');
const authRoutes = require('./KGL-Backend/routes/auth');
const produceRoutes = require('./KGL-Backend/routes/Stock'); // Stock Management
const procurementRoutes = require('./KGL-Backend/routes/procurement');
const salesRoutes = require('./KGL-Backend/routes/Sales');
const creditSalesRoutes = require('./KGL-Backend/routes/creditSales');
const paymentRoutes = require('./KGL-Backend/routes/payments');
const reportRoutes = require('./KGL-Backend/routes/report');


// 3. Initialize Express
const app = express();

// 4. Connect to MongoDB
connectDB();



app.get(['/', '/login', '/login.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 5. Apply Middleware
app.use(cors()); // Allows your frontend to communicate with this backend
app.use(express.json()); // Allows the server to read JSON data from requests
app.use(express.urlencoded({ extended: false }));

// 6. Define API Endpoints
// Each business rule (Procurement, Sales, Reports) has its own dedicated path
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stock', produceRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/credit', creditSalesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);


// 7. Error Handling Middleware (Optional but recommended for better implementation)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong on the server!' });
});
//serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

// 8. Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`KGL Server is running on port ${PORT}`);
  
});
