const userService = require('../services/userService');
const companyService = require('../services/companyService');
const notificationService = require('../services/notificationService');
const experienceService = require('../services/experienceService');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { AppError } = require('../utils/appError');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, branch, cgpa } = req.body;
    const user = await userService.updateProfile(req.user.id, { name, branch, cgpa });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) { next(err); }
};

const getStudents = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const { search, branch, minCgpa, maxCgpa } = req.query;
    const { data, total } = await userService.getAllStudents({
      search, branch,
      minCgpa: minCgpa ? parseFloat(minCgpa) : undefined,
      maxCgpa: maxCgpa ? parseFloat(maxCgpa) : undefined,
      limit, offset,
    });
    res.json(paginatedResponse(data, total, page, limit));
  } catch (err) { next(err); }
};

const getStudentDashboard = async (req, res, next) => {
  try {
    console.log(`[Dashboard Backend] Fetching student dashboard for user: ${req.user.id}`);
    const user = await userService.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);
    
    console.log(`[Dashboard Backend] Student CGPA: ${user.cgpa}`);
    
    const [
      total,
      upcoming,
      eligible,
      recentNotifs,
      upcomingDrives,
      closingSoon,
      eligibleList,
      recentExperiences,
      placementStats
    ] = await Promise.all([
      companyService.count(),
      companyService.countUpcoming(),
      companyService.countEligibleForStudent(user.cgpa || 0),
      notificationService.getRecentForStudent(user.id, 5),
      companyService.getUpcoming(5),
      companyService.getClosingSoon(5),
      companyService.getEligibleListForStudent(user.cgpa || 0, 5),
      experienceService.getApproved({ limit: 5, offset: 0 }),
      companyService.getPlacementStats()
    ]);
    
    console.log('[Dashboard Backend] Queries completed successfully.');
    console.log(`[Dashboard Backend] Stats -> Total: ${total}, Upcoming: ${upcoming}, Eligible: ${eligible}`);
    console.log(`[Dashboard Backend] Drives -> Upcoming: ${upcomingDrives.length}, Closing Soon: ${closingSoon.length}, Eligible List: ${eligibleList.length}`);
    
    res.json({
      success: true,
      data: {
        stats: { 
          totalCompanies: total, 
          upcomingCompanies: upcoming, 
          eligibleCompanies: eligible 
        },
        placementStats,
        upcomingDrives,
        closingSoon,
        eligibleCompaniesList: eligibleList,
        recentNotifications: recentNotifs,
        recentExperiences: recentExperiences.data || [],
      },
    });
  } catch (err) { 
    console.error('[Dashboard Backend] Error generating student dashboard:', err);
    next(err); 
  }
};

const getCoordinatorDashboard = async (req, res, next) => {
  try {
    const [totalStudents, totalCompanies, upcoming, totalExperiences, packageDist, recentNotifs] = await Promise.all([
      userService.countStudents(),
      companyService.count(),
      companyService.countUpcoming(),
      experienceService.count(),
      companyService.getPackageDistribution(),
      notificationService.getRecent(5),
    ]);
    res.json({
      success: true,
      data: {
        stats: { totalStudents, totalCompanies, upcomingDrives: upcoming, totalExperiences },
        packageDistribution: packageDist,
        recentNotifications: recentNotifs,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getStudents, getStudentDashboard, getCoordinatorDashboard };
