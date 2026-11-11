import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, Field, PageHeader, SelectField } from "@/components/crm/ui";
import { brl, commission } from "@/lib/crm";
import { useTable } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Corretor CRM" }] }),
  component: Finance,
});

function Stat({
  label,
  value,
  icon: Icon,
  iconBg,
  valueColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className={`mt-4 font-display text-2xl sm:text-3xl tracking-tight tabular-nums ${valueColor ?? "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

function Finance() {
  const { rows, save, patch, remove } = useTable("deals");
  const clients = useTable("clients").rows;
  const properties = useTable("properties").rows;
  const [open, setOpen] = useState(false);
  const year = new Date().getFullYear();
  const [f, setF] = useState({
    description: "",
    value: "",
    commission_pct: "6",
    closed_at: format(new Date(), "yyyy-MM-dd"),
    client_id: "",
    property_id: "",
  });
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const stats = useMemo(() => {
    let received = 0,
      pending = 0,
      volume = 0;
    const months = Array.from({ length: 12 }, (_, i) => ({
      mes: format(new Date(year, i, 1), "MMM", { locale: ptBR }),
      comissao: 0,
    }));
    for (const d of rows) {
      const c = commission(Number(d.value), Number(d.commission_pct));
      if (d.paid) received += c;
      else pending += c;
      volume += Number(d.value);
      const dt = parseISO(d.closed_at);
      if (dt.getFullYear() === year) months[dt.getMonth()]!.comissao += c;
    }
    return { received, pending, volume, months };
  }, [rows, year]);

  const preview = commission(Number(f.value || 0), Number(f.commission_pct || 0));

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      <PageHeader
        title="Financeiro"
        subtitle="Acompanhe seu VGV negociado, vendas fechadas e comissões"
        action={
          <Button onClick={() => setOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Registrar negócio
          </Button>
        }
      />

      {/* Cards de Resumo Financeiro */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Comissões recebidas"
          value={brl(stats.received)}
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600"
          valueColor="text-emerald-600"
        />
        <Stat
          label="A receber"
          value={brl(stats.pending)}
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600"
          valueColor="text-amber-600"
        />
        <Stat
          label="VGV negociado"
          value={brl(stats.volume)}
          icon={TrendingUp}
          iconBg="bg-blue-50 text-blue-600"
        />
        <Stat
          label="Negócios fechados"
          value={String(rows.length)}
          icon={Award}
          iconBg="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Gráfico Mensal */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg text-slate-900">Comissões por mês — {year}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evolução mensal das comissões geradas no ano
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.months}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tick={{ fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tick={{ fill: "#64748b" }}
                tickFormatter={(v) => `R$ ${Math.round(v / 1000)}k`}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                formatter={(v: number) => [brl(v), "Comissão"]}
              />
              <Bar dataKey="comissao" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Negócios Fechados */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-14">
          <Empty>Nenhum negócio fechado registrado ainda.</Empty>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-slate-900">
              Histórico de vendas e comissões
            </h3>
            <span className="text-xs text-slate-500">
              Clique no status para marcar como recebida
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Data</TableHead>
                  <TableHead className="font-semibold text-slate-600">Negócio / Cliente</TableHead>
                  <TableHead className="font-semibold text-slate-600">Valor do Imóvel</TableHead>
                  <TableHead className="font-semibold text-slate-600">Sua Comissão</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => {
                  const dealTitle =
                    d.description ||
                    properties.find((p) => p.id === d.property_id)?.title ||
                    "Venda sem descrição";
                  const clientName = clients.find((c) => c.id === d.client_id)?.name;

                  return (
                    <TableRow key={d.id} className="hover:bg-slate-50/70">
                      <TableCell className="tabular-nums text-slate-600 font-medium">
                        {format(parseISO(d.closed_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{dealTitle}</p>
                        {clientName && (
                          <p className="text-xs text-slate-500 mt-0.5">{clientName}</p>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-slate-700">
                        {brl(Number(d.value))}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        <span className="font-semibold text-slate-900">
                          {brl(commission(Number(d.value), Number(d.commission_pct)))}
                        </span>{" "}
                        <span className="text-xs text-slate-400">
                          ({Number(d.commission_pct)}%)
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => patch.mutate({ id: d.id, paid: !d.paid })}
                          title="Clique para alternar o status de pagamento"
                          className="transition-transform active:scale-95"
                        >
                          {d.paid ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 gap-1 font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              Recebida
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 gap-1 font-medium"
                            >
