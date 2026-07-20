'use client';

import { useEffect, useState } from 'react';
import { booksApi, categoriesApi } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  fileType: string;
  downloads: number;
  views: number;
  createdAt: string;
  uploadedBy: { name: string };
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0, limit: 12 });
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
    loadBooks();
  }, [search, category, pagination.page]);

  const loadCategories = async () => {
    try {
      const res: any = await categoriesApi.getAll();
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (category) params.category = category;

      const res: any = await booksApi.getAll(params);
      setBooks(res.data.books || []);
      setPagination({
        ...pagination,
        total: res.data.pagination?.total || 0,
        pages: res.data.pagination?.pages || 0,
      });
    } catch (error) {
      console.error('Erreur chargement livres:', error);
      toast.error('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadBooks();
  };

  const handleDownload = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res: any = await booksApi.download(id);
      if (res.data.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
        toast.success('Téléchargement démarré');
      }
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const getFileIcon = (type: string) => {
    const icons: Record<string, string> = {
      pdf: '📄',
      docx: '📝',
      ppt: '📊',
      pptx: '📊',
    };
    return icons[type] || '📄';
  };

  const getFileColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'text-red-500',
      docx: 'text-blue-500',
      ppt: 'text-orange-500',
      pptx: 'text-orange-500',
    };
    return colors[type] || 'text-gray-500';
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bibliothèque</h1>
          <p className="text-gray-500">Explorez notre collection de documents pédagogiques</p>
        </div>
        {user && (
          <Link
            href="/books/upload"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Partager un document
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un livre, un auteur..."
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white min-w-[150px]"
          >
            <option value="">Toutes les catégories</option>
            <option value="general">Bibliothèque générale</option>
            <option value="prepa">Prépa BEF/BAC</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : books.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <Link href={`/books/${book.id}`} className="block">
                  <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                    <span className="text-6xl">{getFileIcon(book.fileType)}</span>
                    <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-white/90 backdrop-blur ${getFileColor(book.fileType)}`}>
                      {book.fileType.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                    {book.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {book.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{new Date(book.createdAt).toLocaleDateString('fr-FR')}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {book.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {book.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-5 pb-4 flex gap-2">
                  <button
                    onClick={(e) => handleDownload(book.id, e)}
                    className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                  >
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                    className={`px-4 py-2 rounded-lg ${
                      pageNum === pagination.page
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600">Aucun livre trouvé</h3>
          <p className="text-gray-400 mt-1">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
}
