import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Icon, Img } from './ui.jsx';
import { useSettings } from '../lib/hooks.js';
import './success-modal.css';

/**
 * Professional Corporate Success Modal with Animated Tick Mark and Site Logo.
 * Renders into document.body via Portal to prevent z-index/overflow clipping.
 */
export default function SuccessModal({
  isOpen,
  onClose,
  data = {},
  badge = 'Application Submitted',
  title = 'Application Received!',
  primaryAction,
  secondaryAction,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const { data: settingsData } = useSettings();
  const company = settingsData?.data?.company || {};

  // Close with smooth exit transition
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 200);
  }, [onClose]);

  // Keyboard navigation (Escape key to dismiss) & scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const {
    applicantName = '',
    jobTitle = '',
    department = '',
    email = '',
    referenceId = '',
    message = '',
  } = data || {};

  const modalContent = (
    <div
      className={`success-modal-overlay ${isClosing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      onClick={handleClose}
    >
      <div
        className="success-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with Site Logo & Close Button */}
        <div className="success-modal-header">
          <div className="success-modal-brand">
            {company.logo?.url ? (
              <Img
                image={company.logo}
                className="success-modal-brand-logo"
                alt={company.name || 'BioPharma Care'}
              />
            ) : (
              <div className="success-modal-brand-mark">+</div>
            )}
            <div className="success-modal-brand-info">
              <span className="success-modal-brand-title">
                {company.navTitle || company.name || 'BioPharma Care'}
              </span>
              {company.navSmallText ? (
                <span className="success-modal-brand-sub">{company.navSmallText}</span>
              ) : (
                <span className="success-modal-brand-sub">Pharmaceuticals & Healthcare</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="success-modal-close-btn"
            aria-label="Close modal"
            onClick={handleClose}
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="success-modal-body">
          {/* Professional Animated Tick Mark */}
          <div className="success-modal-icon-wrapper" aria-hidden="true">
            <div className="success-modal-ripple" />
            <div className="success-modal-icon-disc">
              <svg
                className="success-checkmark-svg"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Smooth Circle Outline Drawing */}
                <circle
                  className="success-circle-path"
                  cx="26"
                  cy="26"
                  r="23"
                />
                {/* Crisp Bold Tick Mark Check Drawing */}
                <path
                  className="success-check-path"
                  d="M15 27 L22.5 34.5 L37 19"
                />
              </svg>
            </div>
          </div>

          {/* Status Badge */}
          <div className="success-modal-badge">
            <Icon name="check" />
            <span>{badge}</span>
          </div>

          {/* Main Title */}
          <h2 id="success-modal-title" className="success-modal-title">
            {title}
          </h2>

          {/* Contextual Description */}
          <p className="success-modal-desc">
            {applicantName ? (
              jobTitle ? (
                <>
                  Thank you, <strong>{applicantName}</strong>! Your application for{' '}
                  <strong>{jobTitle}</strong> has been successfully submitted to{' '}
                  {company.name || 'BioPharma Care'}.
                </>
              ) : (
                <>
                  Thank you, <strong>{applicantName}</strong>! Your submission has been
                  successfully received by {company.name || 'BioPharma Care'}.
                </>
              )
            ) : (
              message || `Your submission has been successfully received by ${company.name || 'BioPharma Care'}.`
            )}
          </p>

          {/* Details Summary Card */}
          {(jobTitle || department || email || referenceId) && (
            <div className="success-modal-summary">
              {jobTitle && (
                <div className="success-modal-summary-row">
                  <span className="success-modal-summary-label">Position / Role:</span>
                  <span className="success-modal-summary-val">{jobTitle}</span>
                </div>
              )}
              {department && (
                <div className="success-modal-summary-row">
                  <span className="success-modal-summary-label">Department:</span>
                  <span className="success-modal-summary-val">{department}</span>
                </div>
              )}
              {email && (
                <div className="success-modal-summary-row">
                  <span className="success-modal-summary-label">Confirmation To:</span>
                  <span className="success-modal-summary-val">{email}</span>
                </div>
              )}
              {referenceId && (
                <div className="success-modal-summary-row">
                  <span className="success-modal-summary-label">Reference ID:</span>
                  <span className="success-modal-summary-val success-modal-summary-val--highlight">
                    #{String(referenceId).slice(-8).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reassurance note */}
          <div className="success-modal-notice">
            <Icon name="shield" />
            <span>
              {jobTitle
                ? 'Our talent acquisition and HR team will review your profile and contact you if shortlisted for further evaluation.'
                : 'Our support and technical team will review your enquiry and contact you as soon as possible.'}
            </span>
          </div>

          {/* Actions */}
          <div className="success-modal-actions">
            {secondaryAction ? (
              <button
                type="button"
                className="success-modal-btn success-modal-btn--secondary"
                onClick={() => {
                  if (secondaryAction.onClick) {
                    secondaryAction.onClick();
                  } else {
                    handleClose();
                  }
                }}
              >
                {secondaryAction.label || 'Close'}
              </button>
            ) : (
              <button
                type="button"
                className="success-modal-btn success-modal-btn--secondary"
                onClick={handleClose}
              >
                <span>Close</span>
              </button>
            )}

            {primaryAction ? (
              primaryAction.to ? (
                <Link
                  to={primaryAction.to}
                  className="success-modal-btn success-modal-btn--primary"
                  onClick={handleClose}
                >
                  <span>{primaryAction.label}</span>
                  <Icon name="arrow" />
                </Link>
              ) : (
                <button
                  type="button"
                  className="success-modal-btn success-modal-btn--primary"
                  onClick={() => {
                    primaryAction.onClick?.();
                    handleClose();
                  }}
                >
                  <span>{primaryAction.label}</span>
                  <Icon name="arrow" />
                </button>
              )
            ) : (
              <Link
                to="/careers"
                className="success-modal-btn success-modal-btn--primary"
                onClick={handleClose}
              >
                <span>Explore Openings</span>
                <Icon name="arrow" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
