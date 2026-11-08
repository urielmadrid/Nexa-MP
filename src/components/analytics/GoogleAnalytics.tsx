"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { EVENTO_MUDOU, apagarCookiesDeEstatistica, lerConsentimento } from "@/src/lib/consentimento";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** O Google Analytics só é carregado depois que o visitante aceita os cookies de estatísticas. */
export default function GoogleAnalytics() {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    const atualizar = () => {
      const aceito = lerConsentimento()?.analytics === true;
      // O interruptor do Google é ligado/desligado ANTES de renderizar, para valer já na primeira coleta.
      if (GA_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = !aceito;
      setPermitido(aceito);
    };
    atualizar();
    window.addEventListener(EVENTO_MUDOU, atualizar);
    return () => window.removeEventListener(EVENTO_MUDOU, atualizar);
  }, []);

  // Sem consentimento (ou se foi retirado): limpa os cookies de estatística que já existirem.
  useEffect(() => {
    if (GA_ID && !permitido) apagarCookiesDeEstatistica();
  }, [permitido]);

  if (process.env.NODE_ENV !== "production" || !GA_ID || !permitido) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
