'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import toast from 'react-hot-toast';

interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  subCategory: string;
  subject: string;
  fileType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  coverUrl: string;
  year: string;
  downloads: number;
  views: number;
  createdAt: string;
  uploadedBy: { id: string; name: string; email: string };
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadBook();
  }, [params.id]);

  const loadBook = async () => {
    setLoading(true);
    try {
      const res: any = await booksApi.getById(params.id as string);
      setBook(res.data.book);
    } catch (error) {
      console.error('Erreur chargement livre:', error);
      toast.error('Livre non trouvé');
      router.push('/books');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!book) return;
    try {
      const res: any = await booksApi.download(book.id);
      if (res.data.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
        toast.success('Téléchargement démarré');
      } else {
        // Fallback: ouvrir directement l'URL du fichier
        window.open(book.fileUrl, '_blank');
        toast.success('Téléchargement démarré');
      }
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Connectez-vous pour laisser un avis');
      return;
    }
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    setSubmittingReview(true);
    try {
      // Simuler l'ajout d'un avis
      toast.success('Avis ajouté avec succès');
      setRating(0);
      setComment('');
      loadBook();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600">Livre non trouvé</h2>
        <Link href="/books" className="text-indigo-600 hover:underline mt-4 inline-block">
          Retour à la bibliothèque
        </Link>
      </div>
    );
  }

  const getFileIcon = () => {
    const icons: Record<string, string> = {
      pdf: '📄',
      docx: '📝',
      ppt: '📊',
      pptx: '📊',
    };
    return icons[book.fileType] || '📄';
  };

  return (
    <div className="animate-fade-in">
      <Link href="/books" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-2 mb-6">
        <Icons.ArrowLeft className="w-5 h-5" />
        Retour à la bibliothèque
      </Link>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-3 gap-8 p-8">
          {/* Couverture */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center p-6">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <span className="text-7xl mb-4">{getFileIcon()}</span>
                  <span className="text-sm font-bold px-4 py-2 rounded-full bg-white/80 text-gray-700">
                    {book.fileType.toUpperCase()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Détails */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
            <p className="text-gray-500 mt-1">par {book.author}</p>

            {book.description && (
              <p className="text-gray-600 my-4 leading-relaxed">{book.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm my-4">
              {book.category && (
                <div>
                  <span className="text-gray-500">Catégorie</span>
                  <p className="font-medium capitalize">{book.category}</p>
                </div>
              )}
              {book.subCategory && (
                <div>
                  <span className="text-gray-500">Sous-catégorie</span>
                  <p className="font-medium uppercase">{book.subCategory}</p>
                </div>
              )}
              {book.subject && (
                <div>
                  <span className="text-gray-500">Matière</span>
                  <p className="font-medium">{book.subject}</p>
                </div>
              )}
              {book.year && (
                <div>
                  <span className="text-gray-500">Année</span>
                  <p className="font-medium">{book.year}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Téléchargements</span>
                <p className="font-medium">{book.downloads || 0}</p>
              </div>
              <div>
                <span className="text-gray-500">Vues</span>
                <p className="font-medium">{book.views || 0}</p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 mt-4"
            >
              <Icons.Download className="w-5 h-5" />
              Télécharger ({book.fileName || 'Document'})
            </button>
          </div>
        </div>

        {/* Avis */}
        <div className="border-t border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Avis</h2>

          {user ? (
            <form onSubmit={handleReview} className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-700 mb-3">Laisser un avis</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">Note :</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Votre commentaire (optionnel)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical"
                rows={3}
              />
              <button
                type="submit"
                disabled={submittingReview || rating === 0}
                className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-500">
                <Link href="/login" className="text-indigo-600 hover:underline">
                  Connectez-vous
                </Link>{' '}
                pour laisser un avis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
