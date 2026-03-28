const express = require('express');
const router = express.Router();
const { createDriver, getDrivers, getDriverById } = require('../controllers/driver.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ทุก route ต้อง login ก่อน
router.use(authenticate);

router.get('/',    getDrivers);
router.get('/:id', getDriverById);
router.post('/',   authorize('ADMIN'), createDriver);

module.exports = router;