import Link from 'next/link';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const estArabe = params.locale === 'ar';
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--gray-200)',
        padding: '0.875rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)',
        background: 'rgba(255,255,255,0.85)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link href={`/${params.locale}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--gray-900)',
            fontWeight: '700',
            fontSize: '1.25rem'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Bibliothèque</span>
            <span style={{ fontSize: '0.625rem', background: '#e0e7ff', color: '#4f46e5', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>
              Massaguet
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href={`/${params.locale}`} style={{ color: 'var(--gray-600)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500', transition: 'color 0.2s' }}>
              {estArabe ? 'الرئيسية' : 'Accueil'}
            </Link>
            <Link href={`/${params.locale}/bibliotheque`} style={{ color: 'var(--gray-600)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500', transition: 'color 0.2s' }}>
              {estArabe ? 'المكتبة' : 'Bibliothèque'}
            </Link>
            <Link href={`/${params.locale}/prepa`} style={{ color: 'var(--gray-600)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500', transition: 'color 0.2s' }}>
              {estArabe ? 'التحضيري BEF/BAC' : 'Prépa BEF/BAC'}
            </Link>
            <Link href={`/${params.locale}/upload`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: 'var(--primary)',
              color: 'white',
              padding: '0.375rem 1rem',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16m8-8H4" />
              </svg>
              {estArabe ? 'مشاركة' : 'Partager'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container" style={{ flex: 1, paddingTop: '2rem', paddingBottom: '2rem' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'white',
        borderTop: '1px solid var(--gray-200)',
        padding: '2rem 1.5rem',
        textAlign: 'center'
      }}>
        <div className="container">
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            © 2026 Bibliothèque de Massaguet - Créée par les étudiants de Massaguet
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
            <span>📚 Partager</span>
            <span>🤝 Communauté</span>
            <span>📖 Apprendre</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
