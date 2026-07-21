import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Conditions d'Utilisation</h1>
      <p className="text-gray-600 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      
      <div className="prose prose-gray">
        <h2>1. Acceptation des conditions</h2>
        <p>En utilisant la Bibliothèque de Massaguet, vous acceptez les présentes conditions.</p>
        
        <h2>2. Description du service</h2>
        <p>Notre plateforme permet le partage et le téléchargement de documents pédagogiques.</p>
        
        <h2>3. Compte utilisateur</h2>
        <p>Vous êtes responsable de la confidentialité de vos identifiants.</p>
      </div>
    </div>
  );
}
