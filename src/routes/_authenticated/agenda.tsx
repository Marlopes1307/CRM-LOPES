import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, isPast, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BellRing,
  Building2,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, Field, PageHeader, SelectField } from "@/components/crm/ui";
import { APPOINTMENT_KINDS } from "@/lib/crm";
import { useTable, type Row } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Mota Negócios Imobiliários" }] }),
  component: Agenda,
});

function buildGoogleCalendarUrl(params: {
  title: string;
  startsAtIso: string;
  clientName?: string;
  propertyTitle?: string;
  notes?: string | null;
}) {
  const start = new Date(params.startsAtIso);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const details = [
    params.clientName ? `Cliente: ${params.clientName}` : null,
    params.propertyTitle ? `Imóvel: ${params.propertyTitle}` : null,
    params.notes ? `Observações: ${params.notes}` : null,
    "Agendado via Mota Negócios Imobiliários CRM",
  ]
    .filter(Boolean)
    .join("\n");

  const url = new URL("https://google.com");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", `${fmt(start)}/${fmt(end)}`);
  url.searchParams.set("details", details);
  if (params.propertyTitle) url.searchParams.set("location", params.propertyTitle);
  return url.toString();
}

const blankForm = () => ({
  title: "",
  kind: "visita",
  date: format(new Date(), "yyyy-MM-dd"),
  time: "10:00",
  client_id: "",
  property_id: "",
  notes: "",
});

