import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <div className="not-found container">
      <Seo title="Page not found" noIndex />
      <h1>404</h1>
      <h2>Page not found</h2>
      <p className="lead">The page you are looking for does not exist or has been moved.</p>
      <p>
        <Link to="/" className="btn btn--primary">
          Back to home
        </Link>{' '}
        <Link to="/products" className="btn btn--ghost">
          Browse products
        </Link>
      </p>
    </div>
  );
}
