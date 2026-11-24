import nodemailer from "nodemailer";
import { VERSAO_POLITICA } from "@/src/lib/data/legal";
import { DIAGNOSTICO } from "@/src/lib/formulario/diagnostico";
import { montarEmailDoEnvio, umaLinha } from "@/src/lib/formulario/email";
import { repositorio } from "@/src/lib/formulario/repositorio";
import type { EnvioNormalizado } from "@/src/lib/formulario/tipos";
import { lerOrigem, lerRespostasBrutas, validarFormulario } from "@/src/lib/formulario/validar";

/**
 * Recebe o Diagnóstico de presença digital (página /formulario).
 *
 * 1) valida e normaliza (src/lib/formulario/validar.ts);
 * 2) guarda pelo "repositorio" (MySQL, se DATABASE_URL estiver definida: src/lib/formulario/repositorio.ts);
 * 3) avisa a Nexa MP por e-mail, pelo SMTP do Zoho.
 *
 * Variáveis de ambiente: as mesmas de /api/contato (ZOHO_SMTP_HOST, ZOHO_SMTP_PORT, ZOHO_SMTP_USER, ZOHO_SMTP_PASS, CONTATO_DESTINO).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITE_CORPO = 16_000;
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
  if (typeof dados.website === "string" && dados.website.trim() !== "") return resposta({ ok: true }, 200);

  // O aceite da Política de Privacidade é obrigatório e fica registrado junto do envio.
  if (dados.aceite !== true) return resposta({ erro: "aceite" }, 400);

  const validacao = validarFormulario(DIAGNOSTICO, lerRespostasBrutas(dados));
  if (!validacao.ok) return resposta({ erro: "dados", campos: validacao.erros }, 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  if (excedeuLimite(ip)) return resposta({ erro: "limite" }, 429);

  const envio: EnvioNormalizado = {
    id: crypto.randomUUID(),
    formularioSlug: DIAGNOSTICO.slug,
    formularioVersao: DIAGNOSTICO.versao,
    criadoEm: new Date().toISOString(),
    lead: validacao.dados.lead,
    respostas: validacao.dados.respostas,
    consentimento: { aceito: true, versaoPolitica: VERSAO_POLITICA },
    origem: lerOrigem(dados.origem),
  };

  const host = process.env.ZOHO_SMTP_HOST;
  const usuario = process.env.ZOHO_SMTP_USER;
  const senha = process.env.ZOHO_SMTP_PASS;
  const emailPronto = Boolean(host && usuario && senha);
  if (!emailPronto && !repositorio.ativo) {
    console.error("[formulario] Variáveis ZOHO_SMTP_HOST, ZOHO_SMTP_USER e ZOHO_SMTP_PASS não configuradas.");
    return resposta({ erro: "indisponivel" }, 503);
  }

  // O banco vem primeiro. Se ele falhar mas o e-mail funcionar, a pessoa não é prejudicada: o e-mail leva os dados
  // (inclusive a linha DADOS_CRM_V1, que dá para importar no CRM depois).
  let guardado = false;
  if (repositorio.ativo) {
    try {
      await repositorio.salvar(envio);
      guardado = true;
    } catch (erro) {
      console.error("[formulario] Falha ao guardar o envio no banco:", erro instanceof Error ? erro.message : erro);
    }
  }

  if (!emailPronto) {
    // Só o banco está ligado: se ele falhou, não há onde guardar o envio.
    return guardado ? resposta({ ok: true, id: envio.id }, 200) : resposta({ erro: "falha" }, 502);
  }

  const porta = Number(process.env.ZOHO_SMTP_PORT) || 465;
  const transporte = nodemailer.createTransport({
    host,
    port: porta,
    secure: porta === 465,
    auth: { user: usuario as string, pass: senha as string },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const { assunto, texto } = montarEmailDoEnvio(DIAGNOSTICO, envio);
  const { lead } = envio;

  try {
    await transporte.sendMail({
      from: { name: "Site Nexa MP", address: usuario as string },
      to: process.env.CONTATO_DESTINO || (usuario as string),
      replyTo: lead.email ? { name: umaLinha(lead.nome), address: lead.email } : undefined,
      subject: assunto,
      text: texto,
    });
    return resposta({ ok: true, id: envio.id }, 200);
  } catch (erro) {
    // Mostra no log do servidor (Vercel) o motivo técnico, sem dados da pessoa nem a senha.
    console.error("[formulario] Falha ao enviar pelo SMTP:", erro instanceof Error ? erro.message : erro);
    // Se o envio já está no CRM, a pessoa foi atendida: o aviso por e-mail é que falhou.
    return guardado ? resposta({ ok: true, id: envio.id }, 200) : resposta({ erro: "falha" }, 502);
  }
}