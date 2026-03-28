const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./config/db');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});
// ── Routes ──────────────────────────────────────────
app.use('/auth', require('./routes/auth.routes'));
app.use('/vehicles', require('./routes/vehicle.routes'));
app.use('/drivers',  require('./routes/driver.routes')); 
app.use('/trips',    require('./routes/trip.routes'));
app.use('/alerts',   require('./routes/alert.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});