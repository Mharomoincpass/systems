const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const envFile = fs.readFileSync('.env', 'utf-8');
const directUriMatch = envFile.match(/MONGODB_DIRECT_URI="([^"]+)"/);
const mongoUri = directUriMatch ? directUriMatch[1] : envFile.match(/MONGODB_URI="([^"]+)"/)[1];

async function resetPwd() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB using:", mongoUri.split('@')[1] || mongoUri);
  
  const db = mongoose.connection.db;
  const users = db.collection('users');
  
  const newPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  const result = await users.updateOne(
    { email: 'mharomolotha6@gmail.com' },
    { $set: { password: hashedPassword } }
  );
  
  if (result.matchedCount === 0) {
    console.log("User not found in the database.");
  } else {
    console.log("Password reset successfully. New password is:", newPassword);
  }
  process.exit(0);
}

resetPwd().catch(console.error);
