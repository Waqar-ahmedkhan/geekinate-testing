import { Audiowide, IBM_Plex_Mono, Onest } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Footer, JsonLd } from '@/components';
import { Nav } from '@/lib/ui/reusable_components';
import { buildMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { SITE } from '@/constants';
import './globals.css';

const onest = Onest({ subsets: ['latin'], display: 'swap', variable: '--font-onest' });
const audiowide = Audiowide({ subsets: ['latin'], display: 'swap', weight: '400', variable: '--font-audiowide' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], variable: '--font-ibm-plex-mono' });
const rootMetadata = buildMetadata({
  title: `${SITE.name} — AI, games, marketing systems, and web products`,
  description: SITE.description,
});
const fontVariables = `${onest.variable} ${audiowide.variable} ${mono.variable}`;

export const metadata = {
  ...rootMetadata,
  metadataBase: new URL(SITE.url),
  title: { default: rootMetadata.title, template: `%s | ${SITE.name}` },
  robots: { index: true, follow: true },
  // app/favicon.ico is picked up by convention; these add the vector and Apple variants.
  icons: {
    icon: [{ url: '/brand/geekinate-mark.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/geekinate-appicon-512.png' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`${fontVariables} antialiased`}>
      <body className='flex min-h-[200vh] flex-col'>
        <JsonLd id='json-ld-site' nodes={[organizationJsonLd, websiteJsonLd]} />
        <Nav />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
