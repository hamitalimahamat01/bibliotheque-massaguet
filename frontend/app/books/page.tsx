'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import BookCard from '@/components/BookCard/BookCard';
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
  coverUrl: string;
  year?: string;
  subject?: string;
  uploadedBy?: { name: string };
}

export default function BooksPage() {
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
      console.error('Erreur chargement livres:', error);
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
        title="Bibliothèque"
        description="Explorez notre collection de documents pédagogiques"
        icon={<Icons.Book className="w-7 h-7 text-white" />}
        gradient="gradient-hero"
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
              <BookCard key={book.id} book={book} />
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
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icons.Book className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">Aucun document trouvé</h3>
          <p className="text-gray-400 mt-1">Essayez de modifier vos critères de recherche</p>
          {user && (
            <Link
              href="/books/upload"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
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
