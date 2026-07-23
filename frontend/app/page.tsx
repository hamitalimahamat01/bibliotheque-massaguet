'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';

// Citations avec photos
const citations = [
  {
    text: "La lecture est à l'esprit ce que l'exercice est au corps.",
    author: "Joseph Addison",
    role: "Écrivain",
  },
  {
    text: "Un livre est un jardin qu'on porte dans sa poche.",
    author: "Proverbe chinois",
    role: "Proverbe",
  },
  {
    text: "Celui qui lit a mille vies avant de mourir.",
    author: "George R.R. Martin",
    role: "Écrivain",
  },
];

// Statistiques
const stats = [
  { value: '200+', label: 'Documents', icon: Icons.Book },
  { value: '50+', label: 'Étudiants', icon: Icons.User },
  { value: '100%', label: 'Gratuit', icon: Icons.Star },
];

// Catégories
const categories = [
  { title: 'Mathématiques', color: 'from-blue-500 to-cyan-500' },
  { title: 'Physique', color: 'from-purple-500 to-pink-500' },
  { title: 'Chimie', color: 'from-green-500 to-emerald-500' },
  { title: 'Anglais', color: 'from-red-500 to-orange-500' },
  { title: 'Philosophie', color: 'from-indigo-500 to-purple-500' },
  { title: 'Histoire', color: 'from-amber-500 to-yellow-500' },
];

// Équipe de développement
const teamMembers = [
  {
    name: "Ali Mahamat",
    role: "Développeur Full-Stack",
    description: "Étudiant passionné de Massaguet, créateur de cette plateforme éducative pour faciliter l'accès à la connaissance.",
    image: "/team/ali.jpg",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "ali@massaguet.edu",
  },
  {
    name: "Fatima Hassan",
    role: "Designer UI/UX",
    description: "Designer passionnée par l'expérience utilisateur, elle a conçu l'interface élégante et intuitive de la plateforme.",
    image: "/team/fatima.jpg",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "fatima@massaguet.edu",
  },
];

// Groupe de membres
const groupMembers = [
  { name: "Moussa Ali", role: "Contributeur" },
  { name: "Amina Saleh", role: "Rédactrice" },
  { name: "Ibrahim Moussa", role: "Relecteur" },
  { name: "Mariam Abakar", role: "Modératrice" },
  { name: "Adam Issa", role: "Contributeur" },
  { name: "Zara Mahamat", role: "Traductrice" },
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
            <Icons.Book className="w-4 h-4" />
            Plateforme éducative collaborative
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
              <Icons.Login className="w-5 h-5" />
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* === STATS === */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all p-8 text-center border border-gray-100 card-hover group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconComponent className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </section>

      {/* === CITATION === */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 mb-12 border border-indigo-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <Icons.Quote className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xl md:text-2xl text-gray-700 italic font-light leading-relaxed">
              "{citation.text}"
            </p>
            <p className="text-indigo-600 font-semibold mt-2">
              — {citation.author}
              <span className="text-gray-400 font-normal ml-2">{citation.role}</span>
            </p>
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Icons.Book className="w-7 h-7 text-indigo-600" />
            Catégories
          </h2>
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
              <Icons.Book className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <span className="text-sm font-medium block">{cat.title}</span>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
            </Link>
          ))}
        </div>
      </section>

      {/* === ÉQUIPE DE DÉVELOPPEMENT === */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Icons.Users className="w-7 h-7 text-indigo-600" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Équipe de développement</h2>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 border-b border-gray-100">
            <p className="text-gray-600 leading-relaxed max-w-3xl">
              Cette plateforme a été développée par des étudiants passionnés de la région de Massaguet,
              unis par la volonté de partager le savoir et de faciliter l'accès à l'éducation pour tous.
            </p>
          </div>

          <div className="p-8">
            {/* Membres principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all group"
                >
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-4 ring-white shadow-lg">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-indigo-600">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{member.name}</h3>
                  <p className="text-indigo-600 text-sm font-medium">{member.role}</p>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">{member.description}</p>
                  
                  <div className="flex justify-center gap-3 mt-4">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors text-gray-600 hover:text-gray-900"
                      aria-label="GitHub"
                    >
                      <Icons.Github className="w-5 h-5" />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-200 hover:bg-[#0077b5]/10 transition-colors text-gray-600 hover:text-[#0077b5]"
                      aria-label="LinkedIn"
                    >
                      <Icons.LinkedIn className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="p-2 rounded-lg bg-gray-200 hover:bg-red-50 transition-colors text-gray-600 hover:text-red-500"
                      aria-label="Email"
                    >
                      <Icons.Email className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Groupe de membres */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">Membres de la communauté</h3>
                <span className="text-sm text-gray-400">({groupMembers.length} contributeurs)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {groupMembers.map((member, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 text-center hover:bg-indigo-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-sm font-bold text-indigo-600">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-center border border-indigo-100">
              <p className="text-gray-700 text-sm flex items-center justify-center gap-2">
                <Icons.Users className="w-5 h-5 text-indigo-600" />
                <span className="font-medium">Rejoignez la communauté !</span>
                Contribuez en partageant vos documents et en aidant les autres à apprendre.
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
    </div>
  );
}
