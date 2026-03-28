const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// ── POST /vehicles ───────────────────────────────────
const createVehicle = async (req, res) => {
  try {
    const {
      license_plate, type, driver_id,
      brand, model, year, fuel_type,
      mileage_km, last_service_km, next_service_km
    } = req.body;

    // 1. validate fields จำเป็น
    const errors = {};
    if (!license_plate) errors.license_plate = 'จำเป็นต้องระบุทะเบียน';
    if (!type)          errors.type = 'จำเป็นต้องระบุประเภท';
    if (!brand)         errors.brand = 'จำเป็นต้องระบุยี่ห้อ';
    if (!model)         errors.model = 'จำเป็นต้องระบุรุ่น';
    if (!year)          errors.year = 'จำเป็นต้องระบุปี';
    if (!fuel_type)     errors.fuel_type = 'จำเป็นต้องระบุประเภทเชื้อเพลิง';

    // เช็คว่า type ถูกต้อง
    const validTypes = ['TRUCK', 'VAN', 'MOTORCYCLE', 'PICKUP'];
    if (type && !validTypes.includes(type)) {
      errors.type = `type ต้องเป็น ${validTypes.join(', ')} เท่านั้น`;
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ครบถ้วน', details: errors }
      });
    }

    // 2. เช็คว่าทะเบียนซ้ำไหม
    const [existing] = await db.query(
      'SELECT id FROM vehicles WHERE license_plate = ?',
      [license_plate]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        error: { code: 'DUPLICATE_PLATE', message: 'ทะเบียนนี้มีในระบบแล้ว', details: {} }
      });
    }

    // 3. ถ้ามี driver_id — เช็คว่า driver มีอยู่จริงและใบขับขี่ยังไม่หมดอายุ
    if (driver_id) {
      const [drivers] = await db.query(
        'SELECT * FROM drivers WHERE id = ?',
        [driver_id]
      );
      if (drivers.length === 0) {
        return res.status(400).json({
          error: { code: 'DRIVER_NOT_FOUND', message: 'ไม่พบ driver ที่ระบุ', details: {} }
        });
      }

      const driver = drivers[0];
      const isExpired = new Date(driver.license_expires_at) < new Date();

      if (isExpired) {
        return res.status(400).json({
          error: {
            code: 'DRIVER_LICENSE_EXPIRED',
            message: `ใบขับขี่ของ ${driver.name} หมดอายุแล้ว ไม่สามารถ assign ได้`,
            details: { license_expires_at: driver.license_expires_at }
          }
        });
      }
    }

    // 4. insert vehicle
    const id = uuidv4();
    const finalMileage = mileage_km || 0;
    const finalLastService = last_service_km || 0;
    const finalNextService = next_service_km || 10000;
    await db.query(
      `INSERT INTO vehicles 
        (id, license_plate, type, driver_id, brand, model, year, 
         fuel_type, mileage_km, last_service_km, next_service_km)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, license_plate, type, driver_id || null, brand, model, year,
       fuel_type, finalMileage, finalLastService, finalNextService]
    );

    // 5. audit log
    await db.query(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, result)
       VALUES (?, ?, 'CREATE_VEHICLE', 'vehicle', ?, ?, 'SUCCESS')`,
      [uuidv4(), req.user.userId, id, req.ip]
    );

    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('Create vehicle error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

// ── GET /vehicles ────────────────────────────────────
const getVehicles = async (req, res) => {
  try {
    // รับ query params สำหรับ filter
    const { status, type, driver_id } = req.query;

    // สร้าง query แบบ dynamic ตาม filter ที่ส่งมา
    let query = `
      SELECT v.*, d.name as driver_name 
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND v.status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND v.type = ?';
      params.push(type);
    }
    if (driver_id) {
      query += ' AND v.driver_id = ?';
      params.push(driver_id);
    }

    query += ' ORDER BY v.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);

  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

// ── GET /vehicles/:id ─────────────────────────────────
const getVehicleById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, d.name as driver_name
       FROM vehicles v
       LEFT JOIN drivers d ON v.driver_id = d.id
       WHERE v.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'ไม่พบ vehicle', details: {} }
      });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

// ── DELETE /vehicles/:id (ADMIN only) ────────────────
const deleteVehicle = async (req, res) => {
  try {
    // เช็คว่ามี trip IN_PROGRESS อยู่ไหม — ถ้ามีลบไม่ได้
    const [activeTrips] = await db.query(
      `SELECT id FROM trips 
       WHERE vehicle_id = ? AND status = 'IN_PROGRESS'`,
      [req.params.id]
    );
    if (activeTrips.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VEHICLE_IN_USE',
          message: 'ไม่สามารถลบได้ เพราะมี trip ที่กำลังดำเนินอยู่',
          details: { active_trip_id: activeTrips[0].id }
        }
      });
    }

    const [result] = await db.query(
      'DELETE FROM vehicles WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'ไม่พบ vehicle', details: {} }
      });
    }

    // audit log
    await db.query(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, result)
       VALUES (?, ?, 'DELETE_VEHICLE', 'vehicle', ?, ?, 'SUCCESS')`,
      [uuidv4(), req.user.userId, req.params.id, req.ip]
    );

    res.json({ message: 'ลบ vehicle สำเร็จ' });

  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

// ── PATCH /vehicles/:id/status ───────────────────────
const updateVehicleStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // กำหนด transition ที่อนุญาต
    const allowedTransitions = {
      IDLE:        ['ACTIVE'],
      ACTIVE:      ['IDLE', 'MAINTENANCE'],
      MAINTENANCE: ['IDLE'],
      RETIRED:     []
    };

    // ดึง status ปัจจุบัน
    const [rows] = await db.query(
      'SELECT status FROM vehicles WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'ไม่พบ vehicle', details: {} }
      });
    }

    const currentStatus = rows[0].status;
    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TRANSITION',
          message: `ไม่สามารถเปลี่ยนจาก ${currentStatus} เป็น ${status} ได้`,
          details: { allowed_transitions: allowed }
        }
      });
    }

    await db.query(
      'UPDATE vehicles SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: `เปลี่ยน status เป็น ${status} สำเร็จ` });

  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

module.exports = {
  createVehicle, getVehicles, getVehicleById,
  deleteVehicle, updateVehicleStatus
};