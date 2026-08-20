import { IBM_Plex_Mono, Instrument_Serif, Red_Hat_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Footer, JsonLd } from '@/components';
import { CosmosCanvas, GrainWake, Nav, SmoothScroll, SubstrateField } from '@/lib/ui/reusable_components';
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
          sibling effects run in document order.

          The hero's globe is not here. It scrolls away with its own section, so it lives inside it — only the particle mark needs
          to be fixed, because only the particle mark travels the page.

          SubstrateField and GrainWake sit below both for the same ordering reason as CosmosCanvas — they read the same reduced-motion
          flag SmoothScroll writes. Both are 2D canvases rather than second GL contexts.

          Their z-indices are the whole reason they are here and not in the components they belong to. The scene is z-[1]; the
          substrate is the Life field *behind* the footer's letterform, so it has to be under that, and nothing parented inside the
          footer can be — the panel is z-50 and would paint the field over the mark. GrainWake is grain the cursor leaves on the page,
          so it goes the other way at z-20: over the sections and their cards, under the navbar and the footer panel. */}
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
