import './globals.css';
import { defaultDescription, jsonLd, siteName, siteUrl } from './seo';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: { type: 'website', locale: 'pt_BR', siteName, url: siteUrl },
  icons: { icon: '/favicon.svg' },
};

export const viewport = { themeColor: '#07263d' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${siteUrl}/#organization`,
                  name: 'Life Comércio e Serviços Ltda.',
                  alternateName: siteName,
                  url: siteUrl,
                  logo: `${siteUrl}/assets/logo-life.png`,
                  email: 'contato@life.eng.br',
                  telephone: '+55-79-3246-1881',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Av. Des. Maynard, 287 · Suíça',
                    addressLocality: 'Aracaju',
                    addressRegion: 'SE',
                    postalCode: '49052-210',
                    addressCountry: 'BR',
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${siteUrl}/#website`,
                  name: siteName,
                  url: siteUrl,
                  inLanguage: 'pt-BR',
                  publisher: { '@id': `${siteUrl}/#organization` },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
