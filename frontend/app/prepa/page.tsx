import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function PrepaMainPage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Espace Prépa</h1>
        <p className="text-gray-500 text-lg">Choisissez votre niveau</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Prépa BAC */}
        <Link
          href="/prepa/bac"
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Icons.Graduation className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Prépa BAC</h2>
                <p className="text-white/80 text-sm">Terminale</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600">
              Accédez aux documents spécifiques pour la préparation du BAC
            </p>
            <div className="mt-4 text-green-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
              Voir les documents
              <Icons.ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Prépa BEF */}
        <Link
          href="/prepa/bef"
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Icons.Graduation className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Prépa BEF</h2>
                <p className="text-white/80 text-sm">3ème</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600">
              Accédez aux documents spécifiques pour la préparation du BEF
            </p>
            <div className="mt-4 text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
              Voir les documents
              <Icons.ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {!user && (
        <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8">
          <p className="text-gray-600">
            <Link href="/login" className="text-indigo-600 hover:underline font-medium">
              Connectez-vous
            </Link>{' '}
            pour partager vos documents
          </p>
        </div>
      )}
    </div>
  );
}
