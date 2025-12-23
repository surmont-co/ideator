import { logout } from '@/lib/auth';

export async function GET() {
  await logout();
}
