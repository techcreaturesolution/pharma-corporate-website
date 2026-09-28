import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendCreated } from '../../utils/ApiResponse.js';
import { env } from '../../config/env.js';
import { storage } from '../../config/storage.js';
import { sendEmail, renderTable } from '../../utils/email.js';
import { verifyCaptcha } from '../../utils/captcha.js';
import { validate, formLimiter, uploadResume, verifySignatures } from '../../middleware/index.js';
import { createCrudModule } from '../shared/crudFactory.js';
import { idParams } from '../shared/schemas.js';
import { Job } from './job.model.js';
import { Application } from '../applications/application.model.js';
import { createJobSchema, updateJobSchema, applicationBodySchema } from './career.validation.js';

const careerModule = createCrudModule({
  Model: Job,
  label: 'Vacancy',
  slugSource: 'title',
  statusValues: ['draft', 'open', 'closed', 'archived'],
  publicStatuses: ['open'],
  searchFields: ['title', 'department', 'location'],
  sortable: ['title', 'department', 'closingDate', 'createdAt'],
  defaultSort: '-createdAt',
  defaultLimit: 20,
  extraFilters: (query, filter) => {
    if (query.department) filter.department = query.department;
  },
  validation: { create: createJobSchema, update: updateJobSchema },
  beforeDelete: async (job) => {
    const count = await Application.countDocuments({ jobId: job._id });
    if (count > 0) throw ApiError.conflict(`Cannot delete vacancy with ${count} application(s). Archive it instead.`);
  },
});

const submitApplication = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Vacancy not found');
  if (!job.isAcceptingApplications()) throw ApiError.badRequest('This vacancy is no longer accepting applications');
  if (!req.file) throw ApiError.validation([{ field: 'resume', message: 'Resume file is required' }]);
  await verifyCaptcha(req.body.captchaToken, req.ip);

  const stored = await storage.save({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    visibility: 'private',
    folder: 'resumes',
  });

  const { captchaToken, ...fields } = req.body;
  const application = await Application.create({
    ...fields,
    jobId: job._id,
    resume: { key: stored.key, originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size },
    source: { ip: req.ip, userAgent: req.headers['user-agent'] },
  });

  sendEmail({
    to: env.careersEmail,
    subject: `New job application: ${job.title} — ${application.name}`,
    html: `<h2>New application received</h2>${renderTable([
      ['Position', job.title],
      ['Name', application.name],
      ['Email', application.email],
      ['Phone', application.phone],
      ['Qualification', application.qualification],
      ['Experience', application.experience],
      ['Cover letter', application.coverLetter],
      ['Resume', application.resume.originalName],
    ])}<p>Log in to the admin panel to download the resume.</p>`,
  });
  sendEmail({
    to: application.email,
    subject: `We received your application for ${job.title}`,
    html: `<p>Dear ${application.name},</p><p>Thank you for applying for the <strong>${job.title}</strong> position. Our HR team will review your application and contact you if your profile matches our requirements.</p>`,
  });

  return sendCreated(res, 'Application submitted successfully', {
    applicationId: application._id,
    status: application.status,
  });
};

careerModule.router.post(
  '/:id/applications',
  formLimiter,
  validate(idParams),
  uploadResume.single('resume'),
  verifySignatures,
  validate({ body: applicationBodySchema }),
  asyncHandler(submitApplication),
);

export default careerModule.router;
