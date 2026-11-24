import { COOKIE_CRM } from "@/src/lib/crm/sessao";

/** Encerra a sessão do CRM apagando o cookie. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const seguro = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store", "Set-Cookie": `${COOKIE_CRM}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${seguro}` } },
  );
}