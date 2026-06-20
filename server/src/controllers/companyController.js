const companyService = require('../services/companyService');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { AppError } = require('../utils/appError');

const getCompanies = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { search, minPackage, maxPackage, role, sortBy, sortOrder } = req.query;
    const { data, total } = await companyService.getAll({
      search, minPackage: minPackage ? parseFloat(minPackage) : undefined,
      maxPackage: maxPackage ? parseFloat(maxPackage) : undefined,
      role, sortBy, sortOrder, limit, offset,
    });
    res.json(paginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

const getCompany = async (req, res, next) => {
  try {
    const company = await companyService.getById(req.params.id);
    if (!company) throw new AppError('Company not found', 404);
    res.json({ success: true, data: company });
  } catch (err) { next(err); }
};

const isValidUrl = (urlString) => {
  if (!urlString || urlString.trim() === '') return true; // optional field
  try {
    const url = new URL(urlString.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

const createCompany = async (req, res, next) => {
  try {
    const { name, roleOffered, packageLpa, eligibilityCgpa, visitDate, applicationDeadline, description, hiringProcess, applicationLink, logoUrl: bodyLogoUrl } = req.body;
    
    if (applicationLink && !isValidUrl(applicationLink)) {
      throw new AppError('Application link must be a valid URL starting with http:// or https://', 400);
    }

    const logoUrl = req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : (bodyLogoUrl || null);
    const jdPdfUrl = req.files?.jdPdf ? `/uploads/${req.files.jdPdf[0].filename}` : null;

    const company = await companyService.create({
      name, logoUrl, roleOffered, packageLpa: parseFloat(packageLpa),
      eligibilityCgpa: parseFloat(eligibilityCgpa), visitDate, applicationDeadline,
      description, hiringProcess, jdPdfUrl, createdBy: req.user.id,
      applicationLink: applicationLink ? applicationLink.trim() : null
    });
    res.status(201).json({ success: true, message: 'Company created successfully', data: company });
  } catch (err) { next(err); }
};

const updateCompany = async (req, res, next) => {
  try {
    const existing = await companyService.getById(req.params.id);
    if (!existing) throw new AppError('Company not found', 404);

    const { name, roleOffered, packageLpa, eligibilityCgpa, visitDate, applicationDeadline, description, hiringProcess, applicationLink, logoUrl: bodyLogoUrl } = req.body;

    if (applicationLink !== undefined && !isValidUrl(applicationLink)) {
      throw new AppError('Application link must be a valid URL starting with http:// or https://', 400);
    }

    const logoUrl = req.files?.logo 
      ? `/uploads/${req.files.logo[0].filename}` 
      : (bodyLogoUrl !== undefined ? bodyLogoUrl : existing.logo_url);
    const jdPdfUrl = req.files?.jdPdf ? `/uploads/${req.files.jdPdf[0].filename}` : existing.jd_pdf_url;

    const company = await companyService.update(req.params.id, {
      name, logoUrl, roleOffered, packageLpa: parseFloat(packageLpa),
      eligibilityCgpa: parseFloat(eligibilityCgpa), visitDate, applicationDeadline,
      description, hiringProcess, jdPdfUrl,
      applicationLink: applicationLink ? applicationLink.trim() : null
    });
    res.json({ success: true, message: 'Company updated successfully', data: company });
  } catch (err) { next(err); }
};

const deleteCompany = async (req, res, next) => {
  try {
    const existing = await companyService.getById(req.params.id);
    if (!existing) throw new AppError('Company not found', 404);
    await companyService.delete(req.params.id);
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const [total, upcoming, packageDist] = await Promise.all([
      companyService.count(),
      companyService.countUpcoming(),
      companyService.getPackageDistribution(),
    ]);
    res.json({ success: true, data: { total, upcoming, packageDistribution: packageDist } });
  } catch (err) { next(err); }
};

const getUpcoming = async (req, res, next) => {
  try {
    const drives = await companyService.getUpcoming(5);
    res.json({ success: true, data: drives });
  } catch (err) { next(err); }
};

module.exports = { getCompanies, getCompany, createCompany, updateCompany, deleteCompany, getStats, getUpcoming };
