import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          ← Retour à l'accueil
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Politique de Confidentialité</h1>
        <p className="text-gray-500 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Données collectées</h2>
            <p className="leading-relaxed">
              La Bibliothèque de Massaguet collecte les informations suivantes :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nom et adresse email (pour la création de compte)</li>
              <li>Documents partagés et téléchargés</li>
              <li>Activité sur la plateforme (favoris, téléchargements, avis)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Utilisation des données</h2>
            <p className="leading-relaxed">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Gérer votre compte et votre authentification</li>
              <li>Permettre le partage et le téléchargement de documents</li>
              <li>Améliorer notre service et personnaliser votre expérience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Sécurité</h2>
            <p className="leading-relaxed">
              Vos données sont protégées par des mesures de sécurité :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Chiffrement des mots de passe</li>
              <li>Connexion sécurisée HTTPS</li>
              <li>Accès restreint aux données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Vos droits</h2>
            <p className="leading-relaxed">
              Vous disposez des droits suivants concernant vos données :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Accès à vos données personnelles</li>
              <li>Rectification de données inexactes</li>
              <li>Suppression de vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Contact</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <p><strong>Email :</strong> confidentialite@massaguet.bibliotheque</p>
              <p className="mt-1"><strong>Adresse :</strong> Massaguet, Tchad</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
