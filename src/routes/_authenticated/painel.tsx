import { createFileRoute, Link } from "@tanstack/react-router";
import { format, isToday, parseISO } from "date-fns";
import { Building2, CalendarClock, CalendarDays, MessageCircle, RotateCcw, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/crm/ui";
import { STAGES, brl, commission, whatsappLink } from "@/lib/crm";
import { useTable, type Row } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — Corretor CRM" }] }),
  component: Dashboard,
});

type ClientWithStatus = Row<"clients"> & {
  status?: string | null;
  deferred_reason?: string | null;
  follow_up_date?: string | null;
};

function formatDateBR(isoDate?: string | null) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function Dashboard() {
  const { rows: rawClients, save: saveClient } = useTable("clients");
  const clients = rawClients as ClientWithStatus[];
  const properties = useTable("properties").rows;
  const appts = useTable("appointments").rows;
  const deals = useTable("deals").rows;

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Leads ativos (excluindo fechados, perdidos e compra adiada)
  const active = clients.filter(
    (c) => c.stage !== "fechado" && c.stage !== "perdido" && (c.status ?? "ativo") !== "adiado",
  ).length;

  // Clientes com compra adiada cuja data de retorno é hoje ou já passou
  const dueFollowUps = clients
    .filter((c) => c.status === "adiado" && c.follow_up_date && c.follow_up_date <= todayStr)
    .sort((a, b) => (a.follow_up_date ?? "").localeCompare(b.follow_up_date ?? ""));

  const today = appts.filter((a) => !a.done && isToday(parseISO(a.starts_at)));
  const upcoming = appts.filter((a) => !a.done).slice(0, 6);
  const pending = deals.filter((d) => !d.paid).reduce((s, d) => s + commission(Number(d.value), Number(d.commission_pct)), 0);
  const closed = clients.filter((c) => c.stage === "fechado").length;
  const conv = clients.length ? Math.round((closed / clients.length) * 100) : 0;

  const cards = [
    { label: "Leads ativos", value: active, icon: Users, to: "/clientes" as const },
    { label: "Imóveis disponíveis", value: properties.filter((p) => p.status === "disponivel").length, icon: Building2, to: "/imoveis" as const },
    { label: "Compromissos hoje", value: today.length, icon: CalendarDays, to: "/agenda" as const },
    { label: "Comissões a receber", value: brl(pending), icon: Wallet, to: "/financeiro" as const },
  ];

  return (
    <>
      <PageHeader title="Bom trabalho hoje" subtitle={format(new Date(), "dd/MM/yyyy")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-xl border bg-card p-5 shadow-card hover:border-primary transition-colors">
            <c.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 font-display text-3xl">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Bloco de Alertas de Retorno (Compra Adiada vencendo hoje ou atrasada) */}
      {dueFollowUps.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-foreground">
                Hora de retomar contato ({dueFollowUps.length})
              </h3>
            </div>
            <Link to="/clientes" className="text-xs font-medium text-amber-700 hover:underline">
              Ver todos em Clientes →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dueFollowUps.map((c) => {
              const wa = whatsappLink(c.phone);
              const isOverdue = c.follow_up_date && c.follow_up_date < todayStr;
              return (
                <div key={c.id} className="flex flex-col justify-between rounded-lg border bg-card p-3.5 shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isOverdue
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/15 text-amber-700"
                        }`}
                      >
                        {isOverdue ? `Atrasado (${formatDateBR(c.follow_up_date)})` : "Retorno Hoje"}
                      </span>
                    </div>
                    {c.deferred_reason && (
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                        <strong>Motivo:</strong> {c.deferred_reason}
                      </p>
                    )}
                    {c.interest && (
                      <p className="mt-1 text-xs text-foreground/80 truncate">{c.interest}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t flex items-center justify-between gap-2">
                    {wa ? (
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs text-emerald-700 border-emerald-600/30 hover:bg-emerald-50">
                        <a href={wa} target="_blank" rel="noreferrer">
                          <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Sem WhatsApp</span>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() =>
                        saveClient.mutate({
                          id: c.id,
                          status: "ativo",
                          deferred_reason: null,
                          follow_up_date: null,
                        } as never)
                      }
                    >
                      <RotateCcw className="mr-1 h-3 w-3" /> Reativar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-lg">Funil</h3>
            <span className="text-sm text-muted-foreground">Conversão {conv}%</span>
          </div>
          <div className="space-y-3">
            {STAGES.map((s) => {
              const n = clients.filter((c) => c.stage === s.id).length;
              const w = clients.length ? (n / clients.length) * 100 : 0;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-sm"><span>{s.label}</span><span className="text-muted-foreground">{n}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${w}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-lg mb-4">Próximos compromissos</h3>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">Nada agendado.</p> : (
            <ul className="divide-y">
              {upcoming.map((a) => (
                <li key={a.id} className="flex gap-4 py-2.5 text-sm">
                  <span className="w-24 text-muted-foreground tabular-nums">{format(parseISO(a.starts_at), "dd/MM HH:mm")}</span>
                  <span className="font-medium">{a.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
