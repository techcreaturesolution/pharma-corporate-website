import { Link } from 'react-router-dom';
import { Icon, Img } from './ui.jsx';

export default function ProductCard({ product }) {
  return (
    <article className="card product-card">
      <Link to={`/products/${product.slug}`} aria-label={product.name}>
        <Img image={product.image} alt={product.name} />
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          {product.productCode && <span>Code: {product.productCode}</span>}
          {product.casNumber && <span>CAS: {product.casNumber}</span>}
        </div>
        <h3>
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.category?.name && <span className="badge">{product.category.name}</span>}
        {product.shortDescription && <p className="meta">{product.shortDescription}</p>}
        <Link to={`/products/${product.slug}`} className="link">
          View details <Icon name="arrow" />
        </Link>
      </div>
    </article>
  );
}
