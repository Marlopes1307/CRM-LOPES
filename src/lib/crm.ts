export const STAGES = [
  { id: "novo", label: "Novo lead" },
  { id: "contato", label: "Em contato" },
  { id: "visita", label: "Visita agendada" },
  { id: "proposta", label: "Proposta" },
  { id: "negociacao", label: "Negociação" },
  { id: "fechado", label: "Fechado" },
  { id: "perdido", label: "Perdido" },
] as const;
export type Stage = (typeof STAGES)[number]["id"];
export const stageLabel = (s: string) => STAGES.find((x) => x.id === s)?.label ?? s;

export const PROPERTY_KINDS = ["apartamento", "casa", "terreno", "comercial", "cobertura", "sala"];
export const PROPERTY_STATUS = [
  { id: "disponivel", label: "Disponível" },
  { id: "reservado", label: "Reservado" },
  { id: "vendido", label: "Vendido" },
  { id: "alugado", label: "Alugado" },
];
export const APPOINTMENT_KINDS = [
  { id: "visita", label: "Visita" },
  { id: "reuniao", label: "Reunião" },
  { id: "ligacao", label: "Ligação" },
  { id: "tarefa", label: "Tarefa" },
];
export const CLIENT_TYPES = ["comprador", "vendedor", "locatário", "proprietário", "investidor"];
export const SOURCES = ["Indicação", "Instagram", "Portal imobiliário", "WhatsApp", "Site", "Placa", "Outro"];

export function brl(n: number | null | undefined) {
  return (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function commission(value: number, pct: number) {
  return Math.round(value * pct) / 100;
}

export function whatsappLink(phone?: string | null) {
  const d = (phone ?? "").replace(/\D/g, "");
  if (!d) return null;
  return `https://wa.me/${d.length <= 11 ? "55" + d : d}`;
}
