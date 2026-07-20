'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Icons } from './Icons';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Icons.Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800">Massaguet</span>
              <span className="block text-[10px] text-gray-400 -mt-1">Bibliothèque</span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm flex items-center gap-1">
              <Icons.Home className="w-4 h-4" />
              Accueil
            </Link>
            <Link href="/books" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm flex items-center gap-1">
              <Icons.Book className="w-4 h-4" />
              Livres
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm flex items-center gap-1">
              <Icons.Dashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors hidden sm:flex items-center gap-1"
                >
                  <Icons.Logout className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <Icons.Login className="w-4 h-4" />
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <Icons.Register className="w-4 h-4" />
                  Inscription
                </Link>
              </div>
            )}

            {/* Menu mobile - bouton */}
            <button
              className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <Icons.Close className="w-6 h-6" />
              ) : (
                <Icons.Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile - dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-600 hover:text-indigo-600 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Icons.Home className="w-5 h-5" />
                Accueil
              </Link>
              <Link
                href="/books"
                className="text-gray-600 hover:text-indigo-600 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Icons.Book className="w-5 h-5" />
                Livres
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-indigo-600 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Icons.Dashboard className="w-5 h-5" />
                Dashboard
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-indigo-600 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icons.User className="w-5 h-5" />
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-50 text-left"
                  >
                    <Icons.Logout className="w-5 h-5" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-indigo-600 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icons.Login className="w-5 h-5" />
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="text-indigo-600 font-medium flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icons.Register className="w-5 h-5" />
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
