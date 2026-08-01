'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { booksApi } from '@/lib/api';

// Photos de la ville
const CITY_PHOTOS = [
  { src: '/city/massaguet-1.svg', alt: 'Massaguet - Vue sur la ville', label: 'Vue panoramique' },
  { src: '/city/massaguet-2.svg', alt: 'Massaguet - Paysage urbain', label: 'Paysage urbain' },
  { src: '/city/massaguet-3.svg', alt: 'Massaguet - Coucher de soleil', label: 'Coucher de soleil' },
];

// Statistiques
const STATS = [
  { value: '200+', label: 'Documents', icon: Icons.Book },
  { value: '50+', label: 'Étudiants', icon: Icons.User },
  { value: '100%', label: 'Gratuit', icon: Icons.Star },
];

// Catégories
const CATEGORIES = [
  { title: 'Mathématiques', color: 'from-blue-500 to-cyan-500', icon: '📐' },
  { title: 'Physique', color: 'from-purple-500 to-pink-500', icon: '⚛️' },
  { title: 'Chimie', color: 'from-green-500 to-emerald-500', icon: '🧪' },
  { title: 'Anglais', color: 'from-red-500 to-orange-500', icon: '🌍' },
  { title: 'Philosophie', color: 'from-indigo-500 to-purple-500', icon: '🧠' },
  { title: 'Histoire', color: 'from-amber-500 to-yellow-500', icon: '📜' },
];

