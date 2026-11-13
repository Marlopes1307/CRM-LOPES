import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, isPast, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, Field, PageHeader, SelectField } from "@/components/crm/ui";
import { APPOINTMENT_KINDS } from "@/lib/crm";
import { useTable } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Corretor CRM" }] }),
  component: Agenda,
});

function Agenda() {
  const { rows, save, patch, remove } = useTable("appointments");
  const clients = useTable("clients").rows;
  const properties = useTable("properties").rows;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("pendentes");
  const [f, setF] = useState({ title: "", kind: "visita", date: format(new Date(), "yyyy-MM-dd"), time: "10:00", client_id: "", property_id: "", notes: "" });
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const groups = useMemo(() => {
    const list = rows.filter((a) => (tab === "pendentes" ? !a.done : tab === "concluidas" ? a.done : true));
    const m = new Map<string, typeof list>();
    for (const a of list) {
      const k = a.starts_at.slice(0, 10);
      m.set(k, [...(m.get(k) ?? []), a]);
    }
    return [...m.entries()];
  }, [rows, tab]);

  const name = (id: string | null, arr: { id: string; name?: string; title?: string }[]) => {
    const x = arr.find((y) => y.id === id);
    return x ? (x.name ?? x.title) : null;
  };

  return (
    <>
      <PageHeader title="Agenda" subtitle="Visitas, reuniões e tarefas" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo compromisso</Button>} />
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList><TabsTrigger value="pendentes">Pendentes</TabsTrigger><TabsTrigger value="concluidas">Concluídas</TabsTrigger><TabsTrigger value="todas">Todas</TabsTrigger></TabsList>
      </Tabs>
      {groups.length === 0 ? <Empty>Nada agendado.</Empty> : (
        <div className="space-y-6">
          {groups.map(([day, items]) => {
            const d = parseISO(day);
            return (
              <div key={day}>
                <h3 className="mb-2 text-lg capitalize">{isToday(d) ? "Hoje" : format(d, "EEEE, d 'de' MMMM", { locale: ptBR })}</h3>
                <div className="space-y-2">
                  {items.map((a) => {
                    const late = !a.done && isPast(parseISO(a.starts_at));
                    return (
                      <div key={a.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card">
                        <Checkbox checked={a.done} onCheckedChange={(c) => patch.mutate({ id: a.id, done: !!c })} aria-label="Concluir" />
                        <span className="w-12 font-semibold tabular-nums">{format(parseISO(a.starts_at), "HH:mm")}</span>
                        <div className="flex-1 min-w-0">
                          <p className={"font-medium " + (a.done ? "line-through text-muted-foreground" : "")}>{a.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {[name(a.client_id, clients), name(a.property_id, properties), a.notes].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        {late && <Badge variant="destructive">Atrasado</Badge>}
                        <Badge variant="secondary">{APPOINTMENT_KINDS.find((k) => k.id === a.kind)?.label}</Badge>
                        <Button size="icon" variant="ghost" onClick={() => remove.mutate(a.id)} aria-label="Excluir"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo compromisso</DialogTitle></DialogHeader>
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(
                { title: f.title, kind: f.kind, starts_at: new Date(`${f.date}T${f.time}`).toISOString(), client_id: f.client_id || null, property_id: f.property_id || null, notes: f.notes || null },
                { onSuccess: () => { setOpen(false); setF((p) => ({ ...p, title: "", notes: "" })); } },
              );
            }}
          >
            <Field label="Título *" className="col-span-2"><Input required value={f.title} onChange={(e) => set("title")(e.target.value)} /></Field>
            <Field label="Tipo" className="col-span-2"><SelectField value={f.kind} onChange={set("kind")} options={APPOINTMENT_KINDS} /></Field>
            <Field label="Data"><Input type="date" required value={f.date} onChange={(e) => set("date")(e.target.value)} /></Field>
            <Field label="Hora"><Input type="time" required value={f.time} onChange={(e) => set("time")(e.target.value)} /></Field>
            <Field label="Cliente"><SelectField value={f.client_id} onChange={set("client_id")} options={clients.map((c) => ({ id: c.id, label: c.name }))} /></Field>
            <Field label="Imóvel"><SelectField value={f.property_id} onChange={set("property_id")} options={properties.map((p) => ({ id: p.id, label: p.title }))} /></Field>
            <Field label="Observações" className="col-span-2"><Textarea value={f.notes} onChange={(e) => set("notes")(e.target.value)} /></Field>
            <Button className="col-span-2" disabled={save.isPending}>Agendar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
