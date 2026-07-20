import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.1,
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255,255,255,0.15)',
          padding: '0.5rem 1.5rem',
          borderRadius: '9999px',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: '500' }}>
            Bibliothèque en Ligne
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: '800',
          color: 'white',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          lineHeight: '1.1'
        }}>
          Bienvenue à la<br />
          <span style={{
            background: 'linear-gradient(to right, #fcd34d, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Bibliothèque de Massaguet</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '560px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.8'
        }}>
          Plateforme éducative créée par les étudiants de Massaguet pour partager et explorer des documents pédagogiques.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link
            href="/fr"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              color: '#4f46e5',
              padding: '0.875rem 2.5rem',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Français
          </Link>
          <Link
            href="/ar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: '0.875rem 2.5rem',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              border: '1px solid rgba(255,255,255,0.25)',
              transition: 'all 0.3s ease'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            العربية
          </Link>
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: '700', color: 'white', fontSize: '1.25rem', display: 'block' }}>200+</span>
            Documents
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: '700', color: 'white', fontSize: '1.25rem', display: 'block' }}>50+</span>
            Étudiants
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: '700', color: 'white', fontSize: '1.25rem', display: 'block' }}>100%</span>
            Gratuit
          </div>
        </div>
      </div>
    </div>
  );
}
