const express = require('express');
const router = express.Router();
const { getAlerts } = require('../controllers/alert.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getAlerts);

module.exports = router;