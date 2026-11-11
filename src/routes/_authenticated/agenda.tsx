import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, isPast, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  Building2,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Plus,
  Trash2,
  User,
} from "lucide-react";
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

const kindStyles: Record<string, string> = {
  visita: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  reuniao: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50",
  ligacao: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  tarefa: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
};

function Agenda() {
  const { rows, save, patch, remove } = useTable("appointments");
  const clients = useTable("clients").rows;
  const properties = useTable("properties").rows;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("pendentes");
  const [f, setF] = useState({
    title: "",
    kind: "visita",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    client_id: "",
    property_id: "",
    notes: "",
  });
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const groups = useMemo(() => {
    const list = rows.filter((a) =>
      tab === "pendentes" ? !a.done : tab === "concluidas" ? a.done : true
    );
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
    <div className="max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Agenda"
        subtitle="Gerencie suas visitas, reuniões e acompanhamentos com clientes"
        action={
          <Button onClick={() => setOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Novo compromisso
          </Button>
        }
      />

      <div className="flex items-center justify-between mb-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-slate-200/70 p-1">
            <TabsTrigger value="pendentes" className="px-4">Pendentes</TabsTrigger>
            <TabsTrigger value="concluidas" className="px-4">Concluídas</TabsTrigger>
            <TabsTrigger value="todas" className="px-4">Todas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-12">
          <Empty>Nenhum compromisso encontrado nesta aba.</Empty>
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
                    className={
                      "flex h-8 w-8 items-center justify-center rounded-lg " +
                      (today
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-slate-200/70 text-slate-600")
                    }
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-lg text-slate-900 capitalize">
                    {today ? "Hoje" : format(d, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </h3>
                  <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {items.map((a) => {
                    const late = !a.done && isPast(parseISO(a.starts_at));
                    const clientName = name(a.client_id, clients);
                    const propertyTitle = name(a.property_id, properties);
                    const kindLabel = APPOINTMENT_KINDS.find((k) => k.id === a.kind)?.label;
                    const badgeClass =
                      kindStyles[a.kind] ?? "bg-slate-100 text-slate-700 border-slate-200";

                    return (
                      <div
                        key={a.id}
                        className={
                          "group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border bg-white p-4 transition-all duration-150 hover:shadow-md " +
                          (late
                            ? "border-red-200 bg-red-50/20"
                            : a.done
                            ? "border-slate-200/60 bg-slate-50/50 opacity-75"
                            : "border-slate-200/90 shadow-card")
                        }
                      >
                        <div className="flex items-center gap-3.5">
                          <Checkbox
                            checked={a.done}
                            onCheckedChange={(c) => patch.mutate({ id: a.id, done: !!c })}
                            aria-label="Concluir"
                            className="h-5 w-5 rounded-md"
                          />

                          <div
                            className={
                              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold tabular-nums " +
                              (late
                                ? "bg-red-100 text-red-700"
                                : a.done
                                ? "bg-slate-100 text-slate-500"
                                : "bg-blue-50 text-blue-700")
                            }
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {format(parseISO(a.starts_at), "HH:mm")}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={
                                "font-semibold text-base text-slate-900 " +
                                (a.done ? "line-through text-slate-400" : "")
                              }
                            >
                              {a.title}
                            </p>
                            {late && (
                              <Badge variant="destructive" className="gap-1 text-[11px] px-2 py-0">
                                <AlertCircle className="h-3 w-3" />
                                Atrasado
                              </Badge>
                            )}
                          </div>

                          {(clientName || propertyTitle || a.notes) && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                              {clientName && (
                                <span className="flex items-center gap-1 font-medium text-slate-700">
                                  <User className="h-3.5 w-3.5 text-slate-400" />
                                  {clientName}
                                </span>
                              )}
                              {propertyTitle && (
                                <span className="flex items-center gap-1 font-medium text-slate-700">
                                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                  {propertyTitle}
                                </span>
                              )}
                              {a.notes && (
                                <span className="flex items-center gap-1 truncate max-w-md">
                                  <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  {a.notes}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {kindLabel && (
                            <Badge variant="outline" className={"font-medium " + badgeClass}>
                              {kindLabel}
                            </Badge>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => remove.mutate(a.id)}
                            aria-label="Excluir"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
