import nodemailer from "nodemailer";
import { VALIDADE_DESAFIO_S, emailDestino, whatsappDestino, type Canal } from "@/src/lib/crm/doisFatores";

/**
 * Entrega o código de acesso à Nexa. O código nunca vai para o log do servidor.
 *
 * E-mail: usa o mesmo Zoho do formulário (ZOHO_SMTP_HOST, ZOHO_SMTP_USER, ZOHO_SMTP_PASS e, opcional, ZOHO_SMTP_PORT).
 * WhatsApp: API oficial da Meta (WhatsApp Cloud API), com um modelo de mensagem de AUTENTICAÇÃO aprovado:
 *   WHATSAPP_TOKEN            = token de acesso da Meta
 *   WHATSAPP_PHONE_NUMBER_ID  = ID do número que ENVIA (aparece no painel da Meta; não é o telefone em si)
 *   WHATSAPP_TEMPLATE         = nome do modelo de autenticação aprovado (com botão "copiar código")
 *   WHATSAPP_TEMPLATE_IDIOMA  = (opcional) idioma do modelo, padrão pt_BR
 *   WHATSAPP_API_VERSION      = (opcional) versão da API, padrão v26.0
 */

const MINUTOS = Math.round(VALIDADE_DESAFIO_S / 60);

async function enviarPorEmail(codigo: string): Promise<void> {
  const host = process.env.ZOHO_SMTP_HOST;
  const usuario = process.env.ZOHO_SMTP_USER;
  const senha = process.env.ZOHO_SMTP_PASS;
  const para = emailDestino();
  if (!host || !usuario || !senha || !para) throw new Error("E-mail de envio não configurado.");
  const porta = Number(process.env.ZOHO_SMTP_PORT) || 465;
  const transporte = nodemailer.createTransport({
    host,
    port: porta,
    secure: porta === 465,
    auth: { user: usuario, pass: senha },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  await transporte.sendMail({
    from: { name: "CRM Nexa MP", address: usuario },
    to: para,
    subject: "Código de acesso ao CRM da Nexa MP",
    text: [
      `Seu código de acesso ao CRM é: ${codigo}`,
      "",
      `Ele vale por ${MINUTOS} minutos e só pode ser usado uma vez.`,
      "Se ninguém da diretoria tentou entrar agora, ignore esta mensagem e troque a senha do CRM.",
    ].join("\n"),
  });
}

async function enviarPorWhatsapp(codigo: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const idNumero = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const modelo = process.env.WHATSAPP_TEMPLATE;
  const para = whatsappDestino();
  if (!token || !idNumero || !modelo || !para) throw new Error("WhatsApp de envio não configurado.");
  const versao = process.env.WHATSAPP_API_VERSION || "v26.0";

  // Formato do modelo de autenticação da Meta: o mesmo código vai no corpo e no botão de copiar.
  const resposta = await fetch(`https://graph.facebook.com/${versao}/${encodeURIComponent(idNumero)}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: para,
      type: "template",
      template: {
        name: modelo,
        language: { code: process.env.WHATSAPP_TEMPLATE_IDIOMA || "pt_BR" },
        components: [
          { type: "body", parameters: [{ type: "text", text: codigo }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: codigo }] },
        ],
      },
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!resposta.ok) {
    let motivo = "";
    try {
      const corpo = (await resposta.json()) as { error?: { code?: number; message?: string } };
      motivo = `código ${corpo.error?.code ?? "?"}: ${corpo.error?.message ?? ""}`.slice(0, 200);
    } catch {
      /* resposta sem JSON */
    }
    throw new Error(`WhatsApp respondeu ${resposta.status} (${motivo})`);
  }
}

export async function enviarCodigo(canal: Canal, codigo: string): Promise<void> {
  if (canal === "email") return enviarPorEmail(codigo);
  return enviarPorWhatsapp(codigo);
}