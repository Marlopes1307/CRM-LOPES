import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, MessageCircle, Pencil, Phone, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, Field, PageHeader, SelectField, opts } from "@/components/crm/ui";
import { CLIENT_TYPES, SOURCES, STAGES, brl, stageLabel, whatsappLink } from "@/lib/crm";
import { emptyToNull, useTable, type Row } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Corretor CRM" }] }),
  component: ClientsPage,
});

type Client = Row<"clients"> & {
  status?: string | null;
  deferred_reason?: string | null;
  follow_up_date?: string | null;
};

const blank = {
  name: "",
  email: "",
  phone: "",
  type: "comprador",
  source: "",
  budget: "",
  interest: "",
  stage: "novo",
  notes: "",
  status: "ativo",
  deferred_reason: "",
  follow_up_date: "",
};

const STATUS_OPTIONS = [
  { id: "ativo", label: "Ativo (Em busca)" },
  { id: "adiado", label: "Compra Adiada (Fora de momento)" },
];

export function ClientForm({ initial, onDone }: { initial?: Client | null | undefined; onDone: () => void }) {
  const { save } = useTable("clients");
  const [f, setF] = useState<typeof blank>(() => {
    if (!initial) return blank;
    const obj = Object.fromEntries(
      Object.keys(blank).map((k) => [
        k,
        (initial as Record<string, unknown>)[k] == null ? "" : String((initial as Record<string, unknown>)[k]),
      ]),
    ) as typeof blank;
    if (!obj.status) obj.status = "ativo";
    return obj;
  });

  const set = (k: keyof typeof blank) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <form
      className="grid grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const v = emptyToNull({ ...f, budget: f.budget ? Number(f.budget) : "" });
        save.mutate(
          {
            ...(initial ? { id: initial.id } : {}),
            name: f.name,
            email: v["email"],
            phone: v["phone"],
            type: f.type,
            source: v["source"],
            budget: v["budget"],
            interest: v["interest"],
            stage: f.stage,
            notes: v["notes"],
            status: f.status || "ativo",
            deferred_reason: f.status === "adiado" ? v["deferred_reason"] : null,
            follow_up_date: f.status === "adiado" ? v["follow_up_date"] : null,
          } as never,
          { onSuccess: onDone },
        );
      }}
    >
      <Field label="Nome *" className="col-span-2">
        <Input required value={f.name} onChange={(e) => set("name")(e.target.value)} />
      </Field>
      <Field label="Telefone / WhatsApp">
        <Input value={f.phone} onChange={(e) => set("phone")(e.target.value)} />
      </Field>
      <Field label="E-mail">
        <Input type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} />
      </Field>
      <Field label="Tipo">
        <SelectField value={f.type} onChange={set("type")} options={opts(CLIENT_TYPES)} />
      </Field>
      <Field label="Origem">
        <SelectField value={f.source} onChange={set("source")} options={SOURCES.map((s) => ({ id: s, label: s }))} />
      </Field>
      <Field label="Orçamento (R$)">
        <Input type="number" value={f.budget} onChange={(e) => set("budget")(e.target.value)} />
      </Field>
      <Field label="Etapa">
        <SelectField value={f.stage} onChange={set("stage")} options={STAGES.map((s) => ({ id: s.id, label: s.label }))} />
      </Field>

      <Field label="Situação do Cliente" className="col-span-2">
        <SelectField value={f.status} onChange={set("status")} options={STATUS_OPTIONS} />
      </Field>

      {f.status === "adiado" && (
        <>
          <Field label="Motivo do adiamento" className="col-span-2 sm:col-span-1">
            <Input
              placeholder="Ex: Juntando entrada, aguardando venda..."
              value={f.deferred_reason}
              onChange={(e) => set("deferred_reason")(e.target.value)}
            />
          </Field>
          <Field label="Previsão de retorno" className="col-span-2 sm:col-span-1">
            <Input
              type="date"
              value={f.follow_up_date}
              onChange={(e) => set("follow_up_date")(e.target.value)}
            />
          </Field>
        </>
      )}

      <Field label="Interesse (ex: 3 quartos, Zona Sul)" className="col-span-2">
        <Input value={f.interest} onChange={(e) => set("interest")(e.target.value)} />
      </Field>
      <Field label="Anotações" className="col-span-2">
        <Textarea rows={3} value={f.notes} onChange={(e) => set("notes")(e.target.value)} />
      </Field>
      <Button className="col-span-2" disabled={save.isPending}>
        Salvar cliente
      </Button>
    </form>
  );
}

