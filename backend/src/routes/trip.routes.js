const express = require('express');
const router = express.Router();
const {
  createTrip, getTrips, completeTrip,
  updateCheckpointStatus, getTripCheckpoints, getMaintenance, deleteTrip
} = require('../controllers/trip.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/',                              getTrips);
router.get('/:id/checkpoints', getTripCheckpoints);
router.post('/',    authorize('ADMIN','DISPATCHER'), createTrip);
router.patch('/:id/complete', authorize('ADMIN','DISPATCHER'), completeTrip);
router.get('/:id/maintenance', getMaintenance);
router.delete('/:id', authorize('ADMIN'), deleteTrip);

// checkpoints อยู่ใน trip routes เพราะเกี่ยวข้องกัน
router.patch('/checkpoints/:id/status',
  authorize('ADMIN','DISPATCHER'),
  updateCheckpointStatus
);

module.exports = router;