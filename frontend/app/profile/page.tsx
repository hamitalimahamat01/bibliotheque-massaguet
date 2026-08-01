'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { booksApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  city?: string;
  birthDate?: string;
  documentsCount: number;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    city: '',
    birthDate: '',
    bio: '',
  });
  const [userBooks, setUserBooks] = useState<any[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [showRecognition, setShowRecognition] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProfile();
    loadUserBooks();
  }, [user, router]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        if (data.user.avatar) {
          setAvatarPreview(data.user.avatar);
        }
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          gender: data.user.gender || '',
          city: data.user.city || '',
          birthDate: data.user.birthDate || '',
          bio: data.user.bio || '',
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const loadUserBooks = async () => {
    setLoadingBooks(true);
    try {
      const res: any = await booksApi.getAll({ limit: 100 });
      const userBooks = res.data.books?.filter((b: any) => b.uploadedBy?.id === user?.id) || [];
      setUserBooks(userBooks);
    } catch (error) {
      console.error('Erreur chargement livres:', error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Mettre à jour les informations du profil
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast.success('Profil mis à jour avec succès');
        setIsEditing(false);
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Vérifier si l'utilisateur a atteint 200 livres
  useEffect(() => {
    if (profile && profile.documentsCount >= 200) {
      setShowRecognition(true);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Profil non trouvé</p>
      </div>
    );
  }

  const progressPercentage = Math.min((profile.documentsCount / 200) * 100, 100);
  const isRecognized = profile.documentsCount >= 200;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Lettre de reconnaissance */}
      {showRecognition && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Icons.Star className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-800">🎉 Félicitations !</h3>
              <p className="text-amber-700 text-sm mt-1">
                Vous avez atteint <strong>200 livres partagés</strong> ! 
                L'Union des étudiants de Massaguet vous adresse ses sincères remerciements 
                pour votre contribution exceptionnelle à la bibliothèque.
              </p>
              <div className="mt-3 p-3 bg-white/50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 italic">
                  "Votre engagement envers le partage du savoir est une inspiration pour toute la communauté. 
                  Merci de faire de Massaguet un lieu d'apprentissage et de partage."
                </p>
                <p className="text-xs text-amber-600 mt-1 text-right">
                  — L'Union des étudiants de Massaguet
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* En-tête avec photo de profil */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-6">
            {/* Photo de profil */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/30 shadow-lg bg-white/20 flex items-center justify-center">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Photo de profil"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white/80">
                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white/20 backdrop-blur-sm rounded-full p-1.5 border border-white/30 hover:bg-white/30 transition-colors"
                title="Changer la photo"
              >
                <Icons.Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-white/80 text-sm">{profile.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/20">
                  <Icons.Book className="w-3 h-3" />
                  {profile.documentsCount || 0} livres partagés
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
            >
              <Icons.Logout className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-8">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{profile.documentsCount || 0}</div>
              <div className="text-sm text-gray-500">Livres partagés</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{userBooks.length}</div>
              <div className="text-sm text-gray-500">Documents actifs</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {isRecognized ? '🏆' : `${Math.round(progressPercentage)}%`}
              </div>
              <div className="text-sm text-gray-500">
                {isRecognized ? 'Reconnu !' : 'Progression vers 200'}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Progression vers la reconnaissance</span>
              <span>{profile.documentsCount} / 200 livres</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  isRecognized ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            {isRecognized && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Icons.Star className="w-3 h-3" />
                Objectif atteint ! Vous êtes un membre exceptionnel.
              </p>
            )}
          </div>

          {/* Formulaire d'édition */}
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Informations personnelles</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 text-sm"
                >
                  <Icons.User className="w-4 h-4" />
                  Modifier
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {profile.firstName && (
                  <div>
                    <span className="text-gray-500">Prénom</span>
                    <p className="font-medium text-gray-800">{profile.firstName}</p>
                  </div>
                )}
                {profile.lastName && (
                  <div>
                    <span className="text-gray-500">Nom</span>
                    <p className="font-medium text-gray-800">{profile.lastName}</p>
                  </div>
                )}
                {profile.gender && (
                  <div>
                    <span className="text-gray-500">Sexe</span>
                    <p className="font-medium text-gray-800">
                      {profile.gender === 'M' ? 'Homme' : profile.gender === 'F' ? 'Femme' : 'Autre'}
                    </p>
                  </div>
                )}
                {profile.city && (
                  <div>
                    <span className="text-gray-500">Ville</span>
                    <p className="font-medium text-gray-800">{profile.city}</p>
                  </div>
                )}
                {profile.birthDate && (
                  <div>
                    <span className="text-gray-500">Date de naissance</span>
                    <p className="font-medium text-gray-800">
                      {new Date(profile.birthDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {profile.bio && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Bio</span>
                    <p className="font-medium text-gray-800">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mes livres */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Icons.Book className="w-5 h-5 text-indigo-600" />
                Mes livres partagés
                <span className="text-sm text-gray-400 font-normal">
                  ({userBooks.length})
                </span>
              </h2>
            </div>

            {loadingBooks ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : userBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Icons.Book className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                        {book.title}
                      </p>
                      <p className="text-xs text-gray-500">par {book.author}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Icons.Download className="w-3 h-3" />
                      {book.downloads || 0}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Icons.Book className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Vous n'avez pas encore partagé de livres</p>
                <Link
                  href="/books/upload"
                  className="inline-block mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Partager un document →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
