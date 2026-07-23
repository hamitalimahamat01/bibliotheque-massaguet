import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, gender, city, birthDate, email, name } = body;

    // Ici, vous pouvez sauvegarder dans votre base de données
    // Pour l'instant, on simule une sauvegarde
    console.log('📝 Profil sauvegardé:', {
      email: email || session.user.email,
      name: name || session.user.name,
      firstName,
      lastName,
      gender,
      city,
      birthDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Profil sauvegardé',
      data: { firstName, lastName, gender, city, birthDate },
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
