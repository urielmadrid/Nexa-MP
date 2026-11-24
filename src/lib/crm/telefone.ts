/**
 * Telefone para o CRM. Devolve o formato internacional (+ e dígitos) ou null se não parecer um número.
 * Número com 10 ou 11 dígitos é tratado como brasileiro (acrescenta +55).
 */
export function normalizarWhatsapp(texto: string): string | null {
  const digitos = texto.replace(/\D/g, "");
  if (digitos === "") return null;
  if (texto.trim().startsWith("+")) return digitos.length >= 8 && digitos.length <= 15 ? `+${digitos}` : null;
  if (digitos.length === 10 || digitos.length === 11) return `+55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) return `+${digitos}`;
  return null;
}

export function linkWhatsapp(e164: string): string {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}

/** "+5553991234567" → "+55 (53) 99123-4567" (só para exibir; outros formatos voltam como estão). */
export function mostrarTelefone(e164: string): string {
  const m = /^\+55(\d{2})(\d{4,5})(\d{4})$/.exec(e164);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : e164;
}