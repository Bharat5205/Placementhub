import { Search, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ placeholder = 'Search...', onSearch, value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      <input
        className="input"
        style={{ paddingLeft: 38, paddingRight: value ? 36 : 14, width: '100%' }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch && onSearch(value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
