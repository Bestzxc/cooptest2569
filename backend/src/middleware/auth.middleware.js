const jwt = require('jsonwebtoken');

// ── ตรวจสอบว่ามี token และ token ถูกต้อง ────────────
const authenticate = (req, res, next) => {
  // ดึง token จาก Header: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // เอาแค่ส่วนหลัง "Bearer "

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'NO_TOKEN',
        message: 'กรุณา login ก่อนใช้งาน',
        details: {}
      }
    });
  }

  try {
    // verify จะ throw error ถ้า token ผิดหรือหมดอายุ
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // แนบข้อมูล user ไว้ใน req เพื่อให้ controller ใช้ต่อได้
    req.user = decoded; // { userId, role }
    next(); // ผ่าน ไปต่อได้เลย

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'token หมดอายุ กรุณาใช้ refresh token เพื่อขอ token ใหม่',
          details: {}
        }
      });
    }

    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'token ไม่ถูกต้อง',
        details: {}
      }
    });
  }
};

// ── ตรวจสอบ role ─────────────────────────────────────
// ใช้แบบนี้: authorize('ADMIN') หรือ authorize('ADMIN', 'DISPATCHER')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `เฉพาะ ${roles.join(', ')} เท่านั้นที่ใช้งานได้`,
          details: {}
        }
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };