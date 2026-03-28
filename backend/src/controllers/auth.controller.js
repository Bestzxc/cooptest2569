const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// ── helper: สร้าง token ──────────────────────────────
const createAccessToken = (user) => {
  return jwt.sign(
    // payload — ข้อมูลที่ฝังใน token
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN } // 15m
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN } // 7d
  );
};

// ── POST /auth/login ─────────────────────────────────
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. validate input
    if (!username || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'username และ password จำเป็นต้องระบุ',
          details: {}
        }
      });
    }

    // 2. หา user จาก DB
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    const user = rows[0];

    // 3. เช็คว่ามี user ไหม
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'username หรือ password ไม่ถูกต้อง',
          details: {}
        }
      });
    }

    // 4. เช็ค password กับ hash ใน DB
    // bcrypt.compare จะ hash password ที่รับมาแล้วเทียบกับที่เก็บไว้
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'username หรือ password ไม่ถูกต้อง',
          details: {}
        }
      });
    }

    // 5. สร้าง token ทั้งคู่
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // 6. บันทึก audit log
    await db.query(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, ip_address, result)
       VALUES (?, ?, 'LOGIN', 'auth', ?, 'SUCCESS')`,
      [uuidv4(), user.id, req.ip]
    );

    // 7. return token
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'เกิดข้อผิดพลาดภายใน server',
        details: {}
      }
    });
  }
};

// ── POST /auth/refresh ───────────────────────────────
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: {
          code: 'NO_TOKEN',
          message: 'ไม่พบ refresh token',
          details: {}
        }
      });
    }

    // ตรวจสอบว่า refresh token ถูกและยังไม่หมดอายุ
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'refresh token หมดอายุหรือไม่ถูกต้อง กรุณา login ใหม่',
          details: {}
        }
      });
    }

    // ดึง user จาก DB เพื่อเอาข้อมูลล่าสุด
    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [decoded.userId]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบ user กรุณา login ใหม่',
          details: {}
        }
      });
    }

    // สร้าง access token ใหม่
    const newAccessToken = createAccessToken(user);

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'เกิดข้อผิดพลาดภายใน server',
        details: {}
      }
    });
  }
};

// GET /audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const { user_id, action, resource_type, date_from, date_to } = req.query;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    // DISPATCHER เห็นได้เฉพาะ log ของตัวเอง
    if (req.user.role === 'DISPATCHER') {
      query += ' AND user_id = ?';
      params.push(req.user.userId);
    } else {
      // ADMIN filter ตาม user_id ได้
      if (user_id) {
        query += ' AND user_id = ?';
        params.push(user_id);
      }
    }

    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }
    if (resource_type) {
      query += ' AND resource_type = ?';
      params.push(resource_type);
    }
    if (date_from) {
      query += ' AND created_at >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND created_at <= ?';
      params.push(date_to + ' 23:59:59');
    }

    query += ' ORDER BY created_at DESC LIMIT 200';

    const [rows] = await db.query(query, params);
    res.json(rows);

  } catch (err) {
    console.error('Get audit logs error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาด', details: {} }
    });
  }
};

module.exports = { login, refresh, getAuditLogs }; // เพิ่ม getAuditLogs