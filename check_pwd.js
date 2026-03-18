const bcrypt = require('bcryptjs');

const hash = "$2a$12$4xGX14oew.cp.4ru0HUeVenjnpdn8afIDJR464vhq5ZeehD.cXB82";
const pwd = "Monkeu@123";

async function check() {
  const match = await bcrypt.compare(pwd, hash);
  console.log("Match:", match);
}

check();
