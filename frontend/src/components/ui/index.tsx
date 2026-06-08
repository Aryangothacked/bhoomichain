import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── UI COMPONENTS ─────────────────────────────────────────────────────────────

export const Badge = ({ children, variant = 'primary', className }: any) => {
  const base = "badge-base";
  const variants = {
    primary: "badge-primary",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    gray: "badge-gray",
    CLEAR: "badge-success",
    DISPUTED: "badge-warning",
    UNDER_LIEN: "badge-primary",
    COURT_FREEZE: "badge-danger",
  };
  
  const v = variants[variant as keyof typeof variants] || variants.gray;
  
  return <span className={cn(base, v, className)}>{children}</span>;
};

export const Spinner = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} style={{ width: '20px', height: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close">
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, message }: any) => (
  <div className="bc-card empty-state">
    <div className="empty-icon-wrapper">
      {Icon && <Icon className="empty-icon" />}
    </div>
    <h3 className="empty-title">{title}</h3>
    <p className="empty-message">{message}</p>
  </div>
);

export const PageHeader = ({ title, description, badge }: any) => (
  <div className="page-header">
    <div className="page-header-top">
      <h2 className="page-title">{title}</h2>
      {badge && <Badge variant="primary">{badge}</Badge>}
    </div>
    <p className="page-description">{description}</p>
  </div>
);
