import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, Trash2 } from "lucide-react";
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

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={"mt-2 font-display text-3xl " + (tone ?? "")}>{value}</p>
    </div>
  );
}

function Finance() {
  const { rows, save, patch, remove } = useTable("deals");
  const clients = useTable("clients").rows;
  const properties = useTable("properties").rows;
  const [open, setOpen] = useState(false);
  const year = new Date().getFullYear();
  const [f, setF] = useState({ description: "", value: "", commission_pct: "6", closed_at: format(new Date(), "yyyy-MM-dd"), client_id: "", property_id: "" });
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const stats = useMemo(() => {
    let received = 0, pending = 0, volume = 0;
    const months = Array.from({ length: 12 }, (_, i) => ({ mes: format(new Date(year, i, 1), "MMM", { locale: ptBR }), comissao: 0 }));
    for (const d of rows) {
      const c = commission(Number(d.value), Number(d.commission_pct));
      if (d.paid) received += c; else pending += c;
      volume += Number(d.value);
      const dt = parseISO(d.closed_at);
      if (dt.getFullYear() === year) months[dt.getMonth()]!.comissao += c;
    }
    return { received, pending, volume, months };
  }, [rows, year]);

  const preview = commission(Number(f.value || 0), Number(f.commission_pct || 0));

  return (
    <>
      <PageHeader title="Financeiro" subtitle="Negócios fechados e comissões" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Registrar negócio</Button>} />
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Stat label="Comissões recebidas" value={brl(stats.received)} tone="text-success" />
        <Stat label="A receber" value={brl(stats.pending)} tone="text-warning" />
        <Stat label="VGV negociado" value={brl(stats.volume)} />
        <Stat label="Negócios fechados" value={String(rows.length)} />
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-card mb-6">
        <h3 className="mb-4 text-lg">Comissões por mês — {year}</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={stats.months}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: number) => brl(v)} />
              <Bar dataKey="comissao" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {rows.length === 0 ? <Empty>Nenhum negócio registrado.</Empty> : (
        <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Negócio</TableHead><TableHead>Valor</TableHead><TableHead>Comissão</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{format(parseISO(d.closed_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <p className="font-medium">{d.description || properties.find((p) => p.id === d.property_id)?.title || "—"}</p>
                    <p className="text-xs text-muted-foreground">{clients.find((c) => c.id === d.client_id)?.name}</p>
                  </TableCell>
                  <TableCell>{brl(Number(d.value))}</TableCell>
                  <TableCell className="font-semibold">{brl(commission(Number(d.value), Number(d.commission_pct)))} <span className="text-xs text-muted-foreground">({Number(d.commission_pct)}%)</span></TableCell>
                  <TableCell>
                    <button onClick={() => patch.mutate({ id: d.id, paid: !d.paid })}>
                      <Badge variant={d.paid ? "default" : "outline"}>{d.paid ? "Recebida" : "A receber"}</Badge>
                    </button>
                  </TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => confirm("Excluir negócio?") && remove.mutate(d.id)} aria-label="Excluir"><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar negócio fechado</DialogTitle></DialogHeader>
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(
                { description: f.description || null, value: Number(f.value), commission_pct: Number(f.commission_pct), closed_at: f.closed_at, client_id: f.client_id || null, property_id: f.property_id || null },
                { onSuccess: () => setOpen(false) },
              );
            }}
          >
            <Field label="Descrição" className="col-span-2"><Input value={f.description} onChange={(e) => set("description")(e.target.value)} placeholder="Venda apto Moema" /></Field>
            <Field label="Valor do negócio (R$) *"><Input type="number" required value={f.value} onChange={(e) => set("value")(e.target.value)} /></Field>
            <Field label="Comissão (%)"><Input type="number" step="0.1" value={f.commission_pct} onChange={(e) => set("commission_pct")(e.target.value)} /></Field>
            <Field label="Cliente"><SelectField value={f.client_id} onChange={set("client_id")} options={clients.map((c) => ({ id: c.id, label: c.name }))} /></Field>
            <Field label="Imóvel"><SelectField value={f.property_id} onChange={set("property_id")} options={properties.map((p) => ({ id: p.id, label: p.title }))} /></Field>
            <Field label="Data de fechamento" className="col-span-2"><Input type="date" value={f.closed_at} onChange={(e) => set("closed_at")(e.target.value)} /></Field>
            <p className="col-span-2 rounded-lg bg-primary-soft p-3 text-sm">Sua comissão: <strong>{brl(preview)}</strong></p>
            <Button className="col-span-2" disabled={save.isPending}>Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
