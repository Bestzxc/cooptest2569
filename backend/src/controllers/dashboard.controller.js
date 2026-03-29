const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [distanceRows] = await db.query(`
      SELECT 
        DATE(CONVERT_TZ(COALESCE(ended_at, started_at), '+00:00', '+07:00')) as date,
        SUM(distance_km) as total_km
      FROM trips
      WHERE 
        status IN ('IN_PROGRESS', 'COMPLETED')
        AND CONVERT_TZ(COALESCE(ended_at, started_at), '+00:00', '+07:00') >= DATE_SUB(CONVERT_TZ(NOW(), '+00:00', '+07:00'), INTERVAL 6 DAY)
      GROUP BY DATE(CONVERT_TZ(COALESCE(ended_at, started_at), '+00:00', '+07:00'))
      ORDER BY date ASC
    `);

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
        day: `${d.getDate()}/${d.getMonth() + 1}`,
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