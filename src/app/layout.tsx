import type { Metadata } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import LoadingScreen from '@/components/ui/LoadingScreen';
import '@/styles/globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-bricolage',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'DevSpark Yazilim | Dijital Donusumun Adresi',
    template: '%s | DevSpark Yazilim',
  },
  description:
    'DevSpark Yazilim - QR Menu Sistemleri, Kurumsal Web Siteleri, E-Ticaret Cozumleri ve Ozel Yazilim Hizmetleri ile dijital donusumunuzu gerceklestirin. Istanbul merkezli yazilim ajansi.',
  keywords: [
    'yazilim',
    'web tasarim',
    'QR menu',
    'e-ticaret',
    'kurumsal web sitesi',
    'ozel yazilim',
    'dijital donusum',
    'Istanbul',
    'DevSpark',
  ],
  authors: [{ name: 'DevSpark Yazilim' }],
  creator: 'DevSpark Yazilim',
  publisher: 'DevSpark Yazilim',
  metadataBase: new URL('https://devspark.com.tr'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://devspark.com.tr',
    siteName: 'DevSpark Yazilim',
    title: 'DevSpark Yazilim | Dijital Donusumun Adresi',
    description:
      'QR Menu Sistemleri, Kurumsal Web Siteleri, E-Ticaret Cozumleri ve Ozel Yazilim Hizmetleri ile dijital donusumunuzu gerceklestirin.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DevSpark Yazilim',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevSpark Yazilim | Dijital Donusumun Adresi',
    description:
      'QR Menu Sistemleri, Kurumsal Web Siteleri, E-Ticaret Cozumleri ve Ozel Yazilim Hizmetleri.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DevSpark Yazilim',
  description:
    'QR Menu Sistemleri, Kurumsal Web Siteleri, E-Ticaret Cozumleri ve Ozel Yazilim Hizmetleri sunan Istanbul merkezli yazilim ajansi.',
  url: 'https://devspark.com.tr',
  logo: 'https://devspark.com.tr/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+90-212-000-00-00',
    contactType: 'customer service',
    areaServed: 'TR',
    availableLanguage: 'Turkish',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Maslak Mahallesi, Buyukdere Cad. No:123',
    addressLocality: 'Sariyer',
    addressRegion: 'Istanbul',
    addressCountry: 'TR',
  },
  sameAs: [
    'https://twitter.com/devsparktr',
    'https://linkedin.com/company/devspark-yazilim',
    'https://instagram.com/devsparktr',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${bricolage.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <LoadingScreen />
        {children}
        <Toaster
          theme="dark"
          richColors
          closeButton
          position="top-center"
        />
      </body>
    </html>
  );
}
