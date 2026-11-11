import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Home,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
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

type Client = Row<"clients">;
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
};

const stageBadgeStyles: Record<string, string> = {
  novo: "bg-blue-50 text-blue-700 border-blue-200",
  contato: "bg-indigo-50 text-indigo-700 border-indigo-200",
  visita: "bg-amber-50 text-amber-700 border-amber-200",
  proposta: "bg-purple-50 text-purple-700 border-purple-200",
  fechado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  perdido: "bg-slate-100 text-slate-600 border-slate-200",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function ClientForm({
  initial,
  onDone,
}: {
  initial?: Client | null | undefined;
  onDone: () => void;
}) {
  const { save } = useTable("clients");
  const [f, setF] = useState<typeof blank>(
    initial
      ? (Object.fromEntries(
          Object.keys(blank).map((k) => [
            k,
            (initial as Record<string, unknown>)[k] == null
              ? ""
              : String((initial as Record<string, unknown>)[k]),
          ])
        ) as typeof blank)
      : blank
  );
  const set = (k: keyof typeof blank) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <form
      className="grid grid-cols-2 gap-4 pt-2"
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
          } as never,
          { onSuccess: onDone }
        );
      }}
    >
      <Field label="Nome completo *" className="col-span-2">
        <Input
          required
          placeholder="Ex: João Silva"
          value={f.name}
          onChange={(e) => set("name")(e.target.value)}
        />
      </Field>
      <Field label="Telefone / WhatsApp">
        <Input
          placeholder="(62) 99999-9999"
          value={f.phone}
          onChange={(e) => set("phone")(e.target.value)}
        />
      </Field>
      <Field label="E-mail">
        <Input
          type="email"
          placeholder="cliente@email.com"
          value={f.email}
          onChange={(e) => set("email")(e.target.value)}
        />
      </Field>
      <Field label="Perfil">
        <SelectField value={f.type} onChange={set("type")} options={opts(CLIENT_TYPES)} />
      </Field>
      <Field label="Origem do lead">
        <SelectField
          value={f.source}
          onChange={set("source")}
          options={SOURCES.map((s) => ({ id: s, label: s }))}
        />
      </Field>
      <Field label="Orçamento máximo (R$)">
        <Input
          type="number"
          placeholder="450000"
          value={f.budget}
          onChange={(e) => set("budget")(e.target.value)}
        />
      </Field>
      <Field label="Etapa no funil">
        <SelectField
          value={f.stage}
          onChange={set("stage")}
          options={STAGES.map((s) => ({ id: s.id, label: s.label }))}
        />
      </Field>
      <Field label="O que procura" className="col-span-2">
        <Input
          placeholder="Ex: Apartamento 3 quartos, varanda gourmet, Setor Bueno"
          value={f.interest}
          onChange={(e) => set("interest")(e.target.value)}
        />
      </Field>
      <Field label="Anotações importantes" className="col-span-2">
        <Textarea
          rows={3}
          placeholder="Detalhes sobre financiamento, permuta ou melhor horário para contato..."
          value={f.notes}
          onChange={(e) => set("notes")(e.target.value)}
        />
      </Field>
      <Button className="col-span-2 h-10 font-semibold mt-1" disabled={save.isPending}>
        {save.isPending ? "Salvando..." : "Salvar cliente"}
      </Button>
    </form>
  );
}

function ClientsPage() {
  const { rows, remove } = useTable("clients");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("todos");
  const [editing, setEditing] = useState<Client | null | undefined>(undefined);

  const list = useMemo(
    () =>
      rows.filter(
        (c) =>
          (stage === "todos" || c.stage === stage) &&
          [c.name, c.email, c.phone, c.interest]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase())
      ),
    [rows, q, stage]
  );

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Clientes"
        subtitle={`${rows.length} ${rows.length === 1 ? "contato" : "contatos"} na sua carteira`}
        action={
          <Button onClick={() => setEditing(null)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      {/* Barra de Busca e Filtro */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10 border-0 bg-slate-50 focus-visible:ring-1"
            placeholder="Buscar por nome, telefone, e-mail ou imóvel desejado..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <SelectField
            value={stage}
            onChange={setStage}
            options={[{ id: "todos", label: "Todas as etapas" }, ...STAGES]}
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-14">
          <Empty>Nenhum cliente encontrado com esses filtros.</Empty>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const wa = whatsappLink(c.phone);
            const badgeStyle =
              stageBadgeStyles[c.stage] ?? "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <div
                key={c.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  {/* Topo: Avatar + Nome + Etapa */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-display text-sm font-bold border border-blue-100">
                        {getInitials(c.name) || <Users className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-semibold text-slate-900 truncate">
                          {c.name}
                        </h3>
                        <p className="text-xs text-slate-500 capitalize truncate">
                          {c.type}
                          {c.source ? ` · ${c.source}` : ""}
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className={`shrink-0 font-medium ${badgeStyle}`}>
                      {stageLabel(c.stage)}
                    </Badge>
                  </div>

                  {/* Meio: Interesse e Orçamento */}
                  {(c.interest || c.budget != null) && (
                    <div className="mt-4 rounded-xl bg-slate-50/90 border border-slate-100 p-3 space-y-2">
                      {c.interest && (
                        <div className="flex items-start gap-2 text-xs text-slate-700">
                          <Home className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed">{c.interest}</span>
                        </div>
                      )}
                      {c.budget != null && (
                        <div className="flex items-center gap-2 text-xs">
                          <Wallet className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="text-slate-500">Orçamento:</span>
                          <span className="font-semibold text-slate-900 tabular-nums">
                            Até {brl(Number(c.budget))}
                          </span>
                        </div>
                      )}
