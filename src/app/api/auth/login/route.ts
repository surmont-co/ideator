import { workos, clientId, redirectUri } from '@/lib/workos';
import { redirect } from 'next/navigation';

export async function GET() {
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    provider: 'authkit', // Folosim AuthKit-ul WorkOS implicit
    clientId,
    redirectUri,
  });

  redirect(authorizationUrl);
}
