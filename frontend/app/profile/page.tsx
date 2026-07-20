'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { booksApi } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [userBooks, setUserBooks] = useState<any[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Connectez-vous</h2>
        <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700">
          Se connecter
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ name, bio });
      setIsEditing(false);
    } catch (error) {
      // Erreur déjà gérée par le contexte
    } finally {
      setLoading(false);
    }
  };

  const loadUserBooks = async () => {
    if (userBooks.length > 0) {
      setUserBooks([]);
      return;
    }
    setLoadingBooks(true);
    try {
      const res: any = await booksApi.getAll({ uploadedBy: user.id });
      setUserBooks(res.data.books || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoadingBooks(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-white/80">{user.email}</p>
              <p className="text-white/60 text-sm mt-1">
                Rôle: {user.role} • Membre depuis{' '}
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-8">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Parlez-nous de vous..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Mon profil</h2>
                  {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500">Documents partagés</p>
                  <p className="text-2xl font-bold text-gray-800">{user.documentsCount || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500">Rôle</p>
                  <p className="text-2xl font-bold text-gray-800 capitalize">{user.role.toLowerCase()}</p>
                </div>
              </div>

              {/* Mes documents */}
              <div className="mt-8">
                <button
                  onClick={loadUserBooks}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-medium"
                >
                  {loadingBooks ? (
                    <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                  {userBooks.length > 0 ? 'Masquer mes documents' : 'Voir mes documents'}
                </button>

                {userBooks.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {userBooks.map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{book.title}</p>
                          <p className="text-sm text-gray-500">par {book.author}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">⬇️ {book.downloads}</span>
                          <Link href={`/books/${book.id}`} className="text-indigo-600 hover:text-indigo-800">
                            Voir
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Déconnexion */}
              <button
                onClick={logout}
                className="mt-8 text-red-600 hover:text-red-700 flex items-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
