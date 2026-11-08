/**
 * Escolha de cookies do visitante, guardada só no navegador (localStorage). Nada disso vai para servidor.
 * Se a escolha mudar de forma relevante no futuro, aumente VERSAO_COOKIES para perguntar de novo a todos.
 */
export const VERSAO_COOKIES = "1";
export const CHAVE_CONSENTIMENTO = "nexa-cookies";
/** Disparado em window quando a pessoa salva uma escolha. */
export const EVENTO_MUDOU = "nexa:consentimento";
/** Disparado em window para reabrir o aviso (botão "Preferências de cookies" do rodapé). */
export const EVENTO_ABRIR = "nexa:abrir-cookies";

export type Consentimento = { analytics: boolean; versao: string; em: string };

export function lerConsentimento(): Consentimento | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_CONSENTIMENTO);
    if (!bruto) return null;
    const dados: unknown = JSON.parse(bruto);
    if (typeof dados !== "object" || dados === null) return null;
    const { analytics, versao, em } = dados as Record<string, unknown>;
    if (typeof analytics !== "boolean" || versao !== VERSAO_COOKIES) return null;
    return { analytics, versao, em: typeof em === "string" ? em : "" };
  } catch {
    return null;
  }
}

export function salvarConsentimento(analytics: boolean): void {
  const consentimento: Consentimento = { analytics, versao: VERSAO_COOKIES, em: new Date().toISOString() };
  try {
    window.localStorage.setItem(CHAVE_CONSENTIMENTO, JSON.stringify(consentimento));
  } catch {
    // Sem armazenamento disponível (navegação privada, por exemplo): a escolha vale só nesta visita.
  }
  window.dispatchEvent(new CustomEvent(EVENTO_MUDOU, { detail: consentimento }));
}

export function abrirPreferenciasDeCookies(): void {
  window.dispatchEvent(new Event(EVENTO_ABRIR));
}

/** Apaga os cookies do Google Analytics (_ga, _ga_XXXX, _gid, _gat) quando a pessoa retira o consentimento. */
export function apagarCookiesDeEstatistica(): void {
  const nomes = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n.startsWith("_gat"));
  if (nomes.length === 0) return;

  const partes = window.location.hostname.split(".");
  const dominios = ["", window.location.hostname];
  for (let i = 0; i < partes.length - 1; i++) dominios.push(`.${partes.slice(i).join(".")}`);

  for (const nome of nomes) {
    for (const dominio of dominios) {
      document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${dominio ? `; domain=${dominio}` : ""}`;
    }
  }
}
