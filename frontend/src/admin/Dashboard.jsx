import { Link } from 'react-router-dom';
import { useApi, formatDate } from '../lib/hooks.js';
import { Loader, ErrorState, Badge, statusTone } from '../components/ui.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Dashboard() {
  const { data, isLoading, isError, error } = useApi('/admin/dashboard/stats', undefined, { staleTime: 0 });
  const { isAdmin } = useAuth();
  if (isLoading) return <Loader />;
  if (isError) return <ErrorState error={error} />;
  const { counts, recentEnquiries, recentApplications } = data.data;

  const cards = [
    ['Published products', counts.publishedProducts, '/admin/products'],
    ['Draft products', counts.draftProducts, '/admin/products?status=draft'],
    ['Categories', counts.categories, '/admin/categories'],
    ['Published news', counts.publishedNews, '/admin/news'],
    ['Open vacancies', counts.openJobs, '/admin/careers'],
    ...(isAdmin
      ? [
          ['New enquiries', counts.newEnquiries, '/admin/enquiries?status=new'],
          ['Total enquiries', counts.totalEnquiries, '/admin/enquiries'],
          ['New applications', counts.newApplications, '/admin/applications?status=received'],
        ]
      : []),
  ];

  return (
    <>
      <h1 className="mb">Dashboard</h1>
      <div className="stat-grid">
        {cards.map(([label, value, to]) => (
          <Link to={to} key={label} className="stat-card">
            <strong>{value}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>
      {isAdmin && (
        <div className="two-col">
          <div className="panel">
            <h3>Recent enquiries</h3>
            {recentEnquiries.length === 0 && <p className="muted">No enquiries yet.</p>}
            <table className="admin-table">
              <tbody>
                {recentEnquiries.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <strong>{e.name}</strong>
                      <br />
                      <small className="muted">{e.company || e.type}{e.productName ? ` · ${e.productName}` : ''}</small>
                    </td>
                    <td>
                      <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                    </td>
                    <td className="muted">{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/admin/enquiries" className="link">View all</Link>
          </div>
          <div className="panel">
            <h3>Recent applications</h3>
            {recentApplications.length === 0 && <p className="muted">No applications yet.</p>}
            <table className="admin-table">
              <tbody>
                {recentApplications.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <strong>{a.name}</strong>
                      <br />
                      <small className="muted">{a.jobId?.title}</small>
                    </td>
                    <td>
                      <Badge tone={statusTone(a.status)}>{a.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="muted">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/admin/applications" className="link">View all</Link>
          </div>
        </div>
      )}
    </>
  );
}
