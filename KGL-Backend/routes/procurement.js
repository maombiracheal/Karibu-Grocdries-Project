const express = require('express');
const router = express.Router();
const Procurement = require('../models/Procurement');
const { protect, authorize } = require('../middleware/auth');


// POST: Record new produce 
// Only the manager is responsible for recording procurement 
router.post('/procurement', protect, authorize('Manager','Director'), async (req, res) => {
  try {
    const newEntry = new Procurement({
      ...req.body,
      recordedBy: req.user.id // Assuming user ID comes from your auth middleware
    });

    const savedProcurement = await newEntry.save();
    
    // Logic to update the main Produce stock 
    
    res.status(201).json({
      message: "Procurement recorded successfully",
      data: savedProcurement
    });
  } catch (error) {
    res.status(400).json({ 
      error: "Failed to record procurement", 
      details: error.message 
    });
  }
});
// Accessible by Manager and Director
router.get('/procurement', protect, authorize('Manager', 'Director'), async (req, res) => {
    try {
        // Business Rule: Director (Mr. Orban) should only see aggregations 
        if (req.user.role === 'Director') {
            const totals = await Procurement.aggregate([
                {
                    $group: {
                        _id: "$branchName",
                        totalTonnage: { $sum: "$tonnageKg" },
                        totalCost: { $sum: "$costUGX" },
                        itemCount: { $sum: 1 }
                    }
                }
            ]);
            return res.status(200).json({ 
                message: "Aggregated Branch Totals for Director", 
                data: totals 
            });
        }

        // If Manager, show all detailed records 
        const records = await Procurement.find().sort({ procurementDate: -1 });
        res.status(200).json(records);
        
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
