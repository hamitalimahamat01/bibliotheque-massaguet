'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    city: '',
    birthDate: '',
    bio: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Profil complété avec succès !');
      router.push('/');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      router.push('/');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSkipping(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.User className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Complétez votre profil</h1>
          <p className="text-gray-500 text-sm">
            Bienvenue {user.name || 'sur Massaguet'} ! 
            <span className="block text-xs text-gray-400 mt-1">
              Ces informations nous aideront à mieux vous connaître
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Sélectionnez...</option>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
              <option value="A">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Votre ville"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio (optionnel)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical"
              placeholder="Parlez-nous de vous..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin inline w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer mon profil'
              )}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={skipping}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {skipping ? 'Redirection...' : 'Passer pour l\'instant'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <Icons.Logout className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
