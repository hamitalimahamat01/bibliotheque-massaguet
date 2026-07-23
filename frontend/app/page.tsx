'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';

// Citations
const citations = [
  { text: "La lecture est à l'esprit ce que l'exercice est au corps.", author: "Joseph Addison" },
  { text: "Un livre est un jardin qu'on porte dans sa poche.", author: "Proverbe chinois" },
  { text: "Celui qui lit a mille vies avant de mourir.", author: "George R.R. Martin" },
];

// Statistiques
const stats = [
  { value: '200+', label: 'Documents', icon: '📚' },
  { value: '50+', label: 'Étudiants', icon: '👨‍🎓' },
  { value: '100%', label: 'Gratuit', icon: '💡' },
];

// Catégories
const categories = [
  { title: 'Mathématiques', icon: '📐', color: 'from-blue-500 to-cyan-500' },
  { title: 'Physique', icon: '⚛️', color: 'from-purple-500 to-pink-500' },
  { title: 'Chimie', icon: '🧪', color: 'from-green-500 to-emerald-500' },
  { title: 'Anglais', icon: '🌍', color: 'from-red-500 to-orange-500' },
  { title: 'Philosophie', icon: '🧠', color: 'from-indigo-500 to-purple-500' },
  { title: 'Histoire', icon: '📜', color: 'from-amber-500 to-yellow-500' },
];

// Derniers documents (simulés)
const recentDocs = [
  { title: 'Cours de mathématiques 2025', author: 'Prof. Diallo', date: '12 Juil 2026' },
  { title: 'Sujet corrigé BAC Physique', author: 'Prof. Ndiaye', date: '11 Juil 2026' },
  { title: 'Guide complet BEF', author: 'Prof. Sow', date: '10 Juil 2026' },
  { title: 'Cours d\'anglais niveau BAC', author: 'Prof. Fall', date: '9 Juil 2026' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [citationIndex, setCitationIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCitationIndex((prev) => (prev + 1) % citations.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const citation = citations[citationIndex];

  return (
    <div className="animate-fade-in">
      {/* === HERO SECTION === */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 px-8 py-16 md:px-12 md:py-20 text-white mb-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
            📚 Plateforme éducative collaborative
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            La connaissance<br />
            <span className="text-yellow-300">à portée de clic</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            Bibliothèque numérique créée par les étudiants de Massaguet.
            Partagez, explorez et apprenez ensemble.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/books"
              className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <Icons.Book className="w-5 h-5" />
              Explorer la bibliothèque
            </Link>
            <Link
              href="/login"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Icons.User className="w-5 h-5" />
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* === STATS === */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all p-8 text-center border border-gray-100 card-hover"
          >
            <span className="text-4xl mb-3 block">{stat.icon}</span>
            <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-gray-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* === CITATION === */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 mb-12 border border-indigo-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-6xl text-indigo-300 leading-none">"</div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xl md:text-2xl text-gray-700 italic font-light leading-relaxed">
              {citation.text}
            </p>
            <p className="text-indigo-600 font-semibold mt-2">— {citation.author}</p>
          </div>
          <div className="flex gap-2">
            {citations.map((_, i) => (
              <button
                key={i}
                onClick={() => setCitationIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === citationIndex ? 'bg-indigo-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* === CATÉGORIES === */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📖 Catégories</h2>
          <Link href="/books" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
            Voir tout
            <Icons.ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <Link
              key={index}
              href={`/books?category=${cat.title.toLowerCase()}`}
              className={`group relative overflow-hidden rounded-xl p-6 text-center bg-gradient-to-br ${cat.color} text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}
            >
              <span className="text-3xl block mb-2">{cat.icon}</span>
              <span className="text-sm font-medium block">{cat.title}</span>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
            </Link>
          ))}
        </div>
      </section>

      {/* === DERNIERS DOCUMENTS === */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">🆕 Derniers documents</h2>
          <Link href="/books" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
            Voir tout
            <Icons.ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentDocs.map((doc, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all p-6 border border-gray-100 group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Book className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{doc.title}</h3>
              <p className="text-sm text-gray-500">{doc.author}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>{doc.date}</span>
                <Icons.ArrowRight className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === APPEL À L'ACTION === */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Prêt à explorer ou partager ?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Rejoignez la communauté de Massaguet. Partagez vos documents, découvrez de nouvelles ressources
          et contribuez à l'éducation de tous.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/books"
            className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <Icons.Book className="w-5 h-5" />
            Explorer
          </Link>
          <Link
            href="/login"
            className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <Icons.Upload className="w-5 h-5" />
            Partager
          </Link>
        </div>
      </section>
    </div>
  );
}
