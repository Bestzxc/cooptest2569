const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// ── POST /trips ──────────────────────────────────────
const createTrip = async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, origin, destination,
      distance_km, cargo_type, cargo_weight_kg, checkpoints = []
    } = req.body;

    // 1. validate
    const errors = {};
    if (!vehicle_id)    errors.vehicle_id = 'จำเป็นต้องระบุ vehicle';
    if (!driver_id)     errors.driver_id = 'จำเป็นต้องระบุ driver';
    if (!origin)        errors.origin = 'จำเป็นต้องระบุต้นทาง';
    if (!destination)   errors.destination = 'จำเป็นต้องระบุปลายทาง';
    if (!distance_km)   errors.distance_km = 'จำเป็นต้องระบุระยะทาง';
    if (!cargo_weight_kg) errors.cargo_weight_kg = 'จำเป็นต้องระบุน้ำหนักสินค้า';
    if (checkpoints.length === 0) errors.checkpoints = 'ต้องมีอย่างน้อย 1 checkpoint';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ครบถ้วน', details: errors }
      });
    }

    // 2. เช็คว่า vehicle มี trip IN_PROGRESS อยู่แล้วไหม
    const [activeTrips] = await db.query(
      `SELECT id FROM trips 
       WHERE vehicle_id = ? AND status = 'IN_PROGRESS'`,
      [vehicle_id]
    );

    if (activeTrips.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VEHICLE_BUSY',
          message: 'รถคันนี้มี trip ที่กำลังดำเนินอยู่แล้ว',
          details: { active_trip_id: activeTrips[0].id }
        }
      });
    }

    // 3. เช็ค driver license ไม่หมดอายุ
    const [drivers] = await db.query(
      'SELECT * FROM drivers WHERE id = ?',
      [driver_id]
    );

    if (drivers.length === 0) {
      return res.status(400).json({
        error: { code: 'DRIVER_NOT_FOUND', message: 'ไม่พบ driver', details: {} }
      });
    }

    const isExpired = new Date(drivers[0].license_expires_at) < new Date();
    if (isExpired) {
      return res.status(400).json({
        error: {
          code: 'DRIVER_LICENSE_EXPIRED',
          message: 'ใบขับขี่ของ driver หมดอายุแล้ว',
          details: {}
        }
      });
    }

    // 4. สร้าง trip + checkpoints ใน transaction เดียวกัน
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const tripId = uuidv4();
      await conn.query(
        `INSERT INTO trips 
          (id, vehicle_id, driver_id, status, origin, destination,
           distance_km, cargo_type, cargo_weight_kg, started_at)
         VALUES (?, ?, ?, 'SCHEDULED', ?, ?, ?, ?, ?, NOW())`,
        [tripId, vehicle_id, driver_id, origin, destination,
         distance_km, cargo_type || 'GENERAL', cargo_weight_kg]
      );

      // insert checkpoints ตาม sequence
      for (let i = 0; i < checkpoints.length; i++) {
        const chk = checkpoints[i];
        await conn.query(
          `INSERT INTO checkpoints
            (id, trip_id, sequence, location_name, latitude, longitude, purpose, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), tripId, i + 1,
           chk.location_name, chk.latitude || null,
           chk.longitude || null, chk.purpose || 'DELIVERY',
           chk.notes || null]
        );
      }

      // audit log
      await conn.query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, result)
         VALUES (?, ?, 'CREATE_TRIP', 'trip', ?, ?, 'SUCCESS')`,
        [uuidv4(), req.user.userId, tripId, req.ip]
      );

      await conn.commit();

      // ดึงข้อมูล trip + checkpoints กลับมา
      const [trip] = await db.query('SELECT * FROM trips WHERE id = ?', [tripId]);
      const [chks] = await db.query(
        'SELECT * FROM checkpoints WHERE trip_id = ? ORDER BY sequence',
        [tripId]
      );

      res.status(201).json({ ...trip[0], checkpoints: chks });

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

// ── GET /trips ───────────────────────────────────────
const getTrips = async (req, res) => {
  try {
    const { status, vehicle_id } = req.query;

    let query = `
      SELECT t.*, 
             v.license_plate,
             d.name as driver_name
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status)     { query += ' AND t.status = ?';     params.push(status); }
    if (vehicle_id) { query += ' AND t.vehicle_id = ?'; params.push(vehicle_id); }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);

  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

// GET /trips/:id/checkpoints
const getTripCheckpoints = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM checkpoints WHERE trip_id = ? ORDER BY sequence',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

// ── PATCH /trips/:id/complete ────────────────────────
const completeTrip = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. ดึง trip
    const [trips] = await conn.query(
      'SELECT * FROM trips WHERE id = ?',
      [req.params.id]
    );

    if (trips.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'ไม่พบ trip', details: {} }
      });
    }

    const trip = trips[0];

    if (trip.status !== 'IN_PROGRESS') {
      await conn.rollback();
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: `ไม่สามารถ complete trip ที่มีสถานะ ${trip.status} ได้`,
          details: {}
        }
      });
    }

    // 2. อัปเดต trip เป็น COMPLETED
    await conn.query(
      `UPDATE trips SET status = 'COMPLETED', ended_at = NOW() WHERE id = ?`,
      [trip.id]
    );

    // 3. อัปเดต mileage_km ของรถ (ใน transaction เดียวกัน)
    await conn.query(
      `UPDATE vehicles 
       SET mileage_km = mileage_km + ?
       WHERE id = ?`,
      [trip.distance_km, trip.vehicle_id]
    );

    // 4. เช็คว่า mileage ใหม่เกิน next_service_km ไหม
    const [vehicles] = await conn.query(
      'SELECT * FROM vehicles WHERE id = ?',
      [trip.vehicle_id]
    );

    const vehicle = vehicles[0];

    if (vehicle.mileage_km >= vehicle.next_service_km) {
      // เปลี่ยน status รถเป็น MAINTENANCE
      await conn.query(
        `UPDATE vehicles SET status = 'MAINTENANCE' WHERE id = ?`,
        [vehicle.id]
      );

      // สร้าง maintenance record อัตโนมัติ (ใน transaction เดียวกัน!)
      await conn.query(
        `INSERT INTO maintenance
          (id, vehicle_id, status, type, scheduled_at, mileage_at_service, notes)
         VALUES (?, ?, 'SCHEDULED', 'OIL_CHANGE', NOW(), ?, 'Auto-created: mileage เกิน next_service_km')`,
        [uuidv4(), vehicle.id, vehicle.mileage_km]
      );
    }

    // 5. audit log
    await conn.query(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, result)
       VALUES (?, ?, 'COMPLETE_TRIP', 'trip', ?, ?, 'SUCCESS')`,
      [uuidv4(), req.user.userId, trip.id, req.ip]
    );

    await conn.commit();

    res.json({
      message: 'Trip completed สำเร็จ',
      vehicle_status: vehicle.mileage_km >= vehicle.next_service_km
        ? 'MAINTENANCE (mileage เกิน next_service_km)'
        : vehicle.status
    });

  } catch (err) {
    await conn.rollback();
    console.error('Complete trip error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  } finally {
    conn.release();
  }
};

// ── PATCH /checkpoints/:id/status ───────────────────
const updateCheckpointStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ARRIVED', 'DEPARTED', 'SKIPPED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: `status ต้องเป็น ${validStatuses.join(', ')}`,
          details: {}
        }
      });
    }

    // ดึง checkpoint ปัจจุบัน
    const [chks] = await db.query(
      'SELECT * FROM checkpoints WHERE id = ?',
      [req.params.id]
    );

    if (chks.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'ไม่พบ checkpoint', details: {} }
      });
    }

    const chk = chks[0];

    // เช็ค ARRIVED ต้องมาก่อน DEPARTED
    if (status === 'DEPARTED' && chk.status !== 'ARRIVED') {
      return res.status(400).json({
        error: {
          code: 'INVALID_TRANSITION',
          message: 'ต้อง ARRIVED ก่อนจึงจะ DEPARTED ได้',
          details: { current_status: chk.status }
        }
      });
    }

    // เช็ค sequence — checkpoint ก่อนหน้าต้องเสร็จก่อน
    if (chk.sequence > 1) {
      const [prevChk] = await db.query(
        `SELECT * FROM checkpoints 
         WHERE trip_id = ? AND sequence = ?`,
        [chk.trip_id, chk.sequence - 1]
      );

      if (prevChk.length > 0 && prevChk[0].status === 'PENDING') {
        return res.status(400).json({
          error: {
            code: 'SEQUENCE_ERROR',
            message: `ต้องทำ checkpoint ที่ ${chk.sequence - 1} (${prevChk[0].location_name}) ให้เสร็จก่อน`,
            details: {
              blocked_by: {
                id: prevChk[0].id,
                sequence: prevChk[0].sequence,
                location_name: prevChk[0].location_name,
                status: prevChk[0].status
              }
            }
          }
        });
      }
    }

    // อัปเดต status
    const updateFields = status === 'ARRIVED'
      ? 'status = ?, arrived_at = NOW()'
      : status === 'DEPARTED'
      ? 'status = ?, departed_at = NOW()'
      : 'status = ?';

    const updateParams = status === 'ARRIVED' || status === 'DEPARTED'
      ? [status, req.params.id]
      : [status, req.params.id];

    await db.query(
      `UPDATE checkpoints SET ${updateFields} WHERE id = ?`,
      updateParams
    );

    // audit log
    await db.query(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, result)
       VALUES (?, ?, 'UPDATE_CHECKPOINT', 'checkpoint', ?, ?, 'SUCCESS')`,
      [uuidv4(), req.user.userId, req.params.id, req.ip]
    );

    const [updated] = await db.query(
      'SELECT * FROM checkpoints WHERE id = ?',
      [req.params.id]
    );

    res.json(updated[0]);

  } catch (err) {
    console.error('Update checkpoint error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

module.exports = { createTrip, getTrips, completeTrip, updateCheckpointStatus, getTripCheckpoints };