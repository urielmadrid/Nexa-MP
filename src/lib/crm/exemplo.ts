import { leadDoEnvio } from "@/src/lib/crm/importar";
import { novoEvento } from "@/src/lib/crm/operacoes";
import { rotuloDoStatus } from "@/src/lib/crm/tipos";
import type { DadosCrm, LeadCrm, PastaCrm } from "@/src/lib/crm/tipos";
import type { EnvioNormalizado } from "@/src/lib/formulario/tipos";

/**
 * Dados de EXEMPLO, só para a equipe ver como o painel funciona. Tudo aqui é fictício:
 * nomes marcados com "Exemplo", sem telefone e com e-mails ".invalid" (que não existem).
 * Não use estes números para decidir nada. O botão "Limpar exemplos" remove todos de uma vez.
 */

type Modelo = [setor: string, decisor: string, dif: string, trafego: string, presenca: string[], invest: string, objetivo: string | null, trava: string | null, canal: string, utm: string | null, diasAtras: number, status: LeadCrm["status"]];

const MODELOS: Modelo[] = [
  ["varejo", "sim", "sem_tempo_conteudo", "nao", ["instagram"], "de_1500_a_3000", "Vender mais pelo WhatsApp", "Não tenho tempo para cuidar de tudo", "whatsapp", "instagram", 0, "novo"],
  ["alimentacao", "sim", "sem_vendas_nas_redes", "sim", ["instagram", "site"], "de_500_a_1500", "Receber mais pedidos", null, "whatsapp", "instagram", 1, "novo"],
  ["servicos", "participo", "pouco_encontrado_no_google", "nao", ["instagram"], "de_500_a_1500", "Aparecer no Google", null, "email", "google", 1, "em_contato"],
  ["saude", "sim", "pouco_encontrado_no_google", "nao", ["site"], "acima_3000", "Aparecer melhor no Google e ter mais consultas", null, "ambos", null, 2, "qualificado"],
  ["educacao", "sim", "nao_sei_o_que_postar", "nao", ["instagram", "site"], "de_500_a_1500", null, null, "whatsapp", "instagram", 3, "em_contato"],
  ["industria", "nao", "nao_sei_medir", "sim", ["site"], "ainda_nao_sei", null, "Não sei o que funciona", "email", null, 4, "novo"],
  ["varejo", "sim", "sem_vendas_nas_redes", "sim", ["instagram", "site", "google_meu_negocio"], "acima_3000", "Escalar as vendas da loja", "Anúncios sem resultado", "whatsapp", "facebook", 5, "proposta"],
  ["servicos", "sim", "sem_tempo_conteudo", "nao", ["nenhum"], "de_1500_a_3000", "Ter presença digital", "Começando do zero", "whatsapp", null, 6, "novo"],
  ["alimentacao", "participo", "nao_sei_o_que_postar", "nao", ["instagram"], "ate_500", null, null, "whatsapp", "instagram", 7, "em_contato"],
  ["saude", "sim", "sem_vendas_nas_redes", "nao", ["instagram", "google_meu_negocio"], "de_500_a_1500", "Mais agendamentos", null, "whatsapp", "google", 8, "qualificado"],
  ["varejo", "sim", "nao_sei_medir", "sim", ["instagram", "site"], "de_1500_a_3000", "Entender o retorno dos anúncios", "Não sei medir", "email", null, 9, "ganho"],
  ["servicos", "nao", "outra", "nao", ["site"], "ainda_nao_sei", null, null, "email", null, 10, "perdido"],
  ["educacao", "sim", "pouco_encontrado_no_google", "nao", ["instagram"], "de_500_a_1500", "Mais matrículas", null, "whatsapp", "google", 11, "em_contato"],
  ["alimentacao", "sim", "sem_tempo_conteudo", "sim", ["instagram", "site"], "de_1500_a_3000", "Delegar todo o marketing", "Falta de tempo", "whatsapp", "instagram", 12, "proposta"],
  ["industria", "participo", "sem_vendas_nas_redes", "nao", ["site"], "acima_3000", "Gerar contatos de empresas", null, "email", "linkedin", 14, "em_contato"],
  ["outro", "sim", "nao_sei_o_que_postar", "nao", ["nenhum"], "de_500_a_1500", null, null, "whatsapp", null, 16, "novo"],
  ["varejo", "sim", "sem_tempo_conteudo", "nao", ["instagram"], "de_500_a_1500", null, "Sem tempo", "whatsapp", "instagram", 18, "perdido"],
  ["servicos", "sim", "pouco_encontrado_no_google", "sim", ["instagram", "site"], "de_1500_a_3000", "Aparecer na primeira página", null, "ambos", "google", 20, "ganho"],
  ["saude", "participo", "nao_sei_medir", "nao", ["instagram", "site", "google_meu_negocio"], "de_500_a_1500", null, null, "email", null, 23, "em_contato"],
  ["alimentacao", "sim", "sem_vendas_nas_redes", "sim", ["instagram"], "de_500_a_1500", "Vender mais no delivery", null, "whatsapp", "instagram", 26, "novo"],
];

