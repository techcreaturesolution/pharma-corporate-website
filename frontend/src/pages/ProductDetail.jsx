import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { Loader, PageHeader, Img, RichHtml, Icon } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';
import { assetUrl } from '../lib/api.js';
import NotFound from './NotFound.jsx';

const TECH_LABELS = {
  molecularFormula: 'Molecular formula',
  molecularWeight: 'Molecular weight',
  grade: 'Grade',
  purity: 'Purity / Assay',
  appearance: 'Appearance',
  storageConditions: 'Storage conditions',
  packaging: 'Packaging',
  shelfLife: 'Shelf life',
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useApi(`/products/${slug}`);
  const product = data?.data;
  const related = useApi(`/products/related/${product?._id}`, { limit: 4 }, { enabled: Boolean(product?._id) });
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (product?.redirectTo) navigate(product.redirectTo, { replace: true });
  }, [product, navigate]);

  if (isLoading) return <Loader full />;
  if (isError && error?.response?.status === 404) return <NotFound />;
  if (isError || !product || product.redirectTo) return <Loader full />;

  const images = [product.image, ...(product.gallery || [])].filter((i) => i?.url);
  const current = active || images[0];
  const tech = Object.entries(product.technicalInformation || {}).filter(([, v]) => v);
  const category = product.category;

  return (
    <>
      <Seo
        title={product.name}
        description={product.shortDescription || `${product.name}${product.productCode ? ` (${product.productCode})` : ''} — product details, specifications and enquiry.`}
        image={product.image?.url}
        seo={product.seo}
        type="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          sku: product.productCode,
          description: product.shortDescription,
          image: product.image?.url ? assetUrl(product.image.url) : undefined,
          category: category?.name,
        }}
      />
      <PageHeader title={product.name} crumbs={[{ label: 'Products', to: '/products' }, ...(category ? [{ label: category.name, to: `/products?category=${category.slug}` }] : []), { label: product.name }]} />
      <section className="section">
        <div className="container product-detail">
          <div>
            <Img image={current} className="product-detail__img" alt={product.name} />
            {images.length > 1 && (
              <div className="thumbs">
                {images.map((img, i) => (
                  <img key={i} src={assetUrl(img.url)} alt={img.alt || ''} className={img === current ? 'active' : ''} onClick={() => setActive(img)} />
                ))}
              </div>
            )}
          </div>
          <div>
            {category && (
              <Link to={`/products?category=${category.slug}`} className="badge">
                {category.name}
              </Link>
            )}
            <h2 style={{ marginTop: '.5rem' }}>{product.name}</h2>
            {product.shortDescription && <p className="lead">{product.shortDescription}</p>}
            <table className="spec">
              <tbody>
                {product.productCode && (
                  <tr>
                    <th>Product code</th>
                    <td>{product.productCode}</td>
                  </tr>
                )}
                {product.casNumber && (
                  <tr>
                    <th>CAS number</th>
                    <td>{product.casNumber}</td>
                  </tr>
                )}
                {product.therapeuticArea && (
                  <tr>
                    <th>Therapeutic area</th>
                    <td>{product.therapeuticArea}</td>
                  </tr>
                )}
                {tech.map(([k, v]) => (
                  <tr key={k}>
                    <th>{TECH_LABELS[k] || k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href="#enquiry" className="btn btn--primary">
              Enquire about this product <Icon name="arrow" />
            </a>

            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'overview'} className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
                Overview
              </button>
              {product.applications?.length > 0 && (
                <button role="tab" aria-selected={tab === 'applications'} className={tab === 'applications' ? 'active' : ''} onClick={() => setTab('applications')}>
                  Applications
                </button>
              )}
              {product.documents?.length > 0 && (
                <button role="tab" aria-selected={tab === 'documents'} className={tab === 'documents' ? 'active' : ''} onClick={() => setTab('documents')}>
                  Documents
                </button>
              )}
            </div>
            {tab === 'overview' && <RichHtml html={product.description} />}
            {tab === 'applications' && (
              <ul>
                {product.applications.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            )}
            {tab === 'documents' && (
              <ul className="doc-list">
                {product.documents.map((d, i) => (
                  <li key={i}>
                    <a href={assetUrl(d.url)} target="_blank" rel="noopener noreferrer" className="link">
                      <Icon name="download" /> {d.title || 'Document'}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="section section--alt" id="enquiry">
        <div className="container container--narrow">
          <div className="section__head">
            <h2 className="section__title">Product enquiry</h2>
            <p className="lead">Tell us about your requirement and our team will get back to you.</p>
          </div>
          <EnquiryForm type="product" product={product} />
        </div>
      </section>

      {related.data?.data?.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__head">
              <h2 className="section__title">Related products</h2>
            </div>
            <div className="grid grid--4">
              {related.data.data.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
