'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import Image from 'next/image';

// Citations avec photos
const citations = [
  {
    texte: "La lecture est à l'esprit ce que l'exercice est au corps.",
    auteur: "Joseph Addison",
    source: "Spectator",
    photo: "/citations/joseph-addison.jpg",
  },
  {
    texte: "Un livre est un jardin qu'on porte dans sa poche.",
    auteur: "Proverbe chinois",
    source: "",
    photo: "/citations/proverbe-chinois.jpg",
  },
  {
    texte: "Celui qui lit a mille vies avant de mourir. Celui qui ne lit jamais n'en vit qu'une.",
    auteur: "George R.R. Martin",
    source: "Le Trône de Fer",
    photo: "/citations/george-rr-martin.jpg",
  },
  {
    texte: "La connaissance s'accroît quand on la partage.",
    auteur: "Proverbe africain",
    source: "",
    photo: "/citations/proverbe-africain.jpg",
  },
  {
    texte: "L'éducation est l'arme la plus puissante pour changer le monde.",
    auteur: "Nelson Mandela",
    source: "",
    photo: "/citations/nelson-mandela.jpg",
  },
  {
    texte: "Un esprit qui s'ouvre à une nouvelle idée ne retrouvera jamais sa taille originale.",
    auteur: "Albert Einstein",
    source: "",
    photo: "/citations/albert-einstein.jpg",
  },
];

// Équipe de développement (un seul étudiant)
const developpeur = {
  nom: "Étudiant de Massaguet",
  role: "Développeur Full-Stack",
  description: "Étudiant passionné de la région de Massaguet, dédié à la création d'outils éducatifs pour faciliter l'accès à la connaissance pour tous.",
  photo: "/equipe/developpeur.jpg",
  linkedin: "https://linkedin.com/in/etudiant-massaguet",
  github: "https://github.com/etudiant-massaguet",
  portfolio: "https://portfolio-etudiant.com",
  email: "etudiant@massaguet.edu",
  facebook: "https://facebook.com/etudiant.massaguet",
};

