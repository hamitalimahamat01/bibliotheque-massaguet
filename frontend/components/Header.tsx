'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Icons } from './Icons';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  // Navigation principale
  const navItems = [
    { label: 'Accueil', href: '/', icon: <Icons.Home className="w-4 h-4" /> },
    { label: 'Bibliothèque', href: '/books', icon: <Icons.Book className="w-4 h-4" /> },
    { label: 'Prépa BEF', href: '/prepa/bef', icon: <Icons.Graduation className="w-4 h-4" /> },
    { label: 'Prépa BAC', href: '/prepa/bac', icon: <Icons.Graduation className="w-4 h-4" /> },
  ];

  // Navigation mobile (avec À propos)
  const mobileNavItems = [
    ...navItems,
    { label: 'À propos', href: '/#about', icon: <Icons.Users className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Bibliothèque Massaguet"
                width={40}
                height={40}
                className="object-contain"
                priority
                onError={(e) => {
                  e.currentTarget.src = '/team/ali.svg';
                }}
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-800">Massaguet</span>
              <span className="block text-[10px] text-gray-400 -mt-1">Bibliothèque</span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm px-3 py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-indigo-50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium hidden lg:inline">{user.name?.split(' ')[0]}</span>
                </button>

                {/* Dropdown Profil */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Icons.User className="w-5 h-5 text-indigo-500" />
                      Mon profil
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Icons.Dashboard className="w-5 h-5 text-indigo-500" />
                      Dashboard
                    </Link>
                    <Link
                      href="/#about"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Icons.Users className="w-5 h-5 text-indigo-500" />
                      À propos
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <Icons.Logout className="w-5 h-5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-indigo-50"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm px-5 py-2"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Menu mobile */}
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

        {/* Menu mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col space-y-1">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-indigo-600 flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <hr className="border-gray-100 my-2" />
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-indigo-600 flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icons.User className="w-5 h-5" />
                    Mon profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <Icons.Logout className="w-5 h-5" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-indigo-600 flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icons.Login className="w-5 h-5" />
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="text-indigo-600 font-medium flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
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
