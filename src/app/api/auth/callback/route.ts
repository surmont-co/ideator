import { workos, clientId } from '@/lib/workos';
import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  try {
    const { user } = await workos.userManagement.authenticateWithCode({
      clientId,
      code,
    });

    // Salvăm user-ul în sesiune (cookie criptat)
    await login(user);

  } catch (error) {
    console.error('WorkOS Auth Error:', error);
    return new Response('Authentication failed', { status: 500 });
  }

  // Redirect către pagina principală sau unde dorești după login
  redirect('/');
}