export default function HomePage() {
  const { user } = useAuth();
  const [citationIndex, setCitationIndex] = useState(0);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCitationIndex((prev) => (prev + 1) % citations.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadTopBooks = async () => {
      setLoadingBooks(true);
      try {
        const res: any = await booksApi.getAll({ limit: 4, sort: 'downloads' });
        if (res.data.books && res.data.books.length > 0) {
          setTopBooks(res.data.books);
        }
      } catch (error) {
        console.error('Erreur chargement top livres:', error);
      } finally {
        setLoadingBooks(false);
      }
    };
    loadTopBooks();
  }, []);

  const citation = citations[citationIndex];

  return (
    <div className="animate-fade-in">
      {/* ===== HERO SECTION AVEC IMAGE ===== */}
      <section className="relative overflow-hidden rounded-3xl mb-12 min-h-[500px] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-blue-900/90 z-10"></div>
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-[20s] hover:scale-100"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-10"></div>
        </div>

        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${10 + Math.random() * 20}s`,
                animationDelay: `${Math.random() * 10}s`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
              }}
            />
          ))}
        </div>

        <div className="relative z-20 container mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white flex items-center gap-1">
                <Icons.Book className="w-4 h-4" />
                Bibliothèque de Massaguet
              </span>
              {user && (
                <span className="bg-green-400/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white flex items-center gap-1">
                  <Icons.User className="w-4 h-4" />
                  Bonjour {user.name}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-white">
              La connaissance
              <span className="text-yellow-300 block">à portée de clic</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
              Bibliothèque numérique créée par les étudiants de Massaguet.
              Partagez, explorez et apprenez ensemble.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/books"
                className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <Icons.Book className="w-5 h-5" />
                Explorer la bibliothèque
              </Link>
              <Link
                href="/books/upload"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Icons.Upload className="w-5 h-5" />
                Partager un document
              </Link>
            </div>

            {!user && (
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  href="/login"
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-white/30 transition-all flex items-center gap-2 text-sm"
                >
                  <Icons.Login className="w-4 h-4" />
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition-all flex items-center gap-2 text-sm"
                >
                  <Icons.Register className="w-4 h-4" />
                  Inscription
                </Link>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">200+</div>
                <div className="text-sm text-white/80">Documents</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-sm text-white/80">Étudiants</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-white/80">Gratuit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CITATION DU JOUR AVEC PHOTO ===== */}
      <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-12 border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
            {citation.photo ? (
              <Image
                src={citation.photo}
                alt={citation.auteur}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Icons.Quote className="w-10 h-10 text-indigo-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <Icons.Quote className="w-8 h-8 text-indigo-200 flex-shrink-0 mt-1" />
              <blockquote className="text-lg md:text-xl text-gray-700 italic font-light leading-relaxed">
                {citation.texte}
              </blockquote>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="font-semibold text-gray-800">— {citation.auteur}</span>
              {citation.source && (
                <span className="text-sm text-gray-400">• {citation.source}</span>
              )}
              <div className="flex gap-1 ml-auto">
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
          </div>
        </div>
      </section>

      {/* ===== APPEL À L'ACTION ===== */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center mb-12">
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
            className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <Icons.Book className="w-5 h-5" />
            Explorer la bibliothèque
          </Link>
          <Link
            href="/books/upload"
            className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <Icons.Upload className="w-5 h-5" />
            Partager un document
          </Link>
        </div>
        {!user && (
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link
              href="/login"
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-white/30 transition-all flex items-center gap-2 text-sm"
            >
              <Icons.Login className="w-4 h-4" />
              Connexion
            </Link>
            <Link
              href="/register"
              className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition-all flex items-center gap-2 text-sm"
            >
              <Icons.Register className="w-4 h-4" />
              Inscription
            </Link>
          </div>
        )}
      </section>

      {/* ===== MEILLEURS LIVRES À LIRE (depuis la BDD) ===== */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Icons.Books className="w-8 h-8 text-indigo-600" />
              Meilleurs livres à lire
            </h2>
            <p className="text-gray-500">Les documents les plus populaires de la bibliothèque</p>
          </div>
          <Link href="/books" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
            Voir tous
            <Icons.ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingBooks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : topBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Icons.Book className="w-6 h-6 text-indigo-500" />
                    <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                      {book.category || 'Général'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500">par {book.author}</p>
                  {book.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {book.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icons.Download className="w-3 h-3" />
                      {book.downloads || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.View className="w-3 h-3" />
                      {book.views || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <Icons.Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun document disponible pour le moment</p>
          </div>
        )}
      </section>

      {/* ===== SECTION À PROPOS / DÉVELOPPEUR ===== */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Icons.Team className="w-8 h-8 text-indigo-600" />
          À propos du projet
        </h2>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Bibliothèque de Massaguet</h3>
            <p className="text-gray-600 leading-relaxed max-w-3xl">
              La Bibliothèque de Massaguet est une plateforme éducative collaborative créée par des étudiants
              passionnés de la région de Massaguet. Notre mission est de faciliter l'accès à l'éducation
              en partageant des ressources pédagogiques de qualité, spécialement adaptées aux besoins
              des élèves du BEF et du BAC.
            </p>
          </div>

          {/* Développeur */}
          <div className="p-8">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icons.User className="w-5 h-5 text-indigo-600" />
              Développeur
            </h4>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-gray-50 rounded-xl p-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                {developpeur.photo ? (
                  <Image
                    src={developpeur.photo}
                    alt={developpeur.nom}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Icons.User className="w-12 h-12 text-indigo-400" />
                )}
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-gray-800">{developpeur.nom}</h5>
                <p className="text-indigo-600 font-medium">{developpeur.role}</p>
                <p className="text-gray-600 text-sm mt-1 max-w-2xl">{developpeur.description}</p>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <a
                    href={developpeur.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#0077b5] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Icons.LinkedIn className="w-6 h-6" />
                  </a>
                  <a
                    href={developpeur.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="GitHub"
                  >
                    <Icons.Github className="w-6 h-6" />
                  </a>
                  <a
                    href={developpeur.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                    aria-label="Portfolio"
                  >
                    <Icons.Portfolio className="w-6 h-6" />
                  </a>
                  <a
                    href={developpeur.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#1877f2] transition-colors"
                    aria-label="Facebook"
                  >
                    <Icons.Facebook className="w-6 h-6" />
                  </a>
                  <a
                    href={`mailto:${developpeur.email}`}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                    aria-label="Email"
                  >
                    <Icons.Email className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-center">
              <p className="text-gray-700 text-sm flex items-center justify-center gap-2">
                <Icons.Team className="w-5 h-5 text-indigo-600" />
                <span className="font-medium">Rejoignez-nous !</span>
                Cette bibliothèque est construite par et pour la communauté.
                Contribuez en partageant vos documents.
              </p>
              <Link
                href="/books/upload"
                className="inline-block mt-3 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2 mx-auto"
              >
                <Icons.Upload className="w-4 h-4" />
                Partager un document
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
