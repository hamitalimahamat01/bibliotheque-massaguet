import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          ← Retour à l'accueil
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Conditions d'Utilisation</h1>
        <p className="text-gray-500 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Acceptation des conditions</h2>
            <p className="leading-relaxed">
              En utilisant la Bibliothèque de Massaguet, vous acceptez pleinement les présentes conditions d'utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Description du service</h2>
            <p className="leading-relaxed">
              La Bibliothèque de Massaguet est une plateforme éducative permettant :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Le partage de documents pédagogiques (PDF, DOCX, PPT)</li>
              <li>Le téléchargement de ressources éducatives</li>
              <li>L'échange et la collaboration entre étudiants</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Compte utilisateur</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
              <li>Vous devez fournir des informations exactes</li>
              <li>Vous pouvez supprimer votre compte à tout moment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Contenu partagé</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Vous êtes responsable des documents que vous partagez</li>
              <li>Le contenu doit être légal et non offensant</li>
              <li>Nous nous réservons le droit de supprimer tout contenu inapproprié</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Contact</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <p><strong>Email :</strong> support@massaguet.bibliotheque</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
