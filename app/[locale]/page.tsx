import Link from 'next/link';

export default function HomePage({ params }: { params: { locale: string } }) {
  const estArabe = params.locale === 'ar';
  
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(2rem, 5vw, 4rem)',
        color: 'white',
        textAlign: 'center',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: '800', marginBottom: '0.75rem' }}>
            {estArabe ? 'مرحبا بكم في المكتبة الإلكترونية' : 'Bienvenue à la Bibliothèque de Massaguet'}
          </h1>
          <p style={{ fontSize: 'clamp(0.875rem, 1.25vw, 1.125rem)', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            {estArabe 
              ? 'منصة تعليمية مفتوحة لجميع طلاب وطالبات مسقّط' 
              : 'Une plateforme éducative ouverte à tous les étudiants de Massaguet'}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>200+</div>
          <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{estArabe ? 'وثيقة' : 'Documents'}</div>
        </div>
        <div className="card animate-fade-in" style={{ textAlign: 'center', animationDelay: '0.2s' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>50+</div>
          <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{estArabe ? 'طالب' : 'Étudiants'}</div>
        </div>
        <div className="card animate-fade-in" style={{ textAlign: 'center', animationDelay: '0.4s' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>100%</div>
          <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{estArabe ? 'مجاني' : 'Gratuit'}</div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--gray-800)' }}>
          {estArabe ? '📚 ماذا نقدم؟' : '📚 Ce que nous offrons'}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="card animate-slide-in">
            <div style={{
              width: '48px',
              height: '48px',
              background: '#e0e7ff',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.375rem' }}>
              {estArabe ? 'رفع سهل' : 'Upload facile'}
            </h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              {estArabe ? 'شارك مستنداتك في ثواني' : 'Partagez vos documents en quelques secondes'}
            </p>
          </div>

          <div className="card animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#d1fae5',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.375rem' }}>
              {estArabe ? 'بحث متقدم' : 'Recherche avancée'}
            </h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              {estArabe ? 'ابحث عن أي وثيقة بسرعة' : 'Recherchez n\'importe quel document rapidement'}
            </p>
          </div>

          <div className="card animate-slide-in" style={{ animationDelay: '0.4s' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#fef3c7',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.375rem' }}>
              {estArabe ? 'مكتبة آمنة' : 'Bibliothèque sécurisée'}
            </h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              {estArabe ? 'مستنداتك محمية' : 'Vos documents sont protégés'}
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(2rem, 4vw, 3rem)',
        textAlign: 'center',
        border: '1px solid var(--gray-200)'
      }}>
        <h2 style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', fontWeight: '700', color: 'var(--gray-800)', marginBottom: '0.75rem' }}>
          {estArabe ? 'جاهز للمشاركة؟' : 'Prêt à partager ?'}
        </h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
          {estArabe 
            ? 'انضم إلى مجتمع Massaguet التعليمي' 
            : 'Rejoignez la communauté éducative de Massaguet'}
        </p>
        <Link 
          href={`/${params.locale}/upload`}
          className="btn btn-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16m8-8H4" />
          </svg>
          {estArabe ? 'مشاركة وثيقة' : 'Partager un document'}
        </Link>
      </section>
    </div>
  );
}
