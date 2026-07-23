'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      console.log('Erreur de connexion:', errorParam);
      const errorMessages: Record<string, string> = {
        'OAuthSignin': 'Erreur lors de la connexion avec Google',
        'OAuthCallback': 'Erreur lors du callback Google',
        'OAuthCreateAccount': 'Impossible de créer le compte',
        'EmailCreateAccount': 'Impossible de créer le compte',
        'Callback': 'Erreur lors du callback',
        'OAuthAccountNotLinked': 'Ce compte est déjà lié à un autre fournisseur',
        'EmailSignin': 'Erreur lors de la connexion',
        'CredentialsSignin': 'Email ou mot de passe incorrect',
        'SessionRequired': 'Session requise',
        'default': 'Erreur de connexion'
      };
      setError(errorMessages[errorParam] || errorMessages.default);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Connexion</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <p className="text-gray-600 text-center mb-4">
          Connectez-vous avec votre compte Google
        </p>
        <a
          href="/api/auth/signin/google"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0181818,0 12,0 C7.27090909,0 3.19745455,2.69832727 1.23954545,6.65072727 L5.26620003,9.76452941 Z" />
            <path fill="#34A853" d="M16.0407265,18.0125889 C14.9509165,18.7163006 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698198,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970141 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573892 19.8344019,20.9997513 L16.0407265,18.0125889 Z" />
            <path fill="#4A90E2" d="M19.8344019,20.9997513 C22.0291677,18.9528514 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407265,18.0125889 L19.8344019,20.9997513 Z" />
            <path fill="#FBBC05" d="M5.27698198,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23954545,6.65072727 C0.43658727,8.26043158 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698198,14.2678769 Z" />
          </svg>
          Continuer avec Google
        </a>
        <p className="text-center text-xs text-gray-400 mt-4">
          Bibliothèque Massaguet • Connexion sécurisée
        </p>
      </div>
    </div>
  );
}
