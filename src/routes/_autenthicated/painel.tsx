import { createFileRoute, Link } from "@tanstack/react-router";
import { format, isToday, parseISO } from "date-fns";
import { Building2, CalendarDays, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/crm/ui";
import { STAGES, brl, commission } from "@/lib/crm";
import { useTable } from "@/lib/use-table";

export const Route = createFileRoute("/_autenthicated/painel")({
  head: () => ({ meta: [{ title: "Painel — Corretor CRM" }] }),
  component: Dashboard,
});

function Dashboard() {
  const clients = useTable("clients").rows;
  const properties = useTable("properties").rows;
  const appts = useTable("appointments").rows;
  const deals = useTable("deals").rows;

  const active = clients.filter((c) => c.stage !== "fechado" && c.stage !== "perdido").length;
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
