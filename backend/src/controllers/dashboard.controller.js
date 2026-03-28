const db = require('../config/db');

// GET /dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    // ดึง trip distance 7 วันล่าสุด แยกตามวัน
    const [distanceRows] = await db.query(`
      SELECT 
        DATE(started_at) as date,
        SUM(distance_km)  as total_km
      FROM trips
      WHERE 
        status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED')
        AND started_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(started_at)
      ORDER BY date ASC
    `);

    // สร้าง array 7 วันเต็ม ถ้าวันไหนไม่มีข้อมูลให้ km = 0
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // "2024-01-15"

      const found = distanceRows.find(r => {
        const rowDate = new Date(r.date).toISOString().split('T')[0];
        return rowDate === dateStr;
      });

      // แปลงเป็นชื่อวันภาษาไทย
      const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
      const dayName = dayNames[d.getDay()];

      days.push({
        day: dayName,
        date: dateStr,
        km: found ? Math.round(Number(found.total_km)) : 0,
      });
    }

    res.json({ distance7days: days });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

module.exports = { getDashboardStats };