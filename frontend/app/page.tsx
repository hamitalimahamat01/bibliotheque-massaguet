import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-3xl animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Bibliothèque de{' '}
          <span className="text-indigo-600">Massaguet</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Plateforme éducative créée par les étudiants de Massaguet pour partager et explorer des documents pédagogiques.
          Notre mission est de faciliter l'accès à l'éducation en partageant des ressources de qualité.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/books"
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Explorer la bibliothèque
          </Link>
          <Link
            href="/login"
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Se connecter
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
          <div>
            <div className="text-2xl font-bold text-indigo-600">200+</div>
            <div className="text-sm text-gray-500">Documents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">50+</div>
            <div className="text-sm text-gray-500">Étudiants</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">100%</div>
            <div className="text-sm text-gray-500">Gratuit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
