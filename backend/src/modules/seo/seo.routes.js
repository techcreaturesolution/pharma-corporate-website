import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { Product } from '../products/product.model.js';
import { Category } from '../categories/category.model.js';
import { News } from '../news/news.model.js';
import { Job } from '../careers/job.model.js';
import { Page } from '../pages/page.model.js';
import { Capability } from '../capabilities/capability.model.js';
import { Facility } from '../facilities/facility.model.js';

const STATIC_ROUTES = ['', '/about', '/products', '/capabilities', '/quality', '/facilities', '/leadership', '/news', '/gallery', '/careers', '/contact'];

const escapeXml = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

const url = (loc, lastmod, priority = '0.6') =>
  `<url><loc>${escapeXml(`${env.publicSiteUrl}${loc}`)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}<priority>${priority}</priority></url>`;

const sitemap = async (req, res) => {
  const [products, categories, news, jobs, pages, capabilities, facilities] = await Promise.all([
    Product.find({ status: 'published' }).select('slug updatedAt').lean(),
    Category.find({ status: 'active' }).select('slug updatedAt').lean(),
    News.find({ status: 'published' }).select('slug updatedAt').lean(),
    Job.find({ status: 'open' }).select('slug updatedAt').lean(),
    Page.find({ status: 'published', 'seo.noIndex': { $ne: true } }).select('slug updatedAt').lean(),
    Capability.find({ status: 'published' }).select('slug updatedAt').lean(),
    Facility.find({ status: 'published' }).select('slug updatedAt').lean(),
  ]);

  const entries = [
    ...STATIC_ROUTES.map((r) => url(r, null, r === '' ? '1.0' : '0.8')),
    ...pages.filter((p) => !['home', 'about'].includes(p.slug)).map((p) => url(`/pages/${p.slug}`, p.updatedAt, '0.5')),
    ...categories.map((c) => url(`/products?category=${c.slug}`, c.updatedAt, '0.7')),
    ...products.map((p) => url(`/products/${p.slug}`, p.updatedAt, '0.8')),
    ...capabilities.map((c) => url(`/capabilities/${c.slug}`, c.updatedAt)),
    ...facilities.map((f) => url(`/facilities/${f.slug}`, f.updatedAt)),
    ...news.map((n) => url(`/news/${n.slug}`, n.updatedAt)),
    ...jobs.map((j) => url(`/careers/${j.slug}`, j.updatedAt)),
  ];

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  return res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`);
};

const robots = (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${env.publicSiteUrl}/sitemap.xml\n`);
};

const router = Router();
router.get('/sitemap.xml', asyncHandler(sitemap));
router.get('/robots.txt', robots);

export default router;