function Agenda() {
  const { rows, save, patch, remove } = useTable("appointments");
  const clients = useTable("clients").rows;
  const properties = useTable("properties").rows;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [syncGoogle, setSyncGoogle] = useState(true);
  const [f, setF] = useState(blankForm);
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  function openNew() {
    setEditingId(null);
    setF(blankForm());
    setSyncGoogle(true);
    setOpen(true);
  }

  function openEdit(a: Row<"appointments">) {
    const dt = parseISO(a.starts_at);
    setEditingId(a.id);
    setF({
      title: a.title,
      kind: a.kind,
      date: format(dt, "yyyy-MM-dd"),
      time: format(dt, "HH:mm"),
      client_id: a.client_id ?? "",
      property_id: a.property_id ?? "",
      notes: a.notes ?? "",
    });
    setSyncGoogle(false);
    setOpen(true);
  }

  const groups = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const a of rows) {
      const k = format(parseISO(a.starts_at), "yyyy-MM-dd");
      map.set(k, [...(map.get(k) ?? []), a]);
    }
    return Array.from(map.entries());
  }, [rows]);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Agenda"
        subtitle="Visitas, reuniões, retornos e alertas no celular"
        action={
          <Button onClick={openNew} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Novo compromisso
          </Button>
        }
      />

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-14">
          <Empty>Nenhum compromisso agendado no momento.</Empty>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([day, items]) => {
            const d = parseISO(day);
            const today = isToday(d);

            return (
              <section key={day} className="space-y-3">
                <div className="flex items-center gap-3 pb-1 border-b border-slate-200/80">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      today ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="font-display text-lg capitalize text-slate-900">
                      {today ? "Hoje" : format(d, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h2>
                    {today && (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 font-medium">
                        {format(d, "dd 'de' MMM", { locale: ptBR })}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-3">
                  {items.map((a) => {
                    const late = !a.done && isPast(parseISO(a.starts_at));
                    const client = clients.find((c) => c.id === a.client_id);
                    const prop = properties.find((p) => p.id === a.property_id);
                    const kindLabel = APPOINTMENT_KINDS.find((k) => k.id === a.kind)?.label ?? a.kind;
                    const googleUrl = buildGoogleCalendarUrl({
                      title: a.title,
                      startsAtIso: a.starts_at,
                      clientName: client?.name,
                      propertyTitle: prop?.title,
                      notes: a.notes,
                    });

                    return (
                      <div
                        key={a.id}
                        className={`group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                          a.done
                            ? "bg-slate-50/70 border-slate-200/60 opacity-65"
                            : late
                            ? "bg-white border-red-200 shadow-sm"
                            : "bg-white border-slate-200/90 shadow-card hover:border-slate-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => patch.mutate({ id: a.id, done: !a.done })}
                            aria-label="Marcar como concluído"
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                              a.done
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-slate-300 hover:border-blue-600 bg-white"
                            }`}
                          >
                            {a.done && <Check className="h-4 w-4 stroke-[2.5]" />}
                          </button>

                          <div
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold tabular-nums ${
                              late
                                ? "bg-red-50 text-red-700"
                                : a.done
                                ? "bg-slate-100 text-slate-500"
                                : "bg-blue-50/80 text-blue-700"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {format(parseISO(a.starts_at), "HH:mm")}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`font-semibold text-base text-slate-900 ${a.done ? "line-through text-slate-500" : ""}`}>
                              {a.title}
                            </p>
                            {late && (
                              <Badge variant="destructive" className="text-[11px] font-medium">
                                Atrasado
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            {client && (
                              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                {client.name}
                              </span>
                            )}
                            {prop && (
                              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                {prop.title}
                              </span>
                            )}
                          </div>

                          {a.notes && (
                            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100 line-clamp-2">
                              {a.notes}
                            </p>
                          )}
                        </div>
{kindLabel}
Alertar

<Button 
size="icon" 
variant="ghost" 
onClick={() => openEdit(a)} 
aria-label="Editar compromisso" 
title="Editar compromisso" 
className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100" 
>

<Button 
size="icon" 
variant="ghost" 
onClick={() => confirm("Excluir compromisso?") && remove.mutate(a.id)} 
aria-label="Excluir" 
title="Excluir compromisso" 
className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" 
> 
); 
})} 

)}
{editingId ? "Editar compromisso" : "Novo compromisso"} 


<form 
className="grid grid-cols-2 gap-4 pt-2" 
onSubmit={(e) => { 
e.preventDefault(); 
const startsAtIso = new Date( ${f.date}T${f.time}).toISOString(); 
const clientName = clients.find((c) => c.id === f.client_id)?.name; 
const propertyTitle = properties.find((p) => p.id === f.property_id)?.title;
save.mutate( 
{ 
...(editingId ? { id: editingId } : {}), 
title: f.title, 
kind: f.kind, 
starts_at: startsAtIso, 
client_id: f.client_id || null, 
property_id: f.property_id || null, 
notes: f.notes || null, 
}, 
{ 
onSuccess: () => { 
if (syncGoogle) { 
const url = buildGoogleCalendarUrl({ 
title: f.title, 
startsAtIso, 
clientName, 
propertyTitle, 
notes: f.notes || null, 
}); 
window.open(url, "_blank", "noopener,noreferrer"); 
} 
setOpen(false); 
setEditingId(null); 
setF(blankForm()); 
}, 
} 
); 
}} 
> 

<Input 
required 
placeholder="Ex: Visita ao apartamento decorado" 
value={f.title} 
onChange={(e) => set("title")(e.target.value)} 
/> 


<SelectField value={f.kind} onChange={set("kind")} options={APPOINTMENT_KINDS} /> 


<Input type="date" required value={f.date} onChange={(e) => set("date")(e.target.value)} /> 


<Input type="time" required value={f.time} onChange={(e) => set("time")(e.target.value)} /> 


<SelectField 
value={f.client_id} 
onChange={set("client_id")} 
options={clients.map((c) => ({ id: c.id, label: c.name }))} 
/> 


<SelectField 
value={f.property_id} 
onChange={set("property_id")} 
options={properties.map((p) => ({ id: p.id, label: p.title }))} 
/> 


<Textarea 
rows={3} 
placeholder="Detalhes adicionais, endereço de encontro ou código do portão..." 
value={f.notes} 
onChange={(e) => set("notas")(e.target.value)} 
/>
<Button type="button" variant="outline" onClick={() => setOpen(false)}>
Cancelar


{save.isPending ? "Salvando..." : editingId ? "Salvar alterações" : "Agendar compromisso"}






);
}