const NOMES = ["Padaria Modelo", "Oficina Teste", "Clínica Fictícia", "Loja Amostra", "Escola Demo", "Studio Modelo", "Mercado Exemplo", "Café Ilustrativo", "Consultório Teste", "Estética Demo"];

export const PASTAS_EXEMPLO: PastaCrm[] = [
  { id: "exemplo-pasta-1", nome: "Exemplo: Prioridade da semana", cor: "#ff6a00" },
  { id: "exemplo-pasta-2", nome: "Exemplo: Aguardando resposta", cor: "#5aa9ff" },
];

export function gerarExemplos(agora: Date = new Date()): DadosCrm {
  const leads: LeadCrm[] = MODELOS.map((m, i): LeadCrm => {
    const [setor, decisor, dif, trafego, presenca, invest, objetivo, trava, canal, utm, diasAtras, status] = m;
    const quando = new Date(agora.getTime() - diasAtras * 86_400_000 - (i % 5) * 3_600_000);
    const respostas: EnvioNormalizado["respostas"] = [
      { perguntaCodigo: "setor", opcaoCodigos: [setor], texto: setor === "outro" ? "Pet shop" : null },
      { perguntaCodigo: "decisor", opcaoCodigos: [decisor], texto: null },
      { perguntaCodigo: "dificuldade_principal", opcaoCodigos: [dif], texto: dif === "outra" ? "Equipe pequena" : null },
      { perguntaCodigo: "ja_fez_trafego_pago", opcaoCodigos: [trafego], texto: null },
      { perguntaCodigo: "presenca_atual", opcaoCodigos: presenca, texto: null },
      { perguntaCodigo: "investimento_mensal", opcaoCodigos: [invest], texto: null },
    ];
    if (objetivo) respostas.push({ perguntaCodigo: "objetivo_6_meses", opcaoCodigos: [], texto: objetivo });
    if (trava) respostas.push({ perguntaCodigo: "maior_trava", opcaoCodigos: [], texto: trava });
    const lead = leadDoEnvio({
      id: `exemplo-${String(i + 1).padStart(2, "0")}-00000000`,
      formularioSlug: "diagnostico-digital",
      formularioVersao: 1,
      criadoEm: quando.toISOString(),
      lead: { nome: `Exemplo ${i + 1}`, empresa: `${NOMES[i % NOMES.length]} (exemplo)`, email: `exemplo${i + 1}@exemplo.invalid`, whatsappE164: null, canalPreferido: canal },
      respostas,
      consentimento: { aceito: true, versaoPolitica: "exemplo" },
      origem: { pagina: "/formulario", referrer: null, utmSource: utm, utmMedium: null, utmCampaign: null, utmTerm: null, utmContent: null },
    });
    const evolucao: LeadCrm = { ...lead, fonte: "exemplo" };
    if (status === "novo") return evolucao;
    // histórico de status: o primeiro contato acontece algumas horas depois da chegada
    const t1 = new Date(quando.getTime() + (2 + (i % 6)) * 3_600_000);
    const historico = [...evolucao.historico, novoEvento("status", "Status: Novo → Em contato", t1, "em_contato")];
    if (status !== "em_contato") {
      const t2 = new Date(t1.getTime() + 20 * 3_600_000);
      historico.push(novoEvento("status", `Status: Em contato → ${rotuloDoStatus(status)}`, t2, status));
    }
    return { ...evolucao, status, historico, atualizadoEm: historico[historico.length - 1].em, pastaId: i % 4 === 0 ? PASTAS_EXEMPLO[0].id : i % 4 === 1 ? PASTAS_EXEMPLO[1].id : null, tags: i % 3 === 0 ? ["indicação"] : [] };
  });
  return { versao: 1, leads, pastas: PASTAS_EXEMPLO };
}