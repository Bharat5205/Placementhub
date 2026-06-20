const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getExperiences, 
  getAllExperiences, 
  getExperience,
  createExperience, 
  updateExperience, 
  deleteExperience,
} = require('../controllers/experienceController');

// Everyone (students & coordinators): view approved experiences
router.get('/', authenticate, getExperiences);

// Coordinator: view all in repository
router.get('/all', authenticate, authorize('coordinator'), getAllExperiences);

// View details of an experience
router.get('/:id', authenticate, getExperience);

// Coordinator: create experience
router.post('/', authenticate, authorize('coordinator'), createExperience);

// Coordinator: update experience
router.put('/:id', authenticate, authorize('coordinator'), updateExperience);

// Coordinator: delete experience
router.delete('/:id', authenticate, authorize('coordinator'), deleteExperience);

module.exports = router;
