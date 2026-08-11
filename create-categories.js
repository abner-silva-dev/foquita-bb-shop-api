const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const env = fs.readFileSync(envPath, 'utf8');

  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

    if (!match || match[1].startsWith('#') || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = (match[2] || '').replace(/^["']|["']$/g, '');
  }
}

(async () => {
  loadEnv();
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foquita-bb-shop';
  await mongoose.connect(uri);
  console.log('connected to', mongoose.connection.name);
  const db = mongoose.connection.db;
  const categories = ['cosmeticos', 'papeleria'];

  for (const name of categories) {
    const exists = await db.collection('categories').findOne({
      name: { $regex: new RegExp('^' + name + '$', 'i') },
    });

    if (!exists) {
      await db.collection('categories').insertOne({
        name,
        description: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('created', name);
    } else {
      console.log('exists', name);
    }
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
