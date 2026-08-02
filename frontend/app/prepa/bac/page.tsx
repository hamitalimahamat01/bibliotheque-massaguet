'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import toast from 'react-hot-toast';

interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  subCategory: string;
  fileType: string;
  downloads: number;
  views: number;
  createdAt: string;
  coverUrl: string;
  year?: string;
  subject?: string;
}

export default function PrepaBACPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 12,
  });

  useEffect(() => {
    loadBooks();
  }, [pagination.page, search]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        category: 'prepa',
        subCategory: 'bac',
      };
      if (search) params.search = search;

      const res: any = await booksApi.getAll(params);
      
      if (res.data && res.data.books) {
        setBooks(res.data.books);
        setPagination({
          ...pagination,
          total: res.data.pagination?.total || 0,
          pages: res.data.pagination?.pages || 0,
        });
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Erreur chargement livres BAC:', error);
      toast.error('Erreur lors du chargement des livres');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadBooks();
  };

  return (
    <div className="animate-fade-in">
      <ModuleHeader
        title="Prépa BAC"
        description="Documents pour les élèves de Terminale"
        icon={<Icons.Graduation className="w-7 h-7 text-white" />}
        gradient="bg-gradient-to-r from-emerald-600 to-green-600"
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
        shareLink={user ? '/books/upload' : '/login'}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm h-80 shimmer" />
          ))}
        </div>
      ) : books.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {pagination.total} document{pagination.total > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100/50 group">
                <Link href={`/books/${book.id}`} className="block h-full">
                  <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Icons.Book className="w-12 h-12 text-green-400" />
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className="badge bg-emerald-100 text-emerald-700">
                        BAC
                      </span>
                      {book.fileType && (
                        <span className="badge bg-white/90 backdrop-blur-sm text-gray-700">
                          {book.fileType.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-sm font-medium">Voir</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{book.author || 'Anonyme'}</p>
                    {book.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {book.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1.5">
                        <Icons.Download className="w-4 h-4" />
                        {book.downloads || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icons.View className="w-4 h-4" />
                        {book.views || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.Graduation className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">Aucun document trouvé</h3>
          <p className="text-gray-400 mt-1">Aucun document pour la Prépa BAC</p>
          {user && (
            <Link
              href="/books/upload"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Icons.Upload className="w-4 h-4" />
              Partager un document
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
