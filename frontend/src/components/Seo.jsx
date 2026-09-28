import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../lib/hooks.js';
import { assetUrl } from '../lib/api.js';

const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');

/**
 * Per-page SEO: title, description, canonical, Open Graph, optional JSON-LD.
 * Falls back to site-wide defaults from settings.
 */
export default function Seo({ title, description, image, seo, type = 'website', noIndex, jsonLd }) {
  const { data } = useSettings();
  const site = data?.data;
  const siteName = site?.company?.name || 'Pharma Company';
  const { pathname } = useLocation();

  const finalTitle = seo?.title || title;
  const fullTitle = finalTitle ? `${finalTitle} | ${siteName}` : site?.seo?.title || siteName;
  const desc = seo?.description || description || site?.seo?.description || '';
  const canonical = seo?.canonicalUrl || `${SITE_URL}${pathname}`;
  const ogImage = assetUrl(seo?.ogImage || image || site?.seo?.ogImage || site?.company?.logo?.url) || undefined;
  const robots = noIndex || seo?.noIndex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      {seo?.keywords?.length > 0 && <meta name="keywords" content={seo.keywords.join(', ')} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      {site?.analytics?.googleSiteVerification && <meta name="google-site-verification" content={site.analytics.googleSiteVerification} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
