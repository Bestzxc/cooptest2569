const { runAlertEngine } = require('../services/alert.service');

// GET /alerts
const getAlerts = async (req, res) => {
  try {
    const { severity, resource_type } = req.query;

    const alerts = await runAlertEngine({ severity, resource_type });

    res.json({
      total: alerts.length,
      alerts
    });

  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

module.exports = { getAlerts };