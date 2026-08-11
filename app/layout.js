import { IBM_Plex_Mono, Instrument_Serif, Red_Hat_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Footer, JsonLd } from '@/components';
import { CosmosCanvas, Nav, SmoothScroll } from '@/lib/ui/reusable_components';
import { buildMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { SITE } from '@/constants';
import './globals.css';

// Instrument Serif carries every heading and Red Hat Display everything else — the pairing from ricardochance.com, adopted whole on
// 2026-08-11. The italic is loaded because the display face is used italic far more often than upright; it is the headline voice,
// not an emphasis variant. Audiowide and Onest came out with the same decision, so the wordmark now sets in Red Hat Display.
const display = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
});
const sans = Red_Hat_Display({ subsets: ['latin'], display: 'swap', variable: '--font-red-hat-display' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], variable: '--font-ibm-plex-mono' });
const rootMetadata = buildMetadata({
  title: `${SITE.name} — AI, games, marketing systems, and web products`,
  description: SITE.description,
});
const fontVariables = `${sans.variable} ${display.variable} ${mono.variable}`;

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
      {/* SmoothScroll is the only writer of scrollProgress.reduced and CosmosCanvas reads it, so their order here is load-bearing:
          sibling effects run in document order. */}
      <body className='flex min-h-svh flex-col'>
        <JsonLd id='json-ld-site' nodes={[organizationJsonLd, websiteJsonLd]} />
        <SmoothScroll />
        <CosmosCanvas />
        <Nav />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
