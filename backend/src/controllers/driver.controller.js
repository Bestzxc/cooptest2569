const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// ── POST /drivers ────────────────────────────────────
const createDriver = async (req, res) => {
  try {
    const { name, license_number, license_expires_at, phone } = req.body;

    // 1. validate — เช็คว่าครบทุก field ที่จำเป็น
    const errors = {};
    if (!name)                errors.name = 'จำเป็นต้องระบุชื่อ';
    if (!license_number)      errors.license_number = 'จำเป็นต้องระบุเลขใบขับขี่';
    if (!license_expires_at)  errors.license_expires_at = 'จำเป็นต้องระบุวันหมดอายุ';
    if (!phone)               errors.phone = 'จำเป็นต้องระบุเบอร์โทร';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ข้อมูลไม่ครบถ้วน',
          details: errors
        }
      });
    }

    // 2. เช็คว่า license_number ซ้ำไหม
    const [existing] = await db.query(
      'SELECT id FROM drivers WHERE license_number = ?',
      [license_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: {
          code: 'DUPLICATE_LICENSE',
          message: 'เลขใบขับขี่นี้มีในระบบแล้ว',
          details: {}
        }
      });
    }

    // 3. insert ลง DB
    const id = uuidv4();
    await db.query(
      `INSERT INTO drivers (id, name, license_number, license_expires_at, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, license_number, license_expires_at, phone]
    );

    // 4. ดึงข้อมูลที่เพิ่งสร้างกลับมา return
    const [rows] = await db.query(
      'SELECT * FROM drivers WHERE id = ?',
      [id]
    );

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('Create driver error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'เกิดข้อผิดพลาดภายใน server',
        details: {}
      }
    });
  }
};

// ── GET /drivers ─────────────────────────────────────
const getDrivers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM drivers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

// ── GET /drivers/:id ──────────────────────────────────
const getDriverById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM drivers WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'ไม่พบ driver', details: {} }
      });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

module.exports = { createDriver, getDrivers, getDriverById };