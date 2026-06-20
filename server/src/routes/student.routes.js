const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { getProfile, updateProfile, getStudents, getStudentDashboard, getCoordinatorDashboard } = require('../controllers/studentController');

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/dashboard/student', authenticate, authorize('student'), getStudentDashboard);
router.get('/dashboard/coordinator', authenticate, authorize('coordinator'), getCoordinatorDashboard);
router.get('/directory', authenticate, authorize('coordinator'), getStudents);

module.exports = router;
