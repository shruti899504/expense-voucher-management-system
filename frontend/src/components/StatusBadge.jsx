export default function StatusBadge({ status }) {
  const labels = { DRAFT: 'Draft', PENDING_APPROVAL: 'Pending approval', APPROVED: 'Approved', REJECTED: 'Rejected' };
  return <span className={`status-badge status-${status?.toLowerCase()}`}>{labels[status] || status}</span>;
}
