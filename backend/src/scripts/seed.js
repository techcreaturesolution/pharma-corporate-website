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
const sampleJobs = [
  {
    slug: 'quality-control-analyst',
    title: 'Quality Control Analyst',
    department: 'Quality',
    location: 'City, Country',
    employmentType: 'Full-time',
    experience: '2–4 years',
    qualification: 'B.Sc / M.Sc Chemistry or B.Pharm',
    description: '<p>Perform rigorous instrumental analysis of raw materials, in-process samples, and finished APIs using HPLC, GC, and UV-Vis spectrophotometry adhering to international pharmacopoeial standards.</p>',
    responsibilities: [
      'Execute routine and non-routine testing of raw materials and finished pharmaceutical formulations',
      'Maintain, calibrate, and troubleshoot analytical instrumentation (HPLC, GC, UV-Vis)',
      'Prepare and review analytical method validation protocols and reports',
      'Ensure strict compliance with cGMP, GLP, and data integrity protocols'
    ],
    requirements: [
      'Bachelor or Master degree in Chemistry, Pharmacy, or related field',
      '2–4 years proven hands-on QC laboratory experience in a cGMP environment',
      'Thorough knowledge of ICH guidelines, USP, EP, and IP monographs'
    ],
    status: 'open',
  },
  {
    slug: 'formulation-rd-scientist',
    title: 'Formulation R&D Scientist',
    department: 'Research & Development',
    location: 'R&D Center, Innovation Park',
    employmentType: 'Full-time',
    experience: '3–6 years',
    qualification: 'M.Pharm / Ph.D. in Pharmaceutics',
    description: '<p>Lead pre-formulation and formulation development of oral solid dosages and injectable pharmaceutical products from laboratory scale to pilot scale.</p>',
    responsibilities: [
      'Design, execute, and evaluate formulation trials for solid oral dosage forms and modified-release products',
      'Conduct compatibility studies, accelerated stability studies, and stress testing',
      'Prepare comprehensive product development reports (PDR) and scale-up documentation',
      'Collaborate with analytical R&D for robust method validation and transfer'
    ],
    requirements: [
      'M.Pharm in Pharmaceutics or Ph.D. in Pharmaceutical Sciences',
      '3–6 years of demonstrated experience in formulation development',
      'Strong expertise in granulation, compression, coating, and characterization techniques'
    ],
    status: 'open',
  },
  {
    slug: 'production-executive-api',
    title: 'Production Executive — API',
    department: 'Manufacturing',
    location: 'Main Manufacturing Facility',
    employmentType: 'Full-time',
    experience: '2–5 years',
    qualification: 'B.Tech Chemical / M.Sc Chemistry',
    description: '<p>Oversee daily chemical synthesis and batch processing operations in modern cGMP Active Pharmaceutical Ingredient (API) production blocks.</p>',
    responsibilities: [
      'Supervise shop-floor chemical reactions, crystallization, filtration, and drying operations',
      'Execute and audit Batch Manufacturing Records (BMR) and equipment logs in real-time',
      'Enforce occupational health, environmental safety (EHS), and cleanroom sanitation protocols',
      'Participate in deviation investigations, root-cause analyses, and CAPA implementation'
    ],
    requirements: [
      'B.Tech / B.E. in Chemical Engineering or M.Sc in Organic Chemistry',
      '2–5 years experience in bulk drug / API manufacturing plants',
      'Hands-on familiarity with DCS / PLC automated reactors and containment systems'
    ],
    status: 'open',
  },
  {
    slug: 'regulatory-affairs-specialist',
    title: 'Regulatory Affairs Specialist',
    department: 'Regulatory Affairs',
    location: 'Corporate Office',
    employmentType: 'Full-time',
    experience: '4–7 years',
    qualification: 'B.Pharm / M.Pharm / Life Sciences',
    description: '<p>Author, review, and assemble regulatory dossiers (DMF, CTD/eCTD) for submission to domestic and global health authorities.</p>',
    responsibilities: [
      'Compile regulatory submissions for USFDA, EMA, WHO, and other regulated markets',
      'Coordinate across R&D, QC, and Production to collate compliant technical documentation',
      'Manage queries, deficiency letters, and lifecycle maintenance of approved dossiers',
      'Keep abreast of evolving global pharmaceutical regulations and guidelines'
    ],
    requirements: [
      'B.Pharm / M.Pharm or relevant Life Sciences postgraduate degree',
      '4–7 years in pharmaceutical regulatory affairs for regulated markets',
      'Proficiency in eCTD compilation software and document management systems'
    ],
    status: 'open',
  },
];
for (const j of sampleJobs) {
  await upsert(Job, { slug: j.slug }, j);
}
await upsert(GalleryItem, { title: 'Facility exterior (placeholder)' }, {
  image: { url: 'https://placehold.co/800x600?text=Gallery', alt: 'Placeholder gallery image' }, category: 'Facilities', status: 'published',
});

console.log('Seed complete');
await disconnectDatabase();
