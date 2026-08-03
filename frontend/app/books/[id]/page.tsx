'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { getImageUrl } from '@/lib/optimize';
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
        window.open(book.fileUrl, '_blank');
        toast.success('Téléchargement démarré');
      }
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
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

  const coverImageUrl = getImageUrl(book.coverUrl);
  const hasCover = coverImageUrl && coverImageUrl.length > 0;

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
          <div className="md:col-span-1">
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center p-6 overflow-hidden">
              {hasCover ? (
                <img
                  src={coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <span class="text-7xl mb-4">${getFileIcon()}</span>
                        <span class="text-sm font-bold px-4 py-2 rounded-full bg-white/80 text-gray-700">
                          ${book.fileType.toUpperCase()}
                        </span>
                      `;
                    }
                  }}
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
      </div>
    </div>
  );
}
