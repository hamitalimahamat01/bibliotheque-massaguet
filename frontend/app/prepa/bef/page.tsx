'use client';

import { useEffect, useState } from 'react';
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
  downloads: number;
  views: number;
  createdAt: string;
  coverUrl: string;
  year: string;
}

export default function PrepaBEFPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 12,
  });

  // Matières disponibles
  const subjects = [
    'Mathématiques',
    'Physique',
    'Chimie',
    'SVT',
    'Anglais',
    'Français',
    'Histoire-Géographie',
    'Informatique'
  ];

  // Années disponibles
  const years = ['2023-2024', '2024-2025', '2025-2026'];

  useEffect(() => {
    loadBooks();
  }, [pagination.page, searchTerm, selectedSubject, selectedYear]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        category: 'prepa',
        subCategory: 'bef',
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedYear) params.year = selectedYear;

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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedYear('');
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Icons.Graduation className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Prépa BEF</h1>
            <p className="text-white/90 text-sm">Documents pour les élèves de 3ème</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un document..."
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <Icons.Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[150px]"
            >
              <option value="">Toutes les matières</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[150px]"
            >
              <option value="">Toutes les années</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 px-4 py-2.5 transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
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
          <div className="mb-4 text-sm text-gray-500">
            {pagination.total} document{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <Link href={`/books/${book.id}`} className="block">
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icons.Book className="w-16 h-16 text-blue-400" />
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/90 backdrop-blur text-gray-700">
                        {book.fileType.toUpperCase()}
                      </span>
                      {book.subject && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/90 backdrop-blur text-white">
                          {book.subject}
                        </span>
                      )}
                    </div>
                    {book.year && (
                      <div className="absolute bottom-3 left-3 text-xs font-medium px-2 py-1 rounded-full bg-white/90 backdrop-blur text-gray-700">
                        {book.year}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">par {book.author}</p>
                    {book.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {book.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{new Date(book.createdAt).toLocaleDateString('fr-FR')}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Icons.Download className="w-4 h-4" />
                          {book.downloads || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.View className="w-4 h-4" />
                          {book.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
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
                        ? 'bg-blue-600 text-white'
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
          <Icons.Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Aucun document trouvé</h3>
          <p className="text-gray-400 mt-1">
            Aucun document n'a été trouvé pour la Prépa BEF
          </p>
          {user && (
            <Link
              href="/books/upload"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Partager un document
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
