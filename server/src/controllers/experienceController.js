const experienceService = require('../services/experienceService');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { AppError } = require('../utils/appError');

const getExperiences = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { search, companyName, role, year } = req.query;
    const { data, total } = await experienceService.getApproved({ search, companyName, role, year, limit, offset });
    res.json(paginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

const getAllExperiences = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { data, total } = await experienceService.getAll({ limit, offset });
    res.json(paginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

const getExperience = async (req, res, next) => {
  try {
    const experience = await experienceService.getById(req.params.id);
    if (!experience) throw new AppError('Experience not found', 404);
    res.json({ success: true, data: experience });
  } catch (err) { next(err); }
};

const createExperience = async (req, res, next) => {
  try {
    const { companyId, companyName, roleOffered, batchYear, title, difficultyLevel, interviewRounds, experience, preparationTips, resourcesLinks } = req.body;
    
    if (!companyName || !roleOffered || !batchYear || !title || !interviewRounds || !experience) {
      throw new AppError('Required fields are missing', 400);
    }

    const exp = await experienceService.create({
      companyId, companyName, roleOffered, batchYear, title,
      difficultyLevel, interviewRounds, experience, preparationTips, resourcesLinks,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, message: 'Experience created successfully', data: exp });
  } catch (err) { next(err); }
};

const updateExperience = async (req, res, next) => {
  try {
    const { companyId, companyName, roleOffered, batchYear, title, difficultyLevel, interviewRounds, experience, preparationTips, resourcesLinks } = req.body;
    
    if (!companyName || !roleOffered || !batchYear || !title || !interviewRounds || !experience) {
      throw new AppError('Required fields are missing', 400);
    }

    const exp = await experienceService.update(req.params.id, {
      companyId, companyName, roleOffered, batchYear, title,
      difficultyLevel, interviewRounds, experience, preparationTips, resourcesLinks
    });
    if (!exp) throw new AppError('Experience not found', 404);
    
    res.json({ success: true, message: 'Experience updated successfully', data: exp });
  } catch (err) { next(err); }
};

const deleteExperience = async (req, res, next) => {
  try {
    const exp = await experienceService.getById(req.params.id);
    if (!exp) throw new AppError('Experience not found', 404);
    await experienceService.delete(req.params.id);
    res.json({ success: true, message: 'Experience deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { 
  getExperiences, 
  getAllExperiences, 
  getExperience, 
  createExperience, 
  updateExperience, 
  deleteExperience 
};
