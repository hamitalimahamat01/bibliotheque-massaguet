'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { booksApi, statsApi, usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Stats {
  users: number;
  books: number;
  downloads: number;
  topBooks: { id: string; title: string; author: string; downloads: number; views: number }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'ADMIN' || user.role === 'MODERATOR');
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, booksRes, usersRes] = await Promise.all([
        statsApi.getStats(),
        booksApi.getAll({ limit: 5 }),
        usersApi.getAll().catch(() => ({ data: { users: [] } })),
      ]);

      setStats(statsRes.data.stats);
      setRecentBooks(booksRes.data.books || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Bienvenue {user?.name} !</p>
        </div>
        <Link
          href="/books/upload"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mt-4 md:mt-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Partager un document
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total documents</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.books || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.users || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Téléchargements</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.downloads || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top livres */}
      {stats?.topBooks && stats.topBooks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Top livres</h2>
          <div className="space-y-3">
            {stats.topBooks.map((book) => (
              <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{book.title}</p>
                  <p className="text-sm text-gray-500">{book.author}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>👁️ {book.views}</span>
                  <span>⬇️ {book.downloads}</span>
                  <Link href={`/books/${book.id}`} className="text-indigo-600 hover:text-indigo-800">
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Derniers livres */}
      {recentBooks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🆕 Derniers documents</h2>
          <div className="space-y-3">
            {recentBooks.map((book) => (
              <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{book.title}</p>
                  <p className="text-sm text-gray-500">par {book.author}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {new Date(book.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  <Link href={`/books/${book.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin - Liste des utilisateurs */}
      {isAdmin && users.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">👥 Utilisateurs</h2>
            <span className="text-sm text-gray-500">{users.length} inscrits</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-2">Nom</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Rôle</th>
                  <th className="pb-2">Documents</th>
                  <th className="pb-2">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{u.name}</td>
                    <td className="py-2 text-gray-500">{u.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                        u.role === 'MODERATOR' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">{u.documentsCount || 0}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
