import { useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Sections from '../components/Sections.jsx';
import { Loader, ErrorState, PageHeader } from '../components/ui.jsx';
import { usePage } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

/** Generic CMS page renderer (privacy policy, terms, custom pages). */
export default function StaticPage({ slug: fixedSlug }) {
  const params = useParams();
  const slug = fixedSlug || params.slug;
  const { data, isLoading, isError, error } = usePage(slug);
  if (isLoading) return <Loader full />;
  if (isError) return error?.response?.status === 404 ? <NotFound /> : <ErrorState error={error} />;
  const p = data.data;
  return (
    <>
      <Seo title={p.title} seo={p.seo} />
      <PageHeader title={p.title} crumbs={[{ label: p.title }]} />
      <Sections sections={p.sections} />
    </>
  );
}
