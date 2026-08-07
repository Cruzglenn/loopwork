import { redirect as nextRedirect } from 'next/navigation';
import { headers } from 'next/headers';

const RETURN_URL_QUERY_PARAM = 'returnUrl';

export async function redirect(path: string) {
  const redirectUrl = await getRedirectUrl(path);

  return nextRedirect(redirectUrl.toString());
}

export async function getUnauthenticatedRedirectUrl(path: string): Promise<URL> {
  const headersList = await headers();
  const referer = headersList.get('referer');
  const returnUrl = referer ? new URL(referer).pathname : '';

  return await getRedirectUrl(`${path}?${RETURN_URL_QUERY_PARAM}=${encodeURIComponent(returnUrl)}`);
}

export async function getRedirectUrl(path: string): Promise<URL> {
  const headersList = await headers();
  const host =
    headersList.get('x-forwarded-host') ||
    headersList.get('host') ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, '')
      : 'localhost:3000');

  const proto =
    (headersList.get('x-forwarded-proto') as string) ||
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const url = `${proto}://${host}`;

  return new URL(path, url);
}

export async function getAuthenticatedRedirectReturnTo(): Promise<string> {
  const headersList = await headers();
  const referer = headersList.get('referer');
  return referer ? (new URL(referer).searchParams.get(RETURN_URL_QUERY_PARAM) ?? '') : '';
}
