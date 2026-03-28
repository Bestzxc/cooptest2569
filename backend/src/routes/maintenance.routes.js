const express = require('express');
const router = express.Router();
const { getMaintenance } = require('../controllers/trip.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getMaintenance);

module.exports = router;