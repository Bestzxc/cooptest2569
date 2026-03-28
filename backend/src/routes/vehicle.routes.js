const express = require('express');
const router = express.Router();
const {
  createVehicle, getVehicles, getVehicleById,
  deleteVehicle, updateVehicleStatus
} = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/',            getVehicles);
router.get('/:id',         getVehicleById);
router.post('/',           authorize('ADMIN'), createVehicle);
router.delete('/:id',      authorize('ADMIN'), deleteVehicle);
router.patch('/:id/status',authorize('ADMIN', 'DISPATCHER'), updateVehicleStatus);

module.exports = router;