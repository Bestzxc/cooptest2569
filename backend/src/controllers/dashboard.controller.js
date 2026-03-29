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
        AND DATE(started_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(started_at)
      ORDER BY date ASC
    `);

    // สร้าง array 7 วันเต็ม ถ้าวันไหนไม่มีข้อมูลให้ km = 0
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
      ].join('-');

      const found = distanceRows.find(r => {
        const rd = new Date(r.date);
        const rowDate = [
          rd.getFullYear(),
          String(rd.getMonth() + 1).padStart(2, '0'),
          String(rd.getDate()).padStart(2, '0'),
        ].join('-');
        return rowDate === dateStr;
      });

      days.push({
        day: `${d.getDate()}/${d.getMonth() + 1}`, // เปลี่ยนจาก dayName เป็นวันที่
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