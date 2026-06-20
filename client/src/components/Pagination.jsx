import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '20px 0' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn btn-secondary btn-icon"
        style={{ padding: '8px 10px' }}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
            background: p === page ? 'var(--accent)' : 'var(--bg-card)',
            color: p === page ? '#fff' : 'var(--text-secondary)',
            fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
          }}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="btn btn-secondary btn-icon"
        style={{ padding: '8px 10px' }}
      >
        <ChevronRight size={16} />
      </button>

      <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
