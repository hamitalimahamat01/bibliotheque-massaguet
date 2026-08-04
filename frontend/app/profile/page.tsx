'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await authApi.updateProfile(formData);
      if (response.data?.success && response.data?.user) {
        updateUser(response.data.user);
        toast.success('Profil mis à jour !');
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('❌ Erreur update:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Profil non trouvé</h2>
          <p className="text-gray-500 mb-6">Vous devez être connecté pour voir votre profil.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
              <Icons.Login className="w-4 h-4" />
              Se connecter
            </Link>
            <Link href="/register" className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors inline-flex items-center gap-2">
              <Icons.Register className="w-4 h-4" />
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const documentsCount = user.documents_count || 0;
  const progressToNextBadge = Math.min((documentsCount / 100) * 100, 100);
  const currentBadge = documentsCount >= 100 ? '🏆' : documentsCount >= 50 ? '🥈' : documentsCount >= 25 ? '🥉' : '🌟';
  const currentBadgeLabel = documentsCount >= 100 ? 'Légende' : documentsCount >= 50 ? 'Expert' : documentsCount >= 25 ? 'Contributeur' : 'Débutant';
  const nextBadgeLabel = documentsCount >= 100 ? '🏆 Légende' : `${100 - documentsCount} documents pour devenir Légende`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Bannière de progression */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 text-white mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 text-3xl">
              {currentBadge}
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentBadgeLabel}</h2>
              <p className="text-white/80 text-sm">
                {documentsCount} document{documentsCount > 1 ? 's' : ''} partagé{documentsCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80">Progression vers Légende</span>
              <span className="font-medium">{Math.min(documentsCount, 100)}/100</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${progressToNextBadge}%` }}
              />
            </div>
            <p className="text-xs text-white/70">{nextBadgeLabel}</p>
          </div>
        </div>
      </div>

      {/* Carte du profil */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100/50">
        <div className="p-6 md:p-8">
          {!isEditing ? (
            // Vue du profil
            <div className="space-y-6">
              {/* En-tête du profil */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 text-2xl">
                    {user.name?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5">
                      <Icons.Email className="w-3.5 h-3.5" />
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                      {user.role === 'ADMIN' ? 'Administrateur' : 'Membre'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-medium w-full sm:w-auto justify-center"
                >
                  <Icons.Edit className="w-4 h-4" />
                  Modifier
                </button>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 text-sm leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{documentsCount}</p>
                  <p className="text-xs text-gray-400">Documents</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{user.role === 'ADMIN' ? '👑' : '⭐'}</p>
                  <p className="text-xs text-gray-400">Rôle</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{currentBadge}</p>
                  <p className="text-xs text-gray-400">Badge</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {documentsCount >= 100 ? '🎯' : `${100 - documentsCount}`}
                  </p>
                  <p className="text-xs text-gray-400">Objectif</p>
                </div>
              </div>

              {/* Badges */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">🏅 Badges débloqués</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm flex items-center gap-1.5">
                    🌟 Débutant
                  </span>
                  {documentsCount >= 25 && (
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm flex items-center gap-1.5 border border-amber-200">
                      🥉 Contributeur
                    </span>
                  )}
                  {documentsCount >= 50 && (
                    <span className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm flex items-center gap-1.5 border border-gray-300">
                      🥈 Expert
                    </span>
                  )}
                  {documentsCount >= 100 && (
                    <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm flex items-center gap-1.5 border border-yellow-300">
                      🏆 Légende
                    </span>
                  )}
                  {documentsCount < 25 && (
                    <span className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-full text-sm flex items-center gap-1.5 border border-gray-200 border-dashed">
                      🔒 {25 - documentsCount} docs pour 🥉
                    </span>
                  )}
                  {documentsCount >= 25 && documentsCount < 50 && (
                    <span className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-full text-sm flex items-center gap-1.5 border border-gray-200 border-dashed">
                      🔒 {50 - documentsCount} docs pour 🥈
                    </span>
                  )}
                  {documentsCount >= 50 && documentsCount < 100 && (
                    <span className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-full text-sm flex items-center gap-1.5 border border-gray-200 border-dashed">
                      🔒 {100 - documentsCount} docs pour 🏆
                    </span>
                  )}
                </div>
              </div>

              {/* Déconnexion */}
              <button
                onClick={logout}
                className="w-full text-red-500 hover:text-red-700 transition-colors flex items-center justify-center gap-2 py-3 border border-red-200 rounded-xl hover:bg-red-50 text-sm font-medium"
              >
                <Icons.Logout className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          ) : (
            // Formulaire d'édition
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Icons.Save className="w-5 h-5" />
                      Enregistrer
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Appel à l'action */}
      {documentsCount < 100 && (
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-200 text-center">
          <p className="text-sm text-amber-800">
            🎯 Il te reste <span className="font-bold">{100 - documentsCount}</span> document{documentsCount > 1 ? 's' : ''} à partager pour devenir une <span className="font-bold">Légende</span> ! 
            <Link href="/books/upload" className="inline-block ml-2 text-indigo-600 font-medium hover:underline">
              Partager maintenant →
            </Link>
          </p>
        </div>
      )}

      {documentsCount >= 100 && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 border border-yellow-300 text-center">
          <p className="text-sm text-amber-800 font-medium">
            🏆 Félicitations ! Tu es une Légende de la bibliothèque Massaguet !
          </p>
        </div>
      )}
    </div>
  );
}
