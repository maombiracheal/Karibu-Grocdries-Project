const mongoose = require('mongoose');
const User = require('./KGL-Backend/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/karibu-project');
    async function attemptLogin(fnUsername) {
      // replicate logic from auth.js
      let username = fnUsername.toLowerCase().trim();
      let user = await User.findOne({ username });
      if (!user && !username.includes('.')) {
        user = await User.findOne({ username: `manager.${username}` });
        if (!user) user = await User.findOne({ username: `agent.${username}` });
      }
      console.log(`lookup for "${fnUsername}" ->`, user ? user.username : 'not found');
      if (!user) return;
      let isMatch = false;
      if (user.password && typeof user.password === 'string' && user.password.startsWith('$2')) {
        isMatch = await bcrypt.compare('Manager@123', user.password);
      } else {
        isMatch = 'Manager@123' === user.password;
      }
      console.log('password matches?', isMatch);
    }

    await attemptLogin('manager.maganjo');
    await attemptLogin('maganjo');
    await attemptLogin('agent.maganjo');
    await attemptLogin('matugga');
    // director login attempts (normal username plus variants with space)
    await attemptLogin('director');
    await attemptLogin('mr orban');
    await attemptLogin('Mr Orban');
    
    // you can add additional cases above if needed

    // we'll still confirm we can generate a token for a known user
    let user = await User.findOne({ username: 'manager.maganjo' });
    const branch = user.branch;
    const normalizedBranch = (branch === 'Maganjo' || branch === 'Matugga') ? branch : branch;
    const token = jwt.sign({ id: user._id, role: user.role, branch: normalizedBranch }, process.env.JWT_SECRET || '+4g+PzIOxBHN1vnNuhNM4E67oY5P9d7ljXuwPjnM0kE=', { expiresIn: '24h' });
    console.log('token len', token.length);
  } catch (e) {
    console.error('error', e);
  } finally {
    mongoose.connection.close();
  }
})();