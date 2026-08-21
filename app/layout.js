import { IBM_Plex_Mono, Instrument_Serif, Red_Hat_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Footer, JsonLd } from '@/components';
import { CosmosCanvas, GrainWake, Nav, SmoothScroll, SubstrateField } from '@/lib/ui/reusable_components';
import { buildMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { SITE } from '@/constants';
import './globals.css';

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
  icons: {
    icon: [{ url: '/brand/geekinate-mark.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/geekinate-appicon-512.png' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`${fontVariables} antialiased`}>
      <body className='flex min-h-svh flex-col'>
        <JsonLd id='json-ld-site' nodes={[organizationJsonLd, websiteJsonLd]} />
        <SmoothScroll />
        <SubstrateField />
        <CosmosCanvas />
        <GrainWake />
        <Nav />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
