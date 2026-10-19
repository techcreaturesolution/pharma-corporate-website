/**
 * Navigation configuration for the Admin dashboard.
 * Groups modules into top-level sections: Dashboard, Catalog, Content, Recruitment, Leads, System.
 * Each section specifies which paths it matches and the sub-links to display in the floating capsule sidebar.
 */

export const NAV_SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'layout',
    primaryPath: '/admin',
    matchPrefixes: ['/admin'],
    exact: true,
    subLinks: [
      { path: '/admin', label: 'Dashboard Overview', icon: 'layout', exact: true },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    icon: 'box',
    primaryPath: '/admin/products',
    matchPrefixes: ['/admin/products', '/admin/categories'],
    subLinks: [
      { path: '/admin/products', label: 'Products', icon: 'box' },
      { path: '/admin/categories', label: 'Categories', icon: 'layers' },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: 'book',
    primaryPath: '/admin/pages',
    matchPrefixes: [
      '/admin/pages',
      '/admin/capabilities',
      '/admin/certifications',
      '/admin/facilities',
      '/admin/leadership',
      '/admin/news',
      '/admin/gallery',
      '/admin/media',
    ],
    subLinks: [
      { path: '/admin/pages', label: 'Pages', icon: 'book' },
      { path: '/admin/capabilities', label: 'Capabilities', icon: 'activity' },
      { path: '/admin/certifications', label: 'Certifications', icon: 'award' },
      { path: '/admin/facilities', label: 'Facilities', icon: 'factory' },
      { path: '/admin/leadership', label: 'Leadership', icon: 'users' },
      { path: '/admin/news', label: 'News & Articles', icon: 'newspaper' },
      { path: '/admin/gallery', label: 'Media Gallery', icon: 'image' },
      { path: '/admin/media', label: 'Media Library', icon: 'folder' },
    ],
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: 'briefcase',
    primaryPath: '/admin/careers',
    matchPrefixes: ['/admin/careers', '/admin/applications'],
    subLinks: [
      { path: '/admin/careers', label: 'Vacancies', icon: 'briefcase' },
      { path: '/admin/applications', label: 'Applications', icon: 'mail', role: 'admin' },
    ],
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: 'message-square',
    primaryPath: '/admin/enquiries',
    matchPrefixes: ['/admin/enquiries'],
    role: 'admin',
    subLinks: [
      { path: '/admin/enquiries', label: 'Enquiries', icon: 'message-square', role: 'admin' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: 'settings',
    primaryPath: '/admin/settings',
    matchPrefixes: ['/admin/settings', '/admin/users', '/admin/profile'],
    subLinks: [
      { path: '/admin/settings', label: 'Site Settings', icon: 'settings', role: 'admin' },
      { path: '/admin/users', label: 'Users', icon: 'users', role: 'superadmin' },
      { path: '/admin/profile', label: 'My Account', icon: 'user' },
    ],
  },
];

/**
 * Returns the matching section id ('dashboard' | 'catalog' | 'content' | 'recruitment' | 'leads' | 'system')
 * for the current URL pathname.
 */
export function getSectionFromPathname(pathname) {
  if (!pathname || pathname === '/admin' || pathname === '/admin/') {
    return 'dashboard';
  }
  if (pathname.startsWith('/admin/products') || pathname.startsWith('/admin/categories')) {
    return 'catalog';
  }
  if (
    pathname.startsWith('/admin/pages') ||
    pathname.startsWith('/admin/capabilities') ||
    pathname.startsWith('/admin/certifications') ||
    pathname.startsWith('/admin/facilities') ||
    pathname.startsWith('/admin/leadership') ||
    pathname.startsWith('/admin/news') ||
    pathname.startsWith('/admin/gallery') ||
    pathname.startsWith('/admin/media')
  ) {
    return 'content';
  }
  if (pathname.startsWith('/admin/careers') || pathname.startsWith('/admin/applications')) {
    return 'recruitment';
  }
  if (pathname.startsWith('/admin/enquiries')) {
    return 'leads';
  }
  if (
    pathname.startsWith('/admin/settings') ||
    pathname.startsWith('/admin/users') ||
    pathname.startsWith('/admin/profile')
  ) {
    return 'system';
  }
  return 'dashboard';
}
