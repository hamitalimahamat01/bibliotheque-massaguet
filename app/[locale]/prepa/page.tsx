import Link from 'next/link';

export default function PrepaPage({ params }: { params: { locale: string } }) {
  const estArabe = params.locale === 'ar';
  
  return (
    <div className="animate-fade-in">
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(2rem, 4vw, 3rem)',
        color: 'white',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            BEF
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            BAC
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '700' }}>
          {estArabe ? '🎓 فضاء التحضيري BEF/BAC' : '🎓 Espace Prépa BEF/BAC'}
        </h1>
        <p style={{ opacity: 0.9, fontSize: 'clamp(0.875rem, 1.1vw, 1.125rem)', maxWidth: '560px', margin: '0 auto' }}>
          {estArabe 
            ? 'وثائق خاصة بطلاب BEF و BAC : anciens sujets, sujets corrigés, cours et exercices' 
            : 'Documents pour les élèves de BEF et BAC : anciens sujets, sujets corrigés, cours et exercices'}
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        <select style={{
          padding: '0.625rem 1rem',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)',
          background: 'white',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}>
          <option value="">{estArabe ? 'جميع الصفوف' : 'Toutes les classes'}</option>
          <option value="bef">BEF</option>
          <option value="bac">BAC</option>
        </select>
        <select style={{
          padding: '0.625rem 1rem',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)',
          background: 'white',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}>
          <option value="">{estArabe ? 'جميع المواد' : 'Toutes les matières'}</option>
          <option value="math">Mathématiques</option>
          <option value="physique">Physique</option>
          <option value="chimie">Chimie</option>
          <option value="anglais">Anglais</option>
        </select>
        <button className="btn btn-success">
          {estArabe ? 'تصفية' : 'Filtrer'}
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
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <p style={{ color: 'var(--gray-400)', marginBottom: '1rem' }}>
          {estArabe ? 'لا توجد وثائق حاليا' : 'Aucun document disponible pour le moment'}
        </p>
        <Link 
          href={`/${params.locale}/upload`}
          className="btn btn-success"
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
