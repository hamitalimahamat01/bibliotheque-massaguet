import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get('error');
  
  console.log('❌ Erreur NextAuth:', error);
  
  // Rediriger vers la page de connexion avec l'erreur
  return NextResponse.redirect(
    new URL(`/login?error=${error || 'unknown'}`, request.url)
  );
}
