const mongoose = require('mongoose');

const creditSaleSchema = new mongoose.Schema({
  buyerName: { type: String, required: true, minlength: 2 }, // 
  nationalIdNIN: { 
    type: String, 
    required: true, 
    match: [/^[A-Z0-9]{14}$/, 'Invalid NIN format'] // Valid format of NIN 
  },
  location: { type: String, required: true, minlength: 2 },
  contact: { type: String, required: true }, 
  amountDueUGX: { type: Number, required: true, min: 10000 }, 
  dueDate: { type: Date, required: true }, 
  produceName: { type: String, required: true },
  tonnageKg: { type: Number, required: true }, 
  salesAgentName: { type: String, required: true }, 
  dispatchDate: { type: Date, required: true }
});

module.exports = mongoose.model('CreditSale', creditSaleSchema);