const express = require('express');
const router = express.Router();
const { login, refresh, getAuditLogs } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/login',   login);
router.post('/refresh', refresh);

// audit logs — ต้อง login ก่อน
router.get('/audit-logs', authenticate, getAuditLogs);

module.exports = router;