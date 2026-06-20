const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany, getStats, getUpcoming } = require('../controllers/companyController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../src/uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', authenticate, getCompanies);
router.get('/stats', authenticate, getStats);
router.get('/upcoming', authenticate, getUpcoming);
router.get('/:id', authenticate, getCompany);
router.post('/', authenticate, authorize('coordinator'), upload.fields([{ name: 'logo' }, { name: 'jdPdf' }]), createCompany);
router.put('/:id', authenticate, authorize('coordinator'), upload.fields([{ name: 'logo' }, { name: 'jdPdf' }]), updateCompany);
router.delete('/:id', authenticate, authorize('coordinator'), deleteCompany);

module.exports = router;
