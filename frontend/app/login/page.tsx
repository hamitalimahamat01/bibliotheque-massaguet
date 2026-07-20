'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Icons } from '@/components/Icons';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { login, user } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();

  // Google est toujours actif maintenant
  const isGoogleConfigured = true;

  useEffect(() => {
    console.log('🔐 Page de connexion chargée');
    if (user || session?.user) {
      router.push('/dashboard');
    }
  }, [user, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email ou mot de passe incorrect');
        return;
      }

      toast.success('Connexion réussie !');
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      console.log('🚀 Tentative de connexion Google...');
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
      console.log('📝 Résultat Google:', result);
    } catch (error) {
      console.error('❌ Erreur Google:', error);
      toast.error('Erreur lors de la connexion avec Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 auth-gradient">
      <div className="w-full max-w-[440px] animate-slide-up">
        {/* Logo et titre */}
        <div className="text-center mb-10">
          <div className="logo-float inline-block">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] flex items-center justify-center mx-auto shadow-xl shadow-[#1a1a2e]/10">
              <Icons.Book className="w-10 h-10 text-white/90" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-5 tracking-tight">
            Bibliothèque Massaguet
          </h1>
          <p className="text-sm text-gray-400 mt-1.5 tracking-wide">
            {isLoginMode ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        {/* Carte principale */}
        <div className="auth-card rounded-3xl p-8 shine">
          {/* Bouton Google - TOUJOURS AFFICHÉ */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 auth-btn-secondary rounded-2xl font-medium text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:border-gray-300"
          >
            {googleLoading ? (
              <div className="flex items-center gap-3">
                <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Connexion en cours...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0181818,0 12,0 C7.27090909,0 3.19745455,2.69832727 1.23954545,6.65072727 L5.26620003,9.76452941 Z" />
                  <path fill="#34A853" d="M16.0407265,18.0125889 C14.9509165,18.7163006 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698198,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970141 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573892 19.8344019,20.9997513 L16.0407265,18.0125889 Z" />
                  <path fill="#4A90E2" d="M19.8344019,20.9997513 C22.0291677,18.9528514 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407265,18.0125889 L19.8344019,20.9997513 Z" />
                  <path fill="#FBBC05" d="M5.27698198,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23954545,6.65072727 C0.43658727,8.26043158 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698198,14.2678769 Z" />
                </svg>
                <span>Continuer avec Google</span>
              </>
            )}
          </button>

          {/* Séparateur */}
          <div className="auth-divider my-6">
            <span className="text-xs text-gray-400 font-medium tracking-wider uppercase px-2 bg-transparent">
              ou
            </span>
          </div>

          {/* Formulaire email/password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icons.Email className="w-4 h-4 text-gray-300" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 auth-input rounded-2xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="exemple@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 auth-input rounded-2xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 auth-btn-primary rounded-2xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Bas de carte */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
              {' '}
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-gray-600 font-medium hover:text-gray-800 transition-colors"
              >
                {isLoginMode ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400/60 tracking-wide">
            Bibliothèque Massaguet • Accès sécurisé
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-400/40">
            <span>🔐 Chiffré</span>
            <span>•</span>
            <span>🛡️ Sécurisé</span>
            <span>•</span>
            <span>📚 Éducatif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
