import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import productRoutes from './modules/products/product.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import capabilityRoutes from './modules/capabilities/capability.routes.js';
import certificationRoutes from './modules/certifications/certification.routes.js';
import facilityRoutes from './modules/facilities/facility.routes.js';
import leadershipRoutes from './modules/leadership/leadership.routes.js';
import newsRoutes from './modules/news/news.routes.js';
import galleryRoutes from './modules/gallery/gallery.routes.js';
import careerRoutes from './modules/careers/career.routes.js';
import applicationRoutes from './modules/applications/application.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import { publicRouter as pagesPublic, adminRouter as pagesAdmin } from './modules/pages/page.routes.js';
import { publicRouter as enquiriesPublic, adminRouter as enquiriesAdmin, contactRouter } from './modules/enquiries/enquiry.routes.js';
import { publicRouter as settingsPublic, adminRouter as settingsAdmin } from './modules/settings/settings.routes.js';

/**
 * /api/v1
 *
 * Content collections expose public GET (published only) and protected
 * POST/PUT/PATCH/DELETE on the same path. Sensitive collections
 * (enquiries, applications, settings, users) live under /admin/*.
 */
export const apiRouter = Router();

apiRouter.get('/health', (req, res) => res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } }));

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/capabilities', capabilityRoutes);
apiRouter.use('/certifications', certificationRoutes);
apiRouter.use('/facilities', facilityRoutes);
apiRouter.use('/leadership', leadershipRoutes);
apiRouter.use('/news', newsRoutes);
apiRouter.use('/gallery', galleryRoutes);
apiRouter.use('/careers', careerRoutes);
apiRouter.use('/pages', pagesPublic);
apiRouter.use('/enquiries', enquiriesPublic);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/settings', settingsPublic);

apiRouter.use('/admin/pages', pagesAdmin);
apiRouter.use('/admin/enquiries', enquiriesAdmin);
apiRouter.use('/admin/applications', applicationRoutes);
apiRouter.use('/admin/settings', settingsAdmin);
apiRouter.use('/admin/media', mediaRoutes);
apiRouter.use('/admin/users', userRoutes);
apiRouter.use('/admin/dashboard', dashboardRoutes);
