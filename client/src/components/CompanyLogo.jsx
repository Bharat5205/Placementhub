import React from 'react';

export default function CompanyLogo({ logoUrl, companyName, size = 40, className = '' }) {
  const [error, setError] = React.useState(false);

  // Reset error state when logoUrl changes
  React.useEffect(() => {
    setError(false);
  }, [logoUrl]);

  const getFallbackGradient = (name) => {
    const code = (name || 'C').charCodeAt(0) % 5;
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    ];
    return gradients[code];
  };

  const getCleanUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('/uploads') || url.startsWith('data:')) {
      return url;
    }
    // Prefix relative logo names with the logos assets folder path
    return `/logos/${url}`;
  };

  const cleanUrl = getCleanUrl(logoUrl);

  if (!cleanUrl || error) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size <= 48 ? 10 : 14,
          background: getFallbackGradient(companyName),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: '#ffffff',
          fontSize: size * 0.45,
          textTransform: 'uppercase',
          flexShrink: 0,
          userSelect: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        title={companyName}
      >
        {companyName ? companyName.charAt(0) : 'C'}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size <= 48 ? 10 : 14,
        background: '#ffffff', // Clean white background like LinkedIn or Wellfound
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size * 0.15,
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}
    >
      <img
        src={cleanUrl}
        alt={companyName}
        onError={() => setError(true)}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
        loading="lazy"
      />
    </div>
  );
}
