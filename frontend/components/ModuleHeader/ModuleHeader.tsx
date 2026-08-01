'use client';

import { Icons } from '@/components/Icons';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface ModuleHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  shareLink: string;
}

export default function ModuleHeader({
  title,
  description,
  icon,
  gradient,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  shareLink,
}: ModuleHeaderProps) {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Background avec gradient */}
      <div className={`relative p-8 md:p-10 ${gradient} text-white`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              <p className="text-white/80 text-sm mt-0.5">{description}</p>
            </div>
          </div>

          {/* Bouton Partager */}
          {user && (
            <Link
              href={shareLink}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl font-medium hover:bg-white/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <Icons.Upload className="w-4 h-4" />
              Partager un document
            </Link>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="relative z-10 mt-6 max-w-2xl">
          <form onSubmit={onSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icons.Search className="w-5 h-5 text-white/60" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher un document, un auteur..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all text-sm font-medium"
            >
              Rechercher
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
