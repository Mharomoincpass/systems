const mongoose = require('mongoose');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf-8');
const directUriMatch = envFile.match(/MONGODB_DIRECT_URI="([^"]+)"/);
const mongoUri = directUriMatch ? directUriMatch[1] : envFile.match(/MONGODB_URI="([^"]+)"/)[1];

async function check() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB using:", mongoUri.split('@')[1] || mongoUri);
  
  const db = mongoose.connection.db;
  const users = db.collection('users');
  const user = await users.findOne({ email: 'mharomolotha6@gmail.com' });
  
  if (!user) {
    console.log("User not found in the database.");
  } else {
    console.log("User found:");
    console.log(JSON.stringify(user, null, 2));
  }
  process.exit(0);
}
check().catch(console.error);