// Citations
const CITATIONS = [
  {
    text: "La lecture est à l'esprit ce que l'exercice est au corps.",
    author: "Joseph Addison",
  },
  {
    text: "Un livre est un jardin qu'on porte dans sa poche.",
    author: "Proverbe chinois",
  },
  {
    text: "Celui qui lit a mille vies avant de mourir.",
    author: "George R.R. Martin",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [citationIndex, setCitationIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rotation des citations
    const citationInterval = setInterval(() => {
      setCitationIndex((prev) => (prev + 1) % CITATIONS.length);
    }, 8000);
    return () => clearInterval(citationInterval);
  }, []);

  useEffect(() => {
    // Rotation des photos
    const photoInterval = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % CITY_PHOTOS.length);
    }, 5000);
    return () => clearInterval(photoInterval);
  }, []);

  useEffect(() => {
    // Charger les derniers documents
    const loadRecentBooks = async () => {
      try {
        const res: any = await booksApi.getAll({ limit: 4 });
        setRecentBooks(res.data.books || []);
      } catch (error) {
        console.error('Erreur chargement livres:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRecentBooks();
  }, []);

  const citation = CITATIONS[citationIndex];
  const currentPhoto = CITY_PHOTOS[photoIndex];

  return (
    <div className="animate-fade-in">
      {/* === HERO SECTION AVEC CARROUSEL === */}
      <section className="relative overflow-hidden rounded-3xl mb-16">
        <div className="relative min-h-[500px] md:min-h-[600px] flex items-center">
          {/* Image de fond avec carrousel */}
          <div className="absolute inset-0 z-0">
            <Image
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              fill
              className="object-cover transition-opacity duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-blue-900/80 z-10" />
          </div>

          {/* Indicateurs du carrousel */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {CITY_PHOTOS.map((_, index) => (
              <button
                key={index}
                onClick={() => setPhotoIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === photoIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Photo ${index + 1}`}
              />
            ))}
          </div>

          <div className="relative z-10 container-custom">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
                <Icons.Book className="w-4 h-4" />
                <span>Plateforme éducative collaborative</span>
              </div>

              {/* Titre */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                La connaissance
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                  à portée de clic
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
                Bibliothèque numérique créée par l'Union des étudiants de Massaguet.
                Partagez, explorez et apprenez ensemble.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/books"
                  className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Icons.Book className="w-5 h-5" />
                  Explorer la bibliothèque
                  <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href={user ? '/books/upload' : '/login'}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Icons.Upload className="w-5 h-5" />
                  {user ? 'Partager un document' : 'Se connecter'}
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
                {STATS.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10"
                  >
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === CITATION === */}
      <section className="bg-white rounded-2xl shadow-sm p-8 mb-16 border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <Icons.Quote className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xl md:text-2xl text-gray-700 font-light italic leading-relaxed">
              &ldquo;{citation.text}&rdquo;
            </p>
            <p className="text-indigo-600 font-medium mt-2">
              — {citation.author}
            </p>
          </div>
          <div className="flex gap-2">
            {CITATIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCitationIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === citationIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* === DERNIERS DOCUMENTS === */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Icons.Book className="w-7 h-7 text-indigo-600" />
              Derniers documents
            </h2>
            <p className="text-gray-500 text-sm">Les documents récemment partagés</p>
          </div>
          <Link
            href="/books"
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            Voir tout
            <Icons.ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm h-64 shimmer" />
            ))}
          </div>
        ) : recentBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentBooks.map((book: any) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100/50"
              >
                <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative">
                  <Icons.Book className="w-12 h-12 text-indigo-300 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-medium">Voir</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500">par {book.author}</p>
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icons.Download className="w-4 h-4" />
                      {book.downloads || 0}
                    </span>
                    <span>{new Date(book.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Icons.Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun document disponible pour le moment</p>
          </div>
        )}
      </section>

      {/* === CATÉGORIES === */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Icons.Book className="w-7 h-7 text-indigo-600" />
              Catégories
            </h2>
            <p className="text-gray-500 text-sm">Explorez par discipline</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, index) => (
            <Link
              key={index}
              href={`/books?category=${cat.title.toLowerCase()}`}
              className={`group relative overflow-hidden rounded-2xl p-6 text-center bg-gradient-to-br ${cat.color} text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <span className="text-3xl mb-2 block">{cat.icon}</span>
              <span className="text-sm font-medium block">{cat.title}</span>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* === À PROPOS === */}
      <section id="about" className="mb-16 scroll-mt-20">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg bg-white flex items-center justify-center">
                  <Image
                    src="/team/union-logo.svg"
                    alt="Union des étudiants de Massaguet"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Union des étudiants de Massaguet</h3>
                  <p className="text-sm text-indigo-600 font-medium">Association étudiante</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                L'Union des étudiants de Massaguet est une association dédiée à la promotion de l'éducation
                et du partage de connaissances. Ensemble, nous croyons que l'accès à l'information est un droit
                fondamental et que la collaboration est la clé de la réussite éducative.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 shadow-sm">
                  <Icons.User className="w-4 h-4 text-indigo-500" />
                  Étudiants
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 shadow-sm">
                  <Icons.Book className="w-4 h-4 text-indigo-500" />
                  Éducation
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 shadow-sm">
                  <Icons.Star className="w-4 h-4 text-indigo-500" />
                  Partage
                </span>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-white flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <Image
                    src="/team/ali.svg"
                    alt="Ali Mahamat"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Ali Mahamat</h4>
                  <p className="text-indigo-600 text-sm font-medium">Développeur Full-Stack</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Étudiant passionné de Massaguet, créateur de cette plateforme éducative pour faciliter l'accès à la connaissance.
              </p>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
                >
                  <Icons.Github className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-[#0077b5]/10 transition-colors text-gray-600 hover:text-[#0077b5]"
                >
                  <Icons.LinkedIn className="w-5 h-5" />
                </a>
                <a
                  href="mailto:ali@massaguet.edu"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 transition-colors text-gray-600 hover:text-red-500"
                >
                  <Icons.Email className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-12 text-white text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à explorer ou partager ?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez la communauté de Massaguet. Partagez vos documents, découvrez de nouvelles ressources
            et contribuez à l'éducation de tous.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Icons.Book className="w-5 h-5" />
              Explorer
            </Link>
            <Link
              href={user ? '/books/upload' : '/login'}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Icons.Upload className="w-5 h-5" />
              {user ? 'Partager' : 'Se connecter'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
