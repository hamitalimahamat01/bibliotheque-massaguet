import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      <p className="text-gray-600 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      
      <div className="prose prose-gray">
        <h2>1. Données collectées</h2>
        <p>Nous collectons les informations suivantes :</p>
        <ul>
          <li>Nom et adresse email</li>
          <li>Documents partagés</li>
          <li>Activité sur la plateforme</li>
        </ul>
        
        <h2>2. Utilisation des données</h2>
        <p>Vos données sont utilisées pour gérer votre compte et améliorer nos services.</p>
        
        <h2>3. Contact</h2>
        <p>Pour toute question : confidentialite@massaguet.bibliotheque</p>
      </div>
    </div>
  );
}