function formatDateBR(isoDate?: string | null) {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function ClientsPage() {
  const { rows, save, remove } = useTable("clients");
  const typedRows = rows as Client[];

  const [tab, setTab] = useState<"ativo" | "adiado">("ativo");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("todos");
  const [editing, setEditing] = useState<Client | null | undefined>(undefined);

  const activeCount = useMemo(
    () => typedRows.filter((c) => (c.status ?? "ativo") !== "adiado").length,
    [typedRows],
  );
  const deferredCount = useMemo(
    () => typedRows.filter((c) => c.status === "adiado").length,
    [typedRows],
  );

  const list = useMemo(() => {
    const filtered = typedRows.filter((c) => {
      const isDeferred = c.status === "adiado";
      if (tab === "adiado" && !isDeferred) return false;
      if (tab === "ativo" && isDeferred) return false;

      return (
        (stage === "todos" || c.stage === stage) &&
        [c.name, c.email, c.phone, c.interest, c.deferred_reason]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())
      );
    });

    if (tab === "adiado") {
      return [...filtered].sort((a, b) => {
        if (!a.follow_up_date) return 1;
        if (!b.follow_up_date) return -1;
        return a.follow_up_date.localeCompare(b.follow_up_date);
      });
    }

    return filtered;
  }, [typedRows, tab, q, stage]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle={`${activeCount} ativos · ${deferredCount} com compra adiada`}
        action={
          <Button onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" /> Novo cliente
          </Button>
        }
      />

      <div className="mb-4 flex gap-2 border-b pb-3">
        <Button
          type="button"
          variant={tab === "ativo" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("ativo")}
        >
          Clientes Ativos ({activeCount})
        </Button>
        <Button
          type="button"
          variant={tab === "adiado" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("adiado")}
          className={tab === "adiado" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
        >
          <CalendarClock className="mr-1.5 h-4 w-4" />
          Compra Adiada ({deferredCount})
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-card"
            placeholder="Buscar por nome, telefone, interesse ou motivo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="w-48">
          <SelectField
            value={stage}
            onChange={setStage}
            options={[{ id: "todos", label: "Todas as etapas" }, ...STAGES]}
          />
        </div>
      </div>

      {list.length === 0 ? (
        <Empty>
          {tab === "adiado"
            ? "Nenhum cliente com compra adiada no momento."
            : "Nenhum cliente ativo encontrado."}
        </Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const wa = whatsappLink(c.phone);
            const isDue = c.status === "adiado" && c.follow_up_date && c.follow_up_date <= todayStr;

            return (
              <div
                key={c.id}
                className={`rounded-xl border bg-card p-5 shadow-card ${
                  isDue ? "border-amber-500 ring-1 ring-amber-500/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg">{c.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {c.type}
                      {c.source ? ` · ${c.source}` : ""}
                    </p>
                  </div>
                  <Badge variant="secondary">{stageLabel(c.stage)}</Badge>
                </div>

                {c.status === "adiado" && (
                  <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs space-y-1">
                    {c.deferred_reason && (
                      <p className="text-foreground">
                        <strong>Motivo:</strong> {c.deferred_reason}
                      </p>
                    )}
{c.follow_up_date && (
<p className={isDue ? "font-bold text-amber-600" : "text-muted-foreground"}>
Retorno previsto: {formatDateBR(c.follow_up_date)} {isDue ? "(Hora de retomar!)" : ""}

)}

)}
{c.interest && {c.interest}}
{c.budget != null && (
Até {brl(Number(c.budget))}
)}
{wa && (





)}
{c.phone && (

<a href={tel:${c.phone}} aria-label="Ligar">



)}

{c.status === "adiado" && (
<Button
size="sm"
variant="outline"
className="h-8 text-xs mr-1"
onClick={() =>
save.mutate({
id: c.id,
status: "ativo",
deferred_reason: null,
follow_up_date: null,
} as never)
}
title="Mover de volta para Clientes Ativos"
>
 Reativar

)}
<Button size="icon" variant="ghost" onClick={() => setEditing(c)} aria-label="Editar">


<Button
size="icon"
variant="ghost"
onClick={() => confirm("Excluir cliente?") && remove.mutate(c.id)}
aria-label="Excluir"
>




);
})}

)}
<Dialog open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)}>


{editing ? "Editar cliente" : "Novo cliente"}

<ClientForm initial={editing} onDone={() => setEditing(undefined)} />


</>
);
}
