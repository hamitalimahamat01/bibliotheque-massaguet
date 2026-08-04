'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { getImageUrl, formatFileSize } from '@/lib/optimize';
import toast from 'react-hot-toast';

interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  subCategory: string;
  subject: string;
  fileType?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  coverUrl: string;
  year: string;
  downloads: number;
  views: number;
  createdAt: string;
  uploadedBy?: { id: string; name: string; email: string };
  uploaded_by_name?: string;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    category: '',
    subCategory: '',
    subject: '',
    year: '',
  });

  const bookId = params?.id as string;

  useEffect(() => {
    if (!bookId) {
      setError('ID du document manquant');
      setLoading(false);
      return;
    }
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await booksApi.getById(bookId);
      console.log('📖 Réponse API:', res.data);
      
      if (res.data?.book) {
        const bookData = res.data.book;
        setBook(bookData);
        setFormData({
          title: bookData.title || '',
          description: bookData.description || '',
          author: bookData.author || '',
          category: bookData.category || 'general',
          subCategory: bookData.subCategory || '',
          subject: bookData.subject || '',
          year: bookData.year || '',
        });
      } else {
        setError('Document non trouvé');
        toast.error('Document non trouvé');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement livre:', error);
      setError(error?.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!book) return;
    
    setDownloading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bibliotheque-backend-wfkn.onrender.com';
      const response = await fetch(`${baseUrl}/api/books/${book.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      console.log('📥 Réponse téléchargement:', data);
      
      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        toast.success('Téléchargement démarré !');
      } else {
        toast.error('URL de téléchargement non disponible');
      }
    } catch (error: any) {
      console.error('❌ Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  // 🔥 Modifier le document
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    try {
      const response = await booksApi.update(book.id, formData);
      if (response.data?.success) {
        toast.success('Document mis à jour !');
        setIsEditing(false);
        loadBook(); // Recharger les données
      }
    } catch (error: any) {
      console.error('❌ Erreur mise à jour:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  // 🔥 Supprimer le document
  const handleDelete = async () => {
    if (!book) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await booksApi.delete(book.id);
      if (response.data?.success) {
        toast.success('Document supprimé !');
        router.push('/books');
      }
    } catch (error: any) {
      console.error('❌ Erreur suppression:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // Vérifier si l'utilisateur est le propriétaire ou admin
  const canEdit = user && book && (user.id === book.uploadedBy?.id || user.role === 'ADMIN');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icons.Book className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Document non trouvé</h2>
        <p className="text-gray-400 mb-6">{error || 'Le document que vous recherchez n\'existe pas ou a été supprimé.'}</p>
        <Link href="/books" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
          <Icons.ArrowLeft className="w-4 h-4" />
          Retour à la bibliothèque
        </Link>
      </div>
    );
  }

  const coverImageUrl = getImageUrl(book.coverUrl);
  const hasCover = coverImageUrl && coverImageUrl.length > 0;

  const fileType = book.fileType || 'pdf';
  const fileTypeUpper = fileType.toUpperCase();

  const getFileIcon = () => {
    const icons: Record<string, string> = {
      pdf: '📄',
      docx: '📝',
      ppt: '📊',
      pptx: '📊',
    };
    return icons[fileType] || '📄';
  };

  const getFileTypeLabel = () => {
    const labels: Record<string, string> = {
      pdf: 'PDF',
      docx: 'Word',
      ppt: 'PowerPoint',
      pptx: 'PowerPoint',
    };
    return labels[fileType] || fileTypeUpper;
  };

  const formattedDate = book.createdAt 
    ? new Date(book.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date inconnue';

  const uploadedByName = book.uploadedBy?.name || book.uploaded_by_name || 'Anonyme';

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Accueil</Link>
        <span className="text-gray-300">›</span>
        <Link href="/books" className="hover:text-indigo-600 transition-colors">Bibliothèque</Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{book.title}</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100/50">
        {!isEditing ? (
          // 🔥 Vue normale
          <div className="grid md:grid-cols-3 gap-0">
            <div className="md:col-span-1 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 flex items-center justify-center min-h-[300px]">
              <div className="aspect-[3/4] w-full max-w-sm rounded-2xl bg-white shadow-lg overflow-hidden flex items-center justify-center relative">
                {hasCover ? (
                  <img
                    src={coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center p-6 text-center">
                            <span class="text-6xl mb-4">${getFileIcon()}</span>
                            <span class="text-sm font-bold px-4 py-2 rounded-full bg-indigo-100 text-indigo-700">
                              ${getFileTypeLabel()}
                            </span>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-6xl mb-4">{getFileIcon()}</span>
                    <span className="text-sm font-bold px-4 py-2 rounded-full bg-indigo-100 text-indigo-700">
                      {getFileTypeLabel()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 p-8 md:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                    {book.title}
                  </h1>
                  <p className="text-gray-500 mt-2 flex items-center gap-2">
                    <Icons.User className="w-4 h-4" />
                    <span><span className="font-medium">Auteur :</span> {book.author || 'Anonyme'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    {book.category === 'prepa' ? 'Prépa' : 'Général'}
                  </span>
                  {book.subCategory && (
                    <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium uppercase">
                      {book.subCategory}
                    </span>
                  )}
                </div>
              </div>

              {book.description && (
                <div className="bg-gray-50 rounded-xl p-5 my-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                {book.subject && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 uppercase">Matière</p>
                    <p className="font-medium text-gray-700">{book.subject}</p>
                  </div>
                )}
                {book.year && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 uppercase">Année</p>
                    <p className="font-medium text-gray-700">{book.year}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 uppercase">Téléchargements</p>
                  <p className="font-medium text-gray-700">{book.downloads || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 uppercase">Vues</p>
                  <p className="font-medium text-gray-700">{book.views || 0}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 p-4 bg-gray-50 rounded-xl">
                <span className="flex items-center gap-2">
                  <Icons.File className="w-4 h-4" />
                  {getFileTypeLabel()}
                </span>
                <span className="w-px h-4 bg-gray-300" />
                <span className="flex items-center gap-2">
                  <Icons.Clock className="w-4 h-4" />
                  Publié le {formattedDate}
                </span>
                {book.fileSize > 0 && (
                  <>
                    <span className="w-px h-4 bg-gray-300" />
                    <span className="flex items-center gap-2">
                      <Icons.HardDrive className="w-4 h-4" />
                      {formatFileSize(book.fileSize)}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Téléchargement en cours...
                  </>
                ) : (
                  <>
                    <Icons.Download className="w-6 h-6" />
                    Télécharger le document
                  </>
                )}
              </button>

              <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2 flex-wrap">
                <span>Partagé par :</span>
                <span className="font-medium text-gray-500">{uploadedByName}</span>
                <span className="text-gray-300">•</span>
                <span>Fichier : {book.fileName || 'Document'}</span>
              </div>

              {/* 🔥 Boutons Modifier / Supprimer */}
              {canEdit && (
                <div className="mt-4 flex gap-3 justify-center">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-medium"
                  >
                    <Icons.Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Icons.Trash className="w-4 h-4" />
                        Supprimer
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // 🔥 Formulaire d'édition
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Modifier le document</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                  >
                    <option value="general">Bibliothèque générale</option>
                    <option value="prepa">Prépa BEF/BAC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                  >
                    <option value="">Aucune</option>
                    <option value="bef">BEF</option>
                    <option value="bac">BAC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ex: Mathématiques"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2024-2025"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Icons.Save className="w-5 h-5 inline mr-2" />
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    loadBook();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
