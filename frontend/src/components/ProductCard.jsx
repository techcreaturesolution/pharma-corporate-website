import { Link } from 'react-router-dom';
import { Icon, Img } from './ui.jsx';

export default function ProductCard({ product }) {
  return (
    <article className="card product-card">
      <Link to={`/products/${product.slug}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', color: 'inherit' }}>
        <Img image={product.image} alt={product.name} />
        <div className="product-card__body">
          <h3>{product.name}</h3>
          {product.shortDescription && <p className="meta" style={{ margin: 0 }}>{product.shortDescription}</p>}
        </div>
      </Link>
    </article>
  );
}
