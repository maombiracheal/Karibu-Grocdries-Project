const express = require('express');
const router = express.Router();
const CreditSale = require('../models/CreditSale');
const Produce = require('../models/Produce');

// POST: Record a Credit Sale
router.post('/add-credit', async (req, res) => {
  try {
    const { produceName, tonnageKg, branch } = req.body;

    // 1. Business Rule: Check if product is in stock
    const stock = await Produce.findOne({ name: produceName, branch: branch });
    
    if (!stock || stock.quantity < tonnageKg) {
      return res.status(400).json({ 
        message: "Stock unavailable or insufficient for this credit request" 
      });
    }

    // 2. Create the Credit Sale record with required fields
    const newCreditSale = new CreditSale({
      buyerName: req.body.buyerName,
      nationalIdNIN: req.body.nationalIdNIN,
      location: req.body.location,
      contact: req.body.contact,
      amountDueUGX: req.body.amountDueUGX,
      salesAgentName: req.body.salesAgentName,
      dueDate: req.body.dueDate,
      produceName: produceName,
      tonnageKg: tonnageKg,
      dispatchDate: req.body.dispatchDate || Date.now()
    });

    await newCreditSale.save();

    // 3. Business Rule: Reduce stock tonnage upon dispatch
    stock.quantity -= tonnageKg;
    await stock.save();

    res.status(201).json({ 
      message: "Credit sale recorded successfully and stock updated", 
      data: newCreditSale 
    });

  } catch (error) {
    res.status(400).json({ 
      error: "Failed to record credit sale", 
      details: error.message 
    });
  }
});

module.exports = router;