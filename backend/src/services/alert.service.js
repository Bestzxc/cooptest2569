const db = require('../config/db');

// ══════════════════════════════════════════════════════
//  ALERT RULES
//  เพิ่ม rule ใหม่ได้โดยแค่ push object เข้า array นี้
//  ไม่ต้องแก้โค้ดส่วนไหนเลย
// ══════════════════════════════════════════════════════
const alertRules = [

  // Rule 1: mileage เกิน next_service_km
  {
    id: 'VEHICLE_DUE_FOR_SERVICE',
    severity: 'CRITICAL',
    resource_type: 'vehicle',
    check: async () => {
      const [rows] = await db.query(`
        SELECT id, license_plate, mileage_km, next_service_km
        FROM vehicles
        WHERE mileage_km >= next_service_km
          AND status != 'RETIRED'
      `);

      return rows.map(v => ({
        affected_resource_id: v.id,
        message: `Vehicle Due for Service: ${v.license_plate} (${v.mileage_km.toLocaleString()} km / next service ${v.next_service_km.toLocaleString()} km)`
      }));
    }
  },

  // Rule 2: maintenance SCHEDULED เลยมาแล้วเกิน 3 วัน
  {
    id: 'OVERDUE_MAINTENANCE',
    severity: 'CRITICAL',
    resource_type: 'maintenance',
    check: async () => {
      const [rows] = await db.query(`
        SELECT m.id, m.type, v.license_plate
        FROM maintenance m
        JOIN vehicles v ON m.vehicle_id = v.id
        WHERE m.status = 'SCHEDULED'
          AND m.scheduled_at < DATE_SUB(NOW(), INTERVAL 3 DAY)
      `);

      return rows.map(m => ({
        affected_resource_id: m.id,
        message: `Overdue Maintenance: ${m.type} สำหรับ ${m.license_plate} เลยกำหนดมากกว่า 3 วันแล้ว`
      }));
    }
  },

  // Rule 3: driver license หมดอายุภายใน 30 วัน
  {
    id: 'LICENSE_EXPIRING_SOON',
    severity: 'WARNING',
    resource_type: 'driver',
    check: async () => {
      const [rows] = await db.query(`
        SELECT id, name, license_expires_at
        FROM drivers
        WHERE license_expires_at BETWEEN CURDATE() 
          AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
          AND status = 'ACTIVE'
      `);

      return rows.map(d => ({
        affected_resource_id: d.id,
        message: `License Expiring Soon: ${d.name} ใบขับขี่หมดอายุ ${d.license_expires_at}`
      }));
    }
  },

  // Rule 4: trip IN_PROGRESS นานเกิน 150% ของเวลาที่คาดไว้
  // คำนวณจาก distance_km / 60 km/h = ชั่วโมงที่ควรใช้
  {
    id: 'TRIP_DELAYED',
    severity: 'WARNING',
    resource_type: 'trip',
    check: async () => {
      const [rows] = await db.query(`
        SELECT id, origin, destination, distance_km, started_at
        FROM trips
        WHERE status = 'IN_PROGRESS'
      `);

      const delayed = rows.filter(t => {
        // เวลาที่ควรใช้ (วินาที) = distance / 60kmh * 3600
        const estimatedSeconds = (t.distance_km / 60) * 3600;
        const elapsedSeconds = (Date.now() - new Date(t.started_at)) / 1000;
        return elapsedSeconds > estimatedSeconds * 1.5;
      });

      return delayed.map(t => ({
        affected_resource_id: t.id,
        message: `Trip Delayed: ${t.origin} → ${t.destination} ใช้เวลาเกิน 150% ของเวลาที่คาดไว้`
      }));
    }
  },

  // ══════════════════════════════════════════════════
  //  เพิ่ม rule ใหม่ตรงนี้ได้เลย ตัวอย่าง:
  // {
  //   id: 'LOW_FUEL',
  //   severity: 'WARNING',
  //   resource_type: 'vehicle',
  //   check: async () => { ... return [{ affected_resource_id, message }] }
  // },
  // ══════════════════════════════════════════════════

];

// ══════════════════════════════════════════════════════
//  CORE ENGINE — ไม่ต้องแก้ไฟล์นี้เลยเมื่อเพิ่ม rule
//  แค่ loop ผ่าน rules ทั้งหมดแล้วรัน check()
// ══════════════════════════════════════════════════════
const runAlertEngine = async (filters = {}) => {
  const results = [];

  for (const rule of alertRules) {
    // กรองตาม resource_type ถ้ามีการ filter
    if (filters.resource_type && rule.resource_type !== filters.resource_type) {
      continue;
    }
    if (filters.severity && rule.severity !== filters.severity) {
      continue;
    }

    try {
      const alerts = await rule.check();

      for (const alert of alerts) {
        results.push({
          rule_id: rule.id,
          severity: rule.severity,
          affected_resource_type: rule.resource_type,
          affected_resource_id: alert.affected_resource_id,
          message: alert.message
        });
      }
    } catch (err) {
      console.error(`Alert rule ${rule.id} failed:`, err.message);
    }
  }

  return results;
};

module.exports = { runAlertEngine };