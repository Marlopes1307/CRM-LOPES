import { createFileRoute, Link } from "@tanstack/react-router";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Clock,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/crm/ui";
import { STAGES, brl, commission } from "@/lib/crm";
import { useTable } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — Corretor CRM" }] }),
  component: Dashboard,
});

const stageColors = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-slate-400",
];

function Dashboard() {
  const clients = useTable("clients").rows;
  const properties = useTable("properties").rows;
  const appts = useTable("appointments").rows;
  const deals = useTable("deals").rows;

  const active = clients.filter((c) => c.stage !== "fechado" && c.stage !== "perdido").length;
  const today = appts.filter((a) => !a.done && isToday(parseISO(a.starts_at)));
  const upcoming = appts.filter((a) => !a.done).slice(0, 6);
  const pending = deals
    .filter((d) => !d.paid)
    .reduce((s, d) => s + commission(Number(d.value), Number(d.commission_pct)), 0);
  const closed = clients.filter((c) => c.stage === "fechado").length;
  const conv = clients.length ? Math.round((closed / clients.length) * 100) : 0;

  const cards = [
    {
      label: "Leads ativos",
      value: active,
      icon: Users,
      to: "/clientes" as const,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Imóveis disponíveis",
      value: properties.filter((p) => p.status === "disponivel").length,
      icon: Building2,
      to: "/imoveis" as const,
      iconBg: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Compromissos hoje",
      value: today.length,
      icon: CalendarDays,
      to: "/agenda" as const,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Comissões a receber",
      value: brl(pending),
      icon: Wallet,
      to: "/financeiro" as const,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
  ];

  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      <PageHeader
        title="Excelente dia de trabalho"
        subtitle={todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1)}
      />

      {/* Cards de Resumo (KPIs) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.iconBg}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-600" />
            </div>

            <div className="mt-5">
              <p className="font-display text-2xl sm:text-3xl text-slate-900 tracking-tight tabular-nums">
                {c.value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Blocos Principais: Funil e Agenda */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card do Funil de Vendas */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div>
                <h3 className="font-display text-lg text-slate-900">Funil de Vendas</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribuição atual dos seus clientes por etapa
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
                {conv}% conversão
              </span>
            </div>

            <div className="space-y-4">
              {STAGES.map((s, idx) => {
                const n = clients.filter((c) => c.stage === s.id).length;
                const w = clients.length ? Math.round((n / clients.length) * 100) : 0;
                const barColor = stageColors[idx % stageColors.length];

                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{s.label}</span>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-semibold text-slate-900">{n}</span>
                        <span className="text-xs text-slate-400 w-9 text-right">({w}%)</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <Link
              to="/clientes"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver pipeline completo
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card de Próximos Compromissos */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-lg text-slate-900">Próximos compromissos</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visitas, ligações e tarefas pendentes
                </p>
              </div>
              <Link
                to="/agenda"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Abrir agenda
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <CalendarDays className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Nada agendado no momento</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seus próximos compromissos aparecerão aqui.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {upcoming.map((a) => {
                  const dt = parseISO(a.starts_at);
                  const isTodayAppt = isToday(dt);

                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 transition-colors hover:bg-slate-100/70"
                    >
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums shrink-0 " +
                          (isTodayAppt
                            ? "bg-amber-100 text-amber-800"
                            : "bg-white text-slate-600 border border-slate-200/80")
                        }
                      >
                        <Clock className="h-3 w-3" />
                        {isTodayAppt
                          ? `Hoje, ${format(dt, "HH:mm")}`
                          : format(dt, "dd/MM · HH:mm")}
                      </span>
                      <span className="font-medium text-sm text-slate-800 truncate">
                        {a.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
