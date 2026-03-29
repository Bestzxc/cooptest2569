const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

const createUser = async () => {
  const id       = uuidv4();
  const username = 'dispatcher1';
  const password = 'dispatcher123';
  const role     = 'DISPATCHER';

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)`,
    [id, username, hash, role]
  );

  console.log(`✅ สร้าง user สำเร็จ`);
  console.log(`   username: ${username}`);
  console.log(`   password: ${password}`);
  console.log(`   role:     ${role}`);

  await db.end();
  process.exit(0);
};

// เพิ่มบรรทัดนี้ — ไม่มีแล้ว script จะไม่รัน
createUser().catch(err => {
  console.error('❌ เกิดข้อผิดพลาด:', err.message);
  process.exit(1);
});