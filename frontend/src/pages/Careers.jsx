import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Icon } from '../components/ui.jsx';
import { useApi, formatDate } from '../lib/hooks.js';

const getDepartmentIcon = (dept = '') => {
  const d = dept.toLowerCase();
  if (d.includes('quality') || d.includes('qc') || d.includes('qa')) return 'flask';
  if (d.includes('research') || d.includes('r&d') || d.includes('formulation') || d.includes('science')) return 'flask';
  if (d.includes('production') || d.includes('manufacturing')) return 'factory';
  if (d.includes('regulatory') || d.includes('compliance')) return 'shield';
  return 'briefcase';
};

const getExcerpt = (html = '', fallback = '') => {
  if (!html) return fallback;
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length > 130) return text.substring(0, 130) + '…';
  return text || fallback;
};

export default function Careers() {
  const { data, isLoading, isError, error } = useApi('/careers', { limit: 50 });
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const jobs = useMemo(() => data?.data || [], [data]);

  // Extract unique departments
  const departments = useMemo(() => {
    const list = jobs.map((j) => j.department).filter(Boolean);
    return ['all', ...Array.from(new Set(list))];
  }, [jobs]);

  // Filter jobs by search and selected department
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesDept = selectedDept === 'all' || j.department === selectedDept;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        j.title?.toLowerCase().includes(term) ||
        j.department?.toLowerCase().includes(term) ||
        j.location?.toLowerCase().includes(term) ||
        j.experience?.toLowerCase().includes(term) ||
        j.qualification?.toLowerCase().includes(term);
      return matchesDept && matchesSearch;
    });
  }, [jobs, selectedDept, search]);

  return (
    <div className="careers-page">
      <Seo title="Careers & Vacancies" description="Explore current job openings and build your pharmaceutical career with BioPharma Care." />
      <PageHeader
        title="Careers & Opportunities"
        subtitle="Join our passionate team of scientists, technicians, and healthcare professionals shaping global pharmaceutical standards."
        crumbs={[{ label: 'Careers' }]}
      />

      <section className="section">
        <div className="container">
          {isLoading && <Loader />}
          {isError && <ErrorState error={error} />}

          {!isLoading && !isError && jobs.length === 0 && (
            <EmptyState
              title="No open positions right now"
              text="We currently do not have any active vacancies listed. Please check back soon or send your spontaneous CV."
            />
          )}

          {!isLoading && !isError && jobs.length > 0 && (
            <>
              {/* Search & Filtering Toolbar */}
              <div className="careers-toolbar">
                <div className="careers-toolbar__top">
                  <div className="careers-search">
                    <Icon name="search" />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search positions, qualifications, locations…"
                      aria-label="Search job positions"
                    />
                  </div>

                  <div className="careers-count">
                    <span>Showing</span>
                    <strong>{filteredJobs.length}</strong>
                    <span>{filteredJobs.length === 1 ? 'Opportunity' : 'Opportunities'}</span>
                  </div>
                </div>

                {departments.length > 2 && (
                  <div className="careers-dept-filters" role="tablist" aria-label="Filter by department">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        role="tab"
                        aria-selected={selectedDept === dept}
                        className={`careers-dept-pill ${selectedDept === dept ? 'active' : ''}`}
                        onClick={() => setSelectedDept(dept)}
                      >
                        {dept === 'all' ? 'All Departments' : dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* No results for current filter */}
              {filteredJobs.length === 0 && (
                <EmptyState
                  title="No matching roles found"
                  text="Try adjusting your search criteria or clear your department filter to see all openings."
                />
              )}

              {/* Modern Job Cards Grid */}
              <div className="careers-grid">
                {filteredJobs.map((j) => (
                  <article key={j._id} className="job-card">
                    {/* Corner blob decoration */}
                    <div className="job-card__corner-blob" aria-hidden="true">
                      <span>Hiring</span>
                    </div>

                    <div>
                      {/* Top Badges */}
                      <div className="job-card__header">
                        <div className="job-card__tags">
                          {j.department && (
                            <span className="job-badge job-badge--dept">
                              <Icon name={getDepartmentIcon(j.department)} />
                              {j.department}
                            </span>
                          )}
                          {j.employmentType && (
                            <span className="job-badge job-badge--type">
                              {j.employmentType}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Job Title */}
                      <h3 className="job-card__title">
                        <Link to={`/careers/${j.slug}`}>{j.title}</Link>
                      </h3>

                      {/* Key Specs */}
                      <div className="job-card__specs">
                        {j.location && (
                          <div className="job-spec" title="Job Location">
                            <Icon name="pin" />
                            <span>{j.location}</span>
                          </div>
                        )}
                        {j.experience && (
                          <div className="job-spec" title="Required Experience">
                            <Icon name="briefcase" />
                            <span>{j.experience}</span>
                          </div>
                        )}
                        {j.qualification && (
                          <div className="job-spec" title="Minimum Qualification">
                            <Icon name="award" />
                            <span>{j.qualification}</span>
                          </div>
                        )}
                        {j.closingDate && (
                          <div className="job-spec job-spec--closing" title="Application Deadline">
                            <Icon name="calendar" />
                            <span>Apply by {formatDate(j.closingDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Brief description snippet */}
                      <p className="job-card__snippet">
                        {getExcerpt(
                          j.description,
                          'Join our team to contribute towards rigorous pharmaceutical manufacturing, analytical testing, and quality assurance.',
                        )}
                      </p>
                    </div>

                    {/* Card Footer with Apply CTA */}
                    <div className="job-card__footer">
                      <span className="job-card__foot-meta">
                        {j.employmentType || 'Full-time'}
                      </span>
                      <Link to={`/careers/${j.slug}`} className="job-card__cta">
                        <span>View & Apply</span>
                        <Icon name="arrow" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* Perks & Workplace Culture Banner */}
          <div className="careers-perks">
            <div className="careers-perks__header">
              <h2>Why Build Your Career With Us?</h2>
              <p>
                We foster a collaborative culture grounded in scientific integrity, continuous learning, and state-of-the-art pharmaceutical technology.
              </p>
            </div>

            <div className="careers-perks__grid">
              <div className="careers-perk-card">
                <div className="careers-perk-card__icon">
                  <Icon name="flask" />
                </div>
                <h4>Cutting-Edge Science</h4>
                <p>Work with world-class analytical instrumentation and innovative API synthesis processes.</p>
              </div>

              <div className="careers-perk-card">
                <div className="careers-perk-card__icon">
                  <Icon name="shield" />
                </div>
                <h4>Global cGMP Standards</h4>
                <p>Gain hands-on experience in regulatory compliance adhering to USFDA, WHO, and EU guidelines.</p>
              </div>

              <div className="careers-perk-card">
                <div className="careers-perk-card__icon">
                  <Icon name="award" />
                </div>
                <h4>Career Growth & Mentorship</h4>
                <p>Structured career progression pathways, leadership programs, and ongoing technical development.</p>
              </div>

              <div className="careers-perk-card">
                <div className="careers-perk-card__icon">
                  <Icon name="users" />
                </div>
                <h4>Safety & Well-being</h4>
                <p>Safety-first work culture with competitive compensation, health insurance, and work-life balance.</p>
              </div>
            </div>
          </div>

          {/* Spontaneous Application Banner */}
          <div className="careers-spontaneous">
            <div className="careers-spontaneous__text">
              <h3>Don’t see a matching position?</h3>
              <p>
                We are always seeking passionate chemists, engineers, and healthcare professionals. Send your CV to our talent team.
              </p>
            </div>
            <Link to="/contact" className="btn btn--primary careers-spontaneous__btn">
              <span>Contact Talent Team</span>
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
