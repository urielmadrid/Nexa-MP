import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/src/components/analytics/GoogleAnalytics";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const INSTAGRAM_URL = "https://instagram.com/nexamp_";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: "Nexa MP | Estratégia digital para o seu negócio",
    template: "%s | Nexa MP",
  },
  description:
    "A Nexa MP une design, conteúdo, tráfego pago, desenvolvimento web e automação em uma estratégia digital para negócios em crescimento.",
  applicationName: "Nexa MP",
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
    "Nexa MP",
  ],
  alternates: SITE_URL ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Nexa MP",
    title: "Nexa MP | Estratégia digital para o seu negócio",
    description:
      "Design, conteúdo, tráfego pago, web e automação trabalhando em uma estratégia digital só.",
    url: SITE_URL || undefined,
  },
  twitter: {
    card: "summary",
    title: "Nexa MP | Estratégia digital para o seu negócio",
    description:
      "Estratégia digital para negócios em crescimento: design, conteúdo, tráfego, web e automação.",
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
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: { icon: "/favicon.ico" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL ? `${SITE_URL}#organization` : undefined,
      name: "Nexa MP",
      description:
        "Estratégia digital com design, conteúdo, tráfego pago, desenvolvimento web e automação.",
      url: SITE_URL || undefined,
      sameAs: [INSTAGRAM_URL],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL ? `${SITE_URL}#website` : undefined,
      name: "Nexa MP",
      url: SITE_URL || undefined,
      inLanguage: "pt-BR",
      publisher: SITE_URL ? { "@id": `${SITE_URL}#organization` } : undefined,
    },
    {
      "@type": "WebPage",
      name: "Nexa MP | Estratégia digital para o seu negócio",
      description:
        "Página institucional da Nexa MP com serviços, planos, processo de trabalho e contato.",
      url: SITE_URL || undefined,
      inLanguage: "pt-BR",
      isPartOf: SITE_URL ? { "@id": `${SITE_URL}#website` } : undefined,
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
