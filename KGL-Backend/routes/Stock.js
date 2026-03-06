const express = require('express');
const router = express.Router();
const Produce = require('../models/Produce');
const { protect, authorize } = require('../middleware/auth');

// GET: View all stock (Used by Sales Agents and Managers)
router.get('/all', protect, authorize('Sales Agent', 'Manager', 'Director'), async (req, res) => {
  try {
    const stock = await Produce.find();
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: View stock for a specific branch
router.get('/branch/:branchName', protect, authorize('Sales Agent', 'Manager', 'Director'), async (req, res) => {
  try {
    const requestedBranch = req.params.branchName;
    const branchFilter =
      req.user.role === 'Director' ? requestedBranch : req.user.branch;
    const stock = await Produce.find({ branch: branchFilter });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Available stock in the logged in user's branch
router.get('/available', protect, authorize('Sales Agent', 'Manager', 'Director'), async (req, res) => {
  try {
    const branchFilter = req.user.role === 'Director' ? {} : { branch: req.user.branch };
    const stock = await Produce.find(branchFilter).select('name branch quantity quantityKg pricePerKg');
    const available = stock
      .map((item) => {
        const qty = Number(item.quantityKg > 0 ? item.quantityKg : item.quantity || 0);
        return {
          id: item._id,
          name: item.name,
          branch: item.branch,
          availableKg: qty,
          pricePerKg: item.pricePerKg || 0,
        };
      })
      .filter((item) => item.availableKg > 0);

    res.json(available);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT: Manager updates the selling price or initializes stock 
router.put('/update-price', protect, authorize('Manager'), async (req, res) => {
  try {
    const { name, pricePerKg } = req.body;
    const branch = req.user.branch;

    if (!name || !pricePerKg || Number(pricePerKg) <= 0) {
      return res.status(400).json({ error: 'name and a valid pricePerKg are required' });
    }

    const existingStock = await Produce.findOne({ name, branch });
    if (!existingStock) {
      return res.status(404).json({
        error: 'Produce not found in stock. Record procurement first.',
      });
    }

    const updatedStock = await Produce.findOneAndUpdate(
      { name, branch },
      { pricePerKg, lastUpdated: Date.now() },
      { new: true, upsert: false }
    );
    res.json({ message: "Stock price updated", data: updatedStock });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
