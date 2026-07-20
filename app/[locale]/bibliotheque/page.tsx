import Link from 'next/link';

export default function BibliothequePage({ params }: { params: { locale: string } }) {
  const estArabe = params.locale === 'ar';
  
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '700', color: 'var(--gray-800)' }}>
          {estArabe ? '📚 المكتبة العامة' : '📚 Bibliothèque générale'}
        </h1>
        <p style={{ color: 'var(--gray-500)' }}>
          {estArabe 
            ? 'استكشف جميع الوثائق المتاحة' 
            : 'Explorez tous les documents disponibles'}
        </p>
      </div>

      {/* Search bar */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <input
            type="text"
            placeholder={estArabe ? 'بحث عن وثيقة...' : 'Rechercher un document...'}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
            onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
          />
          <svg style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--gray-400)'
          }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <button className="btn btn-primary">
          {estArabe ? 'بحث' : 'Rechercher'}
        </button>
      </div>

      {/* Documents list */}
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        border: '1px dashed var(--gray-300)'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-4" />
          <path d="M12 9v.01" />
        </svg>
        <p style={{ color: 'var(--gray-400)', marginBottom: '1rem' }}>
          {estArabe ? 'لا توجد وثائق حاليا' : 'Aucun document disponible pour le moment'}
        </p>
        <Link 
          href={`/${params.locale}/upload`}
          className="btn btn-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16m8-8H4" />
          </svg>
          {estArabe ? 'مشاركة وثيقة' : 'Partager un document'}
        </Link>
      </div>
    </div>
  );
}
