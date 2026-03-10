const express = require('express');
const procurementRoutes = require('./KGL-Backend/routes/procurement');
const app = express();

// dummy route to initialize router
app.get('/__dummy__', (req, res) => res.send('ok'));
app.use('/api/procurement', procurementRoutes);

console.log('mounted routes:');
if (app._router) {
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      console.log(layer.route.path, Object.keys(layer.route.methods));
    } else if (layer.name === 'router') {
      console.log('router at', layer.regexp);
    }
  });
} else {
  console.log('no router');
}
