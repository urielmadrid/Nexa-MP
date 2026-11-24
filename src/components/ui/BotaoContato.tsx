"use client";

import type { AnchorHTMLAttributes } from "react";
import { aoClicarContato } from "@/src/lib/contatoRapido";
import { aoClicarContratar } from "@/src/lib/contratarPlano";

/**
 * Link que, no clique normal, abre uma janelinha em vez de rolar até o Contato:
 *   <BotaoContato assunto="trafego-pago" ...>   abre "Falar com a Nexa MP" (assuntos em src/lib/data/assuntosContato.ts)
 *   <BotaoContato plano="landing-avulsa" ...>    abre "Quero este plano" (planos em src/lib/data/planos.ts)
 * Com Ctrl/Cmd/Shift ou botão do meio, ou sem JavaScript, funciona como link normal para o `href`.
 * Serve também dentro de páginas sem "use client" (modelos, Serviços).
 */
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  assunto?: string;
  plano?: string;
  /** Só para assunto="diagnostico": o complemento da mensagem. */
  detalhe?: string;
  /** Para onde o link vai quando a janelinha não abre. */
  href?: string;
  /** Roda em todo clique (ex.: fechar o menu do celular). */
  aoClicar?: () => void;
};

export default function BotaoContato({ assunto, plano, detalhe = "", href = "/#contato", aoClicar, children, ...resto }: Props) {
  return (
    <a
      href={href}
      {...resto}
      onClick={(e) => {
        if (plano) aoClicarContratar(e, plano);
        else if (assunto) aoClicarContato(e, assunto, detalhe);
        aoClicar?.();
      }}
    >
      {children}
    </a>
  );
}