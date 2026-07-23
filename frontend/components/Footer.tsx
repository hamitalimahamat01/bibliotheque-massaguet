'use client';

import Link from 'next/link';
import { Icons } from './Icons';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Icons.Book className="w-5 h-5 text-indigo-400" />
              Bibliothèque Massaguet
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Plateforme éducative créée par les étudiants de Massaguet.
              Partagez, explorez et apprenez ensemble.
            </p>
            <div className="mt-4 flex gap-3">
              <Icons.Book className="w-6 h-6 text-gray-500" />
              <Icons.User className="w-6 h-6 text-gray-500" />
              <Icons.Star className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-indigo-400 transition-colors">Accueil</Link></li>
              <li><Link href="/books" className="hover:text-indigo-400 transition-colors">Bibliothèque</Link></li>
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/books/upload" className="hover:text-indigo-400 transition-colors">Partager</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Conditions d'utilisation</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Communauté</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400 flex items-center gap-2">
                <Icons.Email className="w-4 h-4" />
                massaguet@bibliotheque.com
              </li>
              <li className="text-gray-400 flex items-center gap-2">
                <Icons.User className="w-4 h-4" />
                Rejoignez-nous
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {year} Bibliothèque de Massaguet. Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            <span>Fait avec</span>
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>par</span>
            <span className="text-indigo-400 font-medium">les étudiants de Massaguet</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
