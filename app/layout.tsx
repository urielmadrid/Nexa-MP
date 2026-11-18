import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/src/components/analytics/GoogleAnalytics";
import CookieBanner from "@/src/components/ui/CookieBanner";
import { CONTATO } from "@/src/lib/data/contato";
import { SERVICOS } from "@/src/lib/data/servicos";
import { DESCRICAO_SITE, NOME_ALTERNATIVO, NOME_SITE, SITE_URL, TITULO_SITE } from "@/src/lib/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/** Perfis oficiais. LinkedIn e Facebook entram quando existirem: basta definir as variáveis na Vercel. */
const PERFIS = [CONTATO.instagramUrl, process.env.NEXT_PUBLIC_LINKEDIN_URL, process.env.NEXT_PUBLIC_FACEBOOK_URL].filter(
  (url): url is string => Boolean(url),
);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITULO_SITE,
    template: `%s | ${NOME_SITE}`,
  },
  description: DESCRICAO_SITE,
  applicationName: NOME_SITE,
  authors: [{ name: "Nexa MP" }],
  creator: "Nexa MP",
  publisher: "Nexa MP",
  keywords: [
    "marketing digital",
    "tráfego pago",
    "landing page",
    "redes sociais",
    "design estratégico",
    "automação",
    "gestão digital",
    "Nexa MP",
    "NexaMP",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: NOME_SITE,
    title: TITULO_SITE,
    description: DESCRICAO_SITE,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO_SITE,
    description: DESCRICAO_SITE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

const ID_ORGANIZACAO = `${SITE_URL}/#organization`;
const ID_SITE = `${SITE_URL}/#website`;
const URL_LOGO = `${SITE_URL}/icon-512.png`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ID_ORGANIZACAO,
      name: NOME_SITE,
      alternateName: [NOME_ALTERNATIVO],
      description: DESCRICAO_SITE,
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", "@id": `${SITE_URL}/#logo`, url: URL_LOGO, width: 512, height: 512, caption: NOME_SITE },
      image: URL_LOGO,
      sameAs: PERFIS,
      email: CONTATO.email,
      telephone: `+${CONTATO.whatsappNumero}`,
      knowsAbout: SERVICOS.map((servico) => servico.titulo),
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: CONTATO.email,
          telephone: `+${CONTATO.whatsappNumero}`,
          availableLanguage: ["Portuguese"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": ID_SITE,
      name: NOME_SITE,
      alternateName: [NOME_ALTERNATIVO],
      url: `${SITE_URL}/`,
      inLanguage: "pt-BR",
      publisher: { "@id": ID_ORGANIZACAO },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      name: TITULO_SITE,
      description: DESCRICAO_SITE,
      url: `${SITE_URL}/`,
      inLanguage: "pt-BR",
      isPartOf: { "@id": ID_SITE },
      about: { "@id": ID_ORGANIZACAO },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <a
          href="#conteudo"
          className="sr-only z-[100] rounded-md bg-brand-black px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-brand-orange"
        >
          Pular para o conteúdo
        </a>
        <CookieBanner />
        {children}
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}