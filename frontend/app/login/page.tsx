'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/profile');
    }
  }, [status, router]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', {
        callbackUrl: '/profile',
        redirect: true,
      });
    } catch (error) {
      console.error('Erreur Google:', error);
      toast.error('Erreur lors de la connexion avec Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 auth-gradient">
      <div className="w-full max-w-[440px] animate-slide-up">
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
            Connectez-vous à votre compte
          </p>
        </div>

        <div className="auth-card rounded-3xl p-8 shine">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 auth-btn-secondary rounded-2xl font-medium text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {googleLoading ? (
              <>
                <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0181818,0 12,0 C7.27090909,0 3.19745455,2.69832727 1.23954545,6.65072727 L5.26620003,9.76452941 Z" />
                  <path fill="#34A853" d="M16.0407265,18.0125889 C14.9509165,18.7163006 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698198,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970141 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573892 19.8344019,20.9997513 L16.0407265,18.0125889 Z" />
                  <path fill="#4A90E2" d="M19.8344019,20.9997513 C22.0291677,18.9528514 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407265,18.0125889 L19.8344019,20.9997513 Z" />
                  <path fill="#FBBC05" d="M5.27698198,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23954545,6.65072727 C0.43658727,8.26043158 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698198,14.2678769 Z" />
                </svg>
                Continuer avec Google
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Bibliothèque Massaguet • Accès sécurisé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
