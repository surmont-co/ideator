import { WorkOS } from '@workos-inc/node';

export const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const clientId = process.env.WORKOS_CLIENT_ID as string;
export const redirectUri = process.env.WORKOS_REDIRECT_URI as string;
export const cookiePassword = process.env.WORKOS_COOKIE_PASSWORD as string;

if (!clientId || !process.env.WORKOS_API_KEY) {
  throw new Error('Missing WorkOS environment variables');
}
