/**
 * Links de pagamento de cada plano (página da Cakto). Aparecem na janelinha "Quero este plano",
 * no botão "Contratar agora". A chave é o id do plano (src/lib/data/planos.ts).
 *
 * Para trocar um link, troque só o endereço entre aspas. Plano sem link aqui não mostra o botão de pagamento.
 * Atenção: o valor cobrado é o que está configurado na própria Cakto. Se mudar o preço do plano no site,
 * mude também na Cakto (e vice-versa), para a pessoa não ver um valor aqui e pagar outro.
 */
export const LINKS_PAGAMENTO: Record<string, string> = {
  "landing-avulsa": "https://pay.cakto.com.br/frm3cck_1346854",
  "essencial": "https://pay.cakto.com.br/f4rynix_1346897",
  "presenca-completa": "https://pay.cakto.com.br/3eoid4j_1346950",
  "crescimento-continuo": "https://pay.cakto.com.br/rduwhxg_1346972",
  "trafego-500": "https://pay.cakto.com.br/p28gts7_1347015",
};

/** Link de pagamento do plano, ou null se não houver (ou se o endereço não for da Cakto). */
export function linkDePagamento(planoId: string): string | null {
  const link = LINKS_PAGAMENTO[planoId];
  return link && link.startsWith("https://pay.cakto.com.br/") ? link : null;
}