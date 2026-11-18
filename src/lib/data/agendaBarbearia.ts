/**
 * Dados e regras da agenda do MODELO de barbearia (demonstração da Nexa MP).
 * Tudo aqui é ilustrativo: nomes, valores e a ocupação dos horários são fictícios e simulados.
 * A ocupação é calculada de forma determinística (sempre igual para o mesmo dia), sem servidor nem banco.
 */

export type ServicoBarbearia = {
  id: string;
  nome: string;
  /** Duração em minutos (múltiplo de 30). Define quantos horários seguidos o serviço ocupa. */
  minutos: 30 | 60;
  /** Valor ilustrativo, só para a demonstração. */
  preco: string;
  descricao: string;
};

export type Barbeiro = { id: string; nome: string; especialidade: string };

export const SERVICOS_BARBEARIA: ServicoBarbearia[] = [
  { id: "corte", nome: "Corte", minutos: 30, preco: "R$ 45", descricao: "Tesoura ou máquina, com acabamento na navalha." },
  { id: "barba", nome: "Barba", minutos: 30, preco: "R$ 35", descricao: "Toalha quente, navalha e hidratação." },
  { id: "combo", nome: "Corte + barba", minutos: 60, preco: "R$ 75", descricao: "O combo mais pedido, sem pressa." },
  { id: "sobrancelha", nome: "Sobrancelha", minutos: 30, preco: "R$ 15", descricao: "Alinhamento na navalha ou na pinça." },
  { id: "completo", nome: "Pacote completo", minutos: 60, preco: "R$ 95", descricao: "Corte, barba e sobrancelha." },
];

export const BARBEIROS: Barbeiro[] = [
  { id: "rafa", nome: "Rafa", especialidade: "Degradê e cortes modernos" },
  { id: "diego", nome: "Diego", especialidade: "Barba e navalha" },
  { id: "leo", nome: "Léo", especialidade: "Clássicos e tesoura" },
];

/** Horários de 30 em 30 minutos, das 09:00 às 19:00 (o último começa às 18:30). */
export const MINUTO_ABERTURA = 9 * 60;
export const MINUTO_FECHAMENTO = 19 * 60;
export const PASSO = 30;
export const TOTAL_SLOTS = (MINUTO_FECHAMENTO - MINUTO_ABERTURA) / PASSO;

export function rotuloDoSlot(slot: number): string {
  const total = MINUTO_ABERTURA + slot * PASSO;
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export type Reserva = { dataISO: string; barbeiro: string; slot: number; slots: number };

export type EstadoSlot = "livre" | "ocupado" | "passou" | "curto" | "seu";

/** Hash simples (FNV-1a): mesma entrada, mesmo resultado. Dá uma ocupação estável e com cara de real. */
function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function diaDaSemana(dataISO: string): number {
  const [a, m, d] = dataISO.split("-").map(Number);
  return new Date(a, m - 1, d, 12).getDay();
}

/** Domingo fechado. */
export function fechado(dataISO: string): boolean {
  return diaDaSemana(dataISO) === 0;
}

/** Ocupação "de fundo" da agenda fictícia: mais cheia na sexta, no sábado e no fim da tarde. */
export function ocupadoNaBase(dataISO: string, barbeiro: string, slot: number): boolean {
  const dow = diaDaSemana(dataISO);
  const base = dow === 6 ? 0.52 : dow === 5 ? 0.44 : 0.32;
  const hora = MINUTO_ABERTURA + slot * PASSO;
  const pico = hora >= 17 * 60 ? 1.3 : hora >= 12 * 60 && hora < 13 * 60 + 30 ? 0.6 : 1;
  const chance = Math.min(0.85, base * pico);
  return (hash(`${dataISO}|${barbeiro}|${slot}`) % 1000) / 1000 < chance;
}

export type GradeEntrada = {
  dataISO: string;
  /** Minutos desde 00:00 de agora, se o dia for hoje. Horários que já passaram ficam indisponíveis. */
  agoraMin: number | null;
  servico: ServicoBarbearia;
  reservas: Reserva[];
};

/** Estado de cada horário (linhas) por barbeiro (colunas), considerando a duração do serviço escolhido. */
export function montarGrade({ dataISO, agoraMin, servico, reservas }: GradeEntrada): EstadoSlot[][] {
  const precisa = servico.minutos / PASSO;
  const minhas = (b: string, s: number) =>
    reservas.some((r) => r.dataISO === dataISO && r.barbeiro === b && s >= r.slot && s < r.slot + r.slots);

  // 1) estado simples de cada horário
  const simples: ("livre" | "ocupado" | "passou" | "seu")[][] = [];
  for (let s = 0; s < TOTAL_SLOTS; s++) {
    const linha = BARBEIROS.map((b) => {
      if (minhas(b.id, s)) return "seu" as const;
      if (agoraMin !== null && MINUTO_ABERTURA + s * PASSO <= agoraMin) return "passou" as const;
      return ocupadoNaBase(dataISO, b.id, s) ? ("ocupado" as const) : ("livre" as const);
    });
    simples.push(linha);
  }

  // 2) um horário livre só serve se couberem todos os horários seguidos que o serviço pede
  return simples.map((linha, s) =>
    linha.map((estado, c) => {
      if (estado !== "livre") return estado;
      for (let k = 1; k < precisa; k++) {
        if (s + k >= TOTAL_SLOTS || simples[s + k][c] !== "livre") return "curto" as const;
      }
      return "livre" as const;
    }),
  );
}

export function contarLivres(grade: EstadoSlot[][]): { livres: number; ocupados: number } {
  let livres = 0;
  let ocupados = 0;
  for (const linha of grade) {
    for (const e of linha) {
      if (e === "livre") livres++;
      else if (e === "ocupado" || e === "seu") ocupados++;
    }
  }
  return { livres, ocupados };
}

export type DiaAgenda = { dataISO: string; semana: string; dia: string; rotulo: string; fechado: boolean };

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function dataParaISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Os próximos 7 dias a partir de hoje. */
export function proximosDias(hoje: Date, quantidade = 7): DiaAgenda[] {
  const dias: DiaAgenda[] = [];
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i, 12);
    const dataISO = dataParaISO(d);
    dias.push({
      dataISO,
      semana: i === 0 ? "Hoje" : i === 1 ? "Amanhã" : SEMANA[d.getDay()],
      dia: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      rotulo: `${SEMANA[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      fechado: fechado(dataISO),
    });
  }
  return dias;
}