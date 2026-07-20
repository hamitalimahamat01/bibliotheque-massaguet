import './globals.css';

export const metadata = {
  title: 'Bibliothèque en Ligne - Massaguet',
  description: 'Bibliothèque numérique créée par les étudiants de Massaguet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
