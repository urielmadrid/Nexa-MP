import { SITE_URL } from "@/src/lib/site";

type Props = {
  /** "claro" para rodapés escuros, "escuro" para rodapés claros. */
  tom?: "claro" | "escuro";
  /** Cor de destaque do link (qualquer classe de texto do Tailwind). */
  destaque?: string;
  className?: string;
};

/**
 * Crédito de rodapé: "Site criado pela Nexa MP", com link para o site da Nexa MP.
 * O link é comum (sem nofollow) e abre em outra aba, para a pessoa não perder o site do cliente.
 * Para sites de clientes feitos fora deste projeto, veja docs/credito-nexa-mp.md.
 */
export default function CreditoNexaMP({ tom = "claro", destaque, className = "" }: Props) {
  const base = tom === "claro" ? "text-white/45" : "text-black/50";
  const link = destaque ?? "text-brand-orange";
  return (
    <p className={`text-xs ${base} ${className}`}>
      Site criado pela{" "}
      <a
        href={`${SITE_URL}/`}
        target="_blank"
        rel="noopener"
        title="Nexa MP: gestão digital, sites, tráfego pago e redes sociais"
        className={`font-semibold underline-offset-4 hover:underline ${link}`}
      >
        Nexa MP
      </a>
    </p>
  );
}