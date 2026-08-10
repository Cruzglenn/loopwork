import { Inter } from 'next/font/google';
import { getLocale, getTranslations } from 'next-intl/server';
import { Providers } from '@/app/_providers';
import { cn } from '@/shared';
import { ClientTooltip } from '@/lib/ui/components/client-tooltip';
import type { Metadata } from 'next';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });

  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const theme = process.env.NEXT_PUBLIC_THEME;

  return (
    <html lang={locale}>
      <body
        className={cn(
          inter.className,
          'text-black bg-background md:bg-white tracking-[0.0625em] antialiased',
          theme || 'hris',
        )}
      >
        <Providers>{children}</Providers>
        <ClientTooltip />
      </body>
    </html>
  );
}
