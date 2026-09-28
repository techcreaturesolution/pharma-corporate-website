import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { contentAccess } from '../../middleware/index.js';
import { Product } from '../products/product.model.js';
import { Category } from '../categories/category.model.js';
import { Enquiry } from '../enquiries/enquiry.model.js';
import { Job } from '../careers/job.model.js';
import { Application } from '../applications/application.model.js';
import { News } from '../news/news.model.js';

const stats = async (req, res) => {
  const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
  const [
    publishedProducts,
    draftProducts,
    categories,
    totalEnquiries,
    newEnquiries,
    openJobs,
    totalApplications,
    newApplications,
    publishedNews,
    recentEnquiries,
    recentApplications,
  ] = await Promise.all([
    Product.countDocuments({ status: 'published' }),
    Product.countDocuments({ status: 'draft' }),
    Category.countDocuments({ status: 'active' }),
    isAdmin ? Enquiry.countDocuments() : 0,
    isAdmin ? Enquiry.countDocuments({ status: 'new' }) : 0,
    Job.countDocuments({ status: 'open' }),
    isAdmin ? Application.countDocuments() : 0,
    isAdmin ? Application.countDocuments({ status: 'received' }) : 0,
    News.countDocuments({ status: 'published' }),
    isAdmin ? Enquiry.find().sort('-createdAt').limit(5).select('name company type productName status createdAt').lean() : [],
    isAdmin
      ? Application.find().sort('-createdAt').limit(5).select('name status createdAt jobId').populate('jobId', 'title').lean()
      : [],
  ]);

  return sendSuccess(res, {
    message: 'Dashboard statistics retrieved successfully',
    data: {
      counts: {
        publishedProducts,
        draftProducts,
        categories,
        totalEnquiries,
        newEnquiries,
        openJobs,
        totalApplications,
        newApplications,
        publishedNews,
      },
      recentEnquiries,
      recentApplications,
    },
  });
};

const router = Router();
router.get('/stats', ...contentAccess, asyncHandler(stats));

export default router;
