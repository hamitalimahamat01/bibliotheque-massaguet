'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage({ params }: { params: { locale: string } }) {
  const estArabe = params.locale === 'ar';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'authentification
    if (email && password) {
      setIsAuthenticated(true);
      setShowLogin(false);
      setUser({ name: email.split('@')[0], email });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setEmail('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in">
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#e0e7ff',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-800)' }}>
              {estArabe ? 'تسجيل الدخول مطلوب' : 'Connexion requise'}
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              {estArabe 
                ? 'يجب تسجيل الدخول لمشاركة وثيقة' 
                : 'Vous devez vous connecter pour partager un document'}
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem', color: 'var(--gray-700)' }}>
                  {estArabe ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={estArabe ? 'exemple@email.com' : 'exemple@email.com'}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem', color: 'var(--gray-700)' }}>
                  {estArabe ? 'كلمة المرور' : 'Mot de passe'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {estArabe ? 'تسجيل الدخول' : 'Se connecter'}
              </button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center' }}>
              {estArabe 
                ? '🔐 Connexion sécurisée - Bibliothèque de Massaguet' 
                : '🔐 Connexion sécurisée - Bibliothèque de Massaguet'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* User info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'white',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius)',
        marginBottom: '2rem',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#e0e7ff',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          {estArabe ? 'تسجيل الخروج' : 'Déconnexion'}
        </button>
      </div>

      {/* Upload form */}
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: '700', color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
          {estArabe ? '📤 مشاركة وثيقة' : '📤 Partager un document'}
        </h1>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
          {estArabe 
            ? 'املأ النموذج لمشاركة وثيقتك مع مجتمع Massaguet' 
            : 'Remplissez le formulaire pour partager votre document avec la communauté Massaguet'}
        </p>

        <form className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem', color: 'var(--gray-700)' }}>
              {estArabe ? 'عنوان الوثيقة' : 'Titre du document'} *
            </label>
            <input
              type="text"
              placeholder={estArabe ? 'مثال: Cours de mathématiques' : 'Ex: Cours de mathématiques'}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem', color: 'var(--gray-700)' }}>
              {estArabe ? 'المؤلف' : 'Auteur'} *
            </label>
            <input
              type="text"
              placeholder={estArabe ? 'اسمك' : 'Votre nom'}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem', color: 'var(--gray-700)' }}>
              {estArabe ? 'الوصف' : 'Description'}
            </label>
            <textarea
              rows={4}
              placeholder={estArabe ? 'Description du document...' : 'Description du document...'}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem', color: 'var(--gray-700)' }}>
              {estArabe ? 'الفئة' : 'Catégorie'} *
            </label>
            <select style={{
              width: '100%',
              padding: '0.625rem 1rem',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              background: 'white'
            }}>
              <option value="general">{estArabe ? 'المكتبة العامة' : 'Bibliothèque générale'}</option>
              <option value="prepa">Prépa BEF/BAC</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem', color: 'var(--gray-700)' }}>
              {estArabe ? 'الملف' : 'Fichier'} *
            </label>
            <div style={{
              border: '2px dashed var(--gray-300)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              transition: 'border-color 0.2s',
              cursor: 'pointer'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }}>
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                {estArabe ? 'اسحب وأفلت الملف هنا أو' : 'Glissez-déposez votre fichier ici ou'}
                <br />
                <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>
                  {estArabe ? 'اختر ملف' : 'Parcourir'}
                </span>
              </p>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                PDF, DOCX, PPT (max 50MB)
              </p>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v16m8-8H4" />
            </svg>
            {estArabe ? 'مشاركة الوثيقة' : 'Partager le document'}
          </button>
        </form>
      </div>
    </div>
  );
}
