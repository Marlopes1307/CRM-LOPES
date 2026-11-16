import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Building2, CalendarClock, MessageCircle, Pencil, Phone, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
type PropertyItem = Row<"properties"> & {
  captador_name?: string | null;
};

function getMatchingPropertiesForClient(c: {
  type?: string | null;
  budget?: number | string | null;
  interest?: string | null;
  stage?: string | null;
  status?: string | null;
}, properties: PropertyItem[]) {
  if (c.stage === "fechado" || c.stage === "perdido" || c.status === "adiado") return [];
  if (c.type && !["comprador", "investidor", "locatario"].includes(c.type)) return [];

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const stopWords = new Set([
    "com", "para", "que", "dos", "das", "por", "uma", "uns", "ate", "em", "na", "no", "de", "do", "da", "ou", "e",
  ]);

  const budget = c.budget != null && c.budget !== "" ? Number(c.budget) : null;
  const keywords = normalize(c.interest ?? "")
    .split(/[\s,.;/-]+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  return properties
    .filter((p) => {
      if (p.status !== "disponivel") return false;
      if (c.type === "locatario" && p.purpose !== "aluguel") return false;
      if ((c.type === "comprador" || c.type === "investidor") && p.purpose === "aluguel") return false;

      const propPrice = p.price != null ? Number(p.price) : null;
      const budgetOk = propPrice == null || budget == null || budget * 1.2 >= propPrice;
      if (!budgetOk) return false;

      if (keywords.length === 0) return budget != null && propPrice != null;

      const extraTags = [
        p.kind === "apartamento" ? "ap apto apartamento" : p.kind,
        p.bedrooms != null ? `${p.bedrooms} quarto quartos qts` : "",
        p.parking != null ? `${p.parking} vaga vagas` : "",
      ];

      const propText = normalize(
        [p.title, p.kind, p.purpose, p.address, p.city, p.description, ...extraTags]
          .filter(Boolean)
          .join(" "),
      );

      return keywords.some((kw) => propText.includes(kw));
    })
    .map((p) => {
      const propPrice = p.price != null ? Number(p.price) : null;
      const extraTags = [
        p.kind === "apartamento" ? "ap apto apartamento" : p.kind,
        p.bedrooms != null ? `${p.bedrooms} quarto quartos qts` : "",
        p.parking != null ? `${p.parking} vaga vagas` : "",
      ];
      const propText = normalize(
        [p.title, p.kind, p.purpose, p.address, p.city, p.description, ...extraTags]
          .filter(Boolean)
          .join(" "),
      );
      const matchedWords = keywords.filter((kw) => propText.includes(kw));
      const reasons: string[] = [];

      if (budget != null && propPrice != null) {
        reasons.push(budget >= propPrice ? "Dentro do orçamento" : "Próximo ao teto (+20%)");
      }
      if (matchedWords.length > 0) {
        reasons.push(`Match: ${matchedWords.slice(0, 3).join(", ")}`);
      }

      return { property: p, reasons, score: matchedWords.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

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

  const { data: sharedProperties = [] } = useQuery({
    queryKey: ["shared_properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_properties" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PropertyItem[];
    },
  });

  const matchingProperties = useMemo(
    () => getMatchingPropertiesForClient(f, sharedProperties),
    [f, sharedProperties],
  );

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

      <div className="col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Imóveis Compatíveis na Carteira ({matchingProperties.length})
          </h4>
          <span className="text-[11px] text-muted-foreground">Atualiza em tempo real</span>
        </div>

        {matchingProperties.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum imóvel disponível compatível encontrado para o orçamento e interesse informados.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {matchingProperties.map(({ property: p, reasons }) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-2.5 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-muted-foreground truncate">
                    {[p.address, p.city].filter(Boolean).join(", ") || "Localização não informada"}
                  </p>
                  {reasons.length > 0 && (
                    <p className="text-[11px] text-emerald-700 font-medium truncate">
                      {reasons.join(" · ")}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">
                    {p.price != null ? brl(Number(p.price)) : "Sob consulta"}
                  </p>
                  <p className="text-[10px] uppercase text-muted-foreground">{p.kind}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

  const { data: sharedProperties = [] } = useQuery({
    queryKey: ["shared_properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_properties" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PropertyItem[];
    },
  });

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

) : ( 

{list.map((c) => { 
const wa = whatsappLink(c.phone); 
const isDue = c.status === "adiado" && c.follow_up_date && c.follow_up_date <= todayStr; 
const propMatches = getMatchingPropertiesForClient(c, sharedProperties);
retornar ( 
<div 
key={c.id} 
className={ rounded-xl border bg-card p-5 shadow-card ${ isDue ? "border-amber-500 ring-1 ring-amber-500/30" : "" }} 
> 


{c.name} 

{c.type} 
{c.source ?  · ${c.source}: ""} 


{stageLabel(c.stage)}
{c.status !== "adiado" && propMatches.length > 0 && ( 
<button 
type="button" 
onClick={() => setEditing(c)} 
className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20 transition-colors" 
> 

{propMatches.length} {propMatches.length === 1 ? "imóvel compatível" : "imóvel compatível"} 

)}
{c.status === "adiado" && (

{c.deferred_reason && (

Motivo: {c.deferred_reason}

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
{c.phone && ( <a href={ } aria-label="Ligar">

 )} {c.status === "adiado" && ( <Button size="sm" variant="outline" className="h-8 text-xs mr-1" onClick={() => save.mutate({ id: c.id, status: "ativo", deferred_reason: null, follow_up_date: null, } as never) } title="Mover de volta para Clientes Ativos" > Reativar )} <Button size="icon" variant="ghost" onClick={() => setEditing(c)} aria-label="Editar"> <Button size="icon" variant="ghost" onClick={() => confirm("Excluir cliente?") && remove.mutate(c.id)} aria-label="Excluir" > ); })} )}tel:${c.phone}







































<Dialog open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)}>


{editing ? "Editar cliente" : "Novo cliente"}

<ClientForm initial={editing} onDone={() => setEditing(undefined)} />


</>
);
}

