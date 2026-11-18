import nodemailer from "nodemailer";
import { extrairEmail } from "@/src/lib/data/mensagemContato";
import { VERSAO_POLITICA } from "@/src/lib/data/legal";

/**
 * Recebe a mensagem montada no assistente do Contato e envia para a caixa da Nexa MP pelo SMTP do Zoho Mail.
 * A senha do e-mail fica só em variáveis de ambiente do servidor (nunca no código nem no navegador).
 *
 * Variáveis de ambiente:
 *   ZOHO_SMTP_HOST     ex.: smtppro.zoho.com  (muda conforme a região/plano da conta)
 *   ZOHO_SMTP_PORT     465 (padrão) ou 587
 *   ZOHO_SMTP_USER     contato@nexa-mp.com.br
 *   ZOHO_SMTP_PASS     senha de aplicativo gerada no Zoho
 *   CONTATO_DESTINO    (opcional) para onde a mensagem vai; se faltar, usa ZOHO_SMTP_USER
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITE_CORPO = 12_000;
const JANELA_MS = 10 * 60 * 1000;
const MAX_POR_JANELA = 5;

// Limite simples por IP. Em ambiente serverless cada instância tem a sua memória, então é uma proteção parcial.
const tentativas = new Map<string, number[]>();

function excedeuLimite(ip: string): boolean {
  const agora = Date.now();
  const recentes = (tentativas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= MAX_POR_JANELA) {
    tentativas.set(ip, recentes);
    return true;
  }
  recentes.push(agora);
  tentativas.set(ip, recentes);
  if (tentativas.size > 500) {
    for (const [chave, lista] of tentativas) {
      if (lista.every((t) => agora - t >= JANELA_MS)) tentativas.delete(chave);
    }
  }
  return false;
}

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.replace(/\0/g, "").trim().slice(0, max) : "";
}

/** Para cabeçalhos de e-mail: sem quebras de linha. */
function umaLinha(valor: string): string {
  return valor.replace(/[\r\n]+/g, " ").trim();
}

function resposta(corpo: Record<string, unknown>, status: number) {
  return Response.json(corpo, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const bruto = await request.text();
  if (bruto.length === 0 || bruto.length > LIMITE_CORPO) return resposta({ erro: "dados" }, 400);

  let dados: Record<string, unknown>;
  try {
    const lido: unknown = JSON.parse(bruto);
    if (typeof lido !== "object" || lido === null || Array.isArray(lido)) return resposta({ erro: "dados" }, 400);
    dados = lido as Record<string, unknown>;
  } catch {
    return resposta({ erro: "dados" }, 400);
  }

  // Campo escondido que pessoas não veem: se vier preenchido, é robô. Responde "ok" sem enviar nada.
  if (texto(dados.website, 200) !== "") return resposta({ ok: true }, 200);

  const nome = texto(dados.nome, 80);
  const empresa = texto(dados.empresa, 80);
  const contato = texto(dados.contato, 120);
  const mensagem = texto(dados.mensagem, 3000);

  // O aceite da Política de Privacidade é obrigatório e fica registrado no e-mail recebido.
  if (dados.aceite !== true) return resposta({ erro: "aceite" }, 400);
  if (!nome || !contato || mensagem.length < 20) return resposta({ erro: "dados" }, 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  if (excedeuLimite(ip)) return resposta({ erro: "limite" }, 429);

  const host = process.env.ZOHO_SMTP_HOST;
  const usuario = process.env.ZOHO_SMTP_USER;
  const senha = process.env.ZOHO_SMTP_PASS;
  if (!host || !usuario || !senha) {
    console.error("[contato] Variáveis ZOHO_SMTP_HOST, ZOHO_SMTP_USER e ZOHO_SMTP_PASS não configuradas.");
    return resposta({ erro: "indisponivel" }, 503);
  }

  const porta = Number(process.env.ZOHO_SMTP_PORT) || 465;
  const destino = process.env.CONTATO_DESTINO || usuario;
  const emailDaPessoa = extrairEmail(contato);

  const transporte = nodemailer.createTransport({
    host,
    port: porta,
    secure: porta === 465,
    auth: { user: usuario, pass: senha },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const assunto = umaLinha(`Contato pelo site da Nexa MP: ${empresa || nome}`).slice(0, 150);
  const quando = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  try {
    await transporte.sendMail({
      from: { name: "Site Nexa MP", address: usuario },
      to: destino,
      replyTo: emailDaPessoa ? { name: umaLinha(nome), address: emailDaPessoa } : undefined,
      subject: assunto,
      text: `${mensagem}\n\n--\nEnviado pelo formulário do site em ${quando} (horário de Brasília).\nContato informado: ${umaLinha(contato)}\nAceite da Política de Privacidade e dos Termos: sim (versão ${VERSAO_POLITICA}).`,
    });
    return resposta({ ok: true }, 200);
  } catch (erro) {
    // Mostra no log do servidor (Vercel) o motivo técnico, sem dados da pessoa nem a senha.
    console.error("[contato] Falha ao enviar pelo SMTP:", erro instanceof Error ? erro.message : erro);
    return resposta({ erro: "falha" }, 502);
  }
}
