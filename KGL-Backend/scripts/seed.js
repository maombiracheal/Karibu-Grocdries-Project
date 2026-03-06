const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/karibu-project';

const users = [
  {
    username: 'director',
    password: 'Director@123',
    fullName: 'KGL Director',
    role: 'Director',
  },
  {
    username: 'manager.maganjo',
    password: 'Manager@123',
    fullName: 'Manager Maganjo',
    role: 'Manager',
    branch: 'Maganjo',
  },
  {
    username: 'manager.matugga',
    password: 'Manager@123',
    fullName: 'Manager Matugga',
    role: 'Manager',
    branch: 'Matugga',
  },
  {
    username: 'agent.maganjo',
    password: 'Agent@123',
    fullName: 'Sales Agent Maganjo',
    role: 'Sales Agent',
    branch: 'Maganjo',
  },
  {
    username: 'agent.matugga',
    password: 'Agent@123',
    fullName: 'Sales Agent Matugga',
    role: 'Sales Agent',
    branch: 'Matugga',
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (const entry of users) {
      const hashedPassword = await bcrypt.hash(entry.password, 10);

      const update = {
        username: entry.username,
        password: hashedPassword,
        fullName: entry.fullName,
        role: entry.role,
      };

      if (entry.role !== 'Director') {
        update.branch = entry.branch;
      }

      await User.findOneAndUpdate(
        { username: entry.username },
        update,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('User seeding complete. Credentials:');
    users.forEach((u) => {
      console.log(`- ${u.username} | ${u.role}${u.branch ? ` (${u.branch})` : ''} | password: ${u.password}`);
    });
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedUsers();
