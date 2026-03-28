const express = require('express');
const router = express.Router();
const { login, refresh } = require('../controllers/auth.controller');

// POST /auth/login
router.post('/login', login);

// POST /auth/refresh
router.post('/refresh', refresh);

module.exports = router;