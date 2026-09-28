/**
 * Seeds placeholder structure for local development: system pages, sample categories,
 * sample products and site settings. All copy is generic placeholder text and MUST be
 * replaced with client-approved content before go-live (no regulatory / efficacy claims).
 *
 *   npm run seed            # add missing records only
 *   SEED_RESET=1 npm run seed   # wipe content collections first (dev only)
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { Category } from '../modules/categories/category.model.js';
import { Product } from '../modules/products/product.model.js';
import { Page } from '../modules/pages/page.model.js';
import { Settings } from '../modules/settings/settings.model.js';
import { Capability } from '../modules/capabilities/capability.model.js';
import { Certification } from '../modules/certifications/certification.model.js';
import { Facility } from '../modules/facilities/facility.model.js';
import { Leader } from '../modules/leadership/leadership.model.js';
import { News } from '../modules/news/news.model.js';
import { Job } from '../modules/careers/job.model.js';
import { GalleryItem } from '../modules/gallery/gallery.model.js';
import { User } from '../modules/auth/user.model.js';

if (env.isProd && !process.env.SEED_ALLOW_PROD) {
  console.error('Refusing to seed in production. Set SEED_ALLOW_PROD=1 to override.');
  process.exit(1);
}

await connectDatabase();

if (process.env.SEED_RESET) {
  await Promise.all(
    [Category, Product, Page, Settings, Capability, Certification, Facility, Leader, News, Job, GalleryItem].map((M) =>
      M.deleteMany({}),
    ),
  );
  console.log('Content collections cleared');
}

const upsert = async (Model, where, data) => {
  const existing = await Model.findOne(where);
  if (existing) return existing;
  return Model.create({ ...where, ...data });
};

/* ---- Admin user (dev convenience) ---- */
if (!(await User.countDocuments())) {
  const admin = new User({ name: 'Site Admin', email: 'admin@example.com', role: 'superadmin' });
  await admin.setPassword(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe12345');
  await admin.save();
  console.log('Created dev superadmin admin@example.com / ChangeMe12345 — change immediately');
}

/* ---- Settings ---- */
await Settings.getSingleton();
await Settings.updateOne(
  { key: 'site' },
  {
    $set: {
      'company.name': 'Pharma Company',
      'company.tagline': 'Quality-driven pharmaceutical manufacturing',
      'company.description':
        'Placeholder company description. Replace with client-approved corporate profile text.',
      'contact.email': 'info@example.com',
      'contact.salesEmail': 'sales@example.com',
      'contact.careersEmail': 'careers@example.com',
      'contact.phone': '+00 000 000 0000',
      'contact.workingHours': 'Mon–Fri, 9:00–18:00',
      'contact.addresses': [
        { label: 'Head Office', line1: '123 Industrial Estate', city: 'City', country: 'Country' },
      ],
      'seo.title': 'Pharma Company — Pharmaceutical Manufacturer',
      'seo.description': 'Corporate website of Pharma Company. Products, capabilities, quality and careers.',
      'footer.disclaimer':
        'Product information on this website is intended for business-to-business audiences and does not constitute medical advice.',
    },
  },
);

/* ---- System pages ---- */
const systemPages = [
  {
    slug: 'home',
    title: 'Home',
    sections: [
      {
        type: 'hero',
        title: 'Advancing healthcare through quality manufacturing',
        subtitle: 'Placeholder hero copy — replace with approved messaging.',
        cta: { label: 'Explore Products', url: '/products' },
      },
      {
        type: 'stats',
        title: 'At a glance',
        items: [
          { title: 'Years of experience', value: '25+' },
          { title: 'Products', value: '150+' },
          { title: 'Countries served', value: '40+' },
          { title: 'Team members', value: '500+' },
        ],
      },
      {
        type: 'features',
        title: 'Why partner with us',
        items: [
          { title: 'Quality systems', description: 'Placeholder text.', icon: 'shield' },
          { title: 'Manufacturing scale', description: 'Placeholder text.', icon: 'factory' },
          { title: 'Regulatory support', description: 'Placeholder text.', icon: 'file' },
          { title: 'Global reach', description: 'Placeholder text.', icon: 'globe' },
        ],
      },
      { type: 'cta', title: 'Looking for a manufacturing partner?', cta: { label: 'Contact us', url: '/contact' } },
    ],
  },
  {
    slug: 'about',
    title: 'About Us',
    sections: [
      { type: 'richText', title: 'Company overview', content: '<p>Placeholder company overview.</p>' },
      {
        type: 'values',
        title: 'Mission, vision & values',
        items: [
          { title: 'Mission', description: 'Placeholder mission.' },
          { title: 'Vision', description: 'Placeholder vision.' },
          { title: 'Integrity', description: 'Placeholder value.' },
          { title: 'Quality', description: 'Placeholder value.' },
        ],
      },
      {
        type: 'timeline',
        title: 'Our journey',
        items: [
          { value: '2000', title: 'Founded', description: 'Placeholder milestone.' },
          { value: '2010', title: 'Expansion', description: 'Placeholder milestone.' },
          { value: '2020', title: 'New facility', description: 'Placeholder milestone.' },
        ],
      },
    ],
  },
  { slug: 'quality', title: 'Quality & Compliance', sections: [{ type: 'richText', title: 'Quality policy', content: '<p>Placeholder quality policy. Certifications listed below are managed in the admin panel.</p>' }] },
  { slug: 'privacy-policy', title: 'Privacy Policy', sections: [{ type: 'richText', content: '<p>Placeholder privacy policy — to be supplied by the client’s legal team.</p>' }] },
  { slug: 'terms', title: 'Terms of Use', sections: [{ type: 'richText', content: '<p>Placeholder terms of use.</p>' }] },
];
for (const p of systemPages) {
  await upsert(Page, { slug: p.slug }, { ...p, pageType: 'system', status: 'published', publishedAt: new Date() });
}

/* ---- Categories & products ---- */
const cats = [
  { name: 'Active Pharmaceutical Ingredients', slug: 'apis', description: 'Placeholder category description.' },
  { name: 'Intermediates', slug: 'intermediates', description: 'Placeholder category description.' },
  { name: 'Finished Formulations', slug: 'formulations', description: 'Placeholder category description.' },
];
const catDocs = {};
for (const [i, c] of cats.entries()) catDocs[c.slug] = await upsert(Category, { slug: c.slug }, { ...c, status: 'active', sortOrder: i });

const products = [
  { name: 'Sample API Alpha', productCode: 'API-001', casNumber: '50-78-2', categoryId: catDocs.apis._id, therapeuticArea: 'Analgesic', featured: true },
  { name: 'Sample API Beta', productCode: 'API-002', casNumber: '58-08-2', categoryId: catDocs.apis._id, therapeuticArea: 'CNS Stimulant', featured: true },
  { name: 'Sample Intermediate Gamma', productCode: 'INT-001', categoryId: catDocs.intermediates._id, therapeuticArea: 'Intermediate' },
  { name: 'Sample Tablet Delta', productCode: 'FF-001', categoryId: catDocs.formulations._id, therapeuticArea: 'Cardiovascular', featured: true },
];
for (const p of products) {
  await upsert(Product, { productCode: p.productCode }, {
    ...p,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    shortDescription: 'Placeholder short description. Replace with approved product text.',
    description: '<p>Placeholder product description. No efficacy or regulatory claims should appear here without client approval.</p>',
    applications: ['Placeholder application'],
    technicalInformation: { molecularFormula: 'TBD', grade: 'TBD' },
    status: 'published',
  });
}

/* ---- Other content ---- */
for (const [i, c] of ['API Manufacturing', 'Contract Manufacturing', 'R&D Services', 'Analytical Services'].entries()) {
  await upsert(Capability, { slug: c.toLowerCase().replace(/[^a-z0-9]+/g, '-') }, {
    title: c, summary: 'Placeholder capability summary.', description: '<p>Placeholder capability description.</p>', status: 'published', sortOrder: i,
  });
}
await upsert(Certification, { name: 'Sample Certification (placeholder)' }, {
  authority: 'Issuing body TBD', description: 'Placeholder — replace with actual, verifiable certification details.', status: 'draft',
});
await upsert(Facility, { slug: 'main-manufacturing-facility' }, {
  name: 'Main Manufacturing Facility', location: 'City, Country', type: 'Manufacturing', summary: 'Placeholder facility summary.', status: 'published',
});
await upsert(Leader, { name: 'Jane Doe' }, { designation: 'Managing Director', biography: 'Placeholder biography.', status: 'published', sortOrder: 0 });
await upsert(News, { slug: 'welcome-to-our-new-website' }, {
  title: 'Welcome to our new website', summary: 'Placeholder news summary.', content: '<p>Placeholder news content.</p>', status: 'published', publishedAt: new Date(),
});
await upsert(Job, { slug: 'quality-control-analyst' }, {
  title: 'Quality Control Analyst', department: 'Quality', location: 'City, Country', employmentType: 'Full-time', experience: '2–4 years',
  description: '<p>Placeholder job description.</p>', responsibilities: ['Placeholder responsibility'], requirements: ['Placeholder requirement'], status: 'open',
});
await upsert(GalleryItem, { title: 'Facility exterior (placeholder)' }, {
  image: { url: 'https://placehold.co/800x600?text=Gallery', alt: 'Placeholder gallery image' }, category: 'Facilities', status: 'published',
});

console.log('Seed complete');
await disconnectDatabase();
