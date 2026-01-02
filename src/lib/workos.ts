import { WorkOS } from '@workos-inc/node';

const apiKey = process.env.WORKOS_API_KEY;
export const workos = new WorkOS(apiKey || 'sk_test_placeholder');

export const clientId = process.env.WORKOS_CLIENT_ID as string;
export const redirectUri = process.env.WORKOS_REDIRECT_URI as string;
export const cookiePassword = process.env.WORKOS_COOKIE_PASSWORD as string;

if (process.env.NODE_ENV === 'production' && (!clientId || !apiKey)) {
  console.warn('Warning: Missing WorkOS environment variables in production');
}
