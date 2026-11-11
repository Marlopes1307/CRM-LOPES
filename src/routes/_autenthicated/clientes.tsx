import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, Field, PageHeader, SelectField, opts } from "@/components/crm/ui";
import { CLIENT_TYPES, SOURCES, STAGES, brl, stageLabel, whatsappLink } from "@/lib/crm";
import { emptyToNull, useTable, type Row } from "@/lib/use-table";

export const Route = createFileRoute("/_autenthicated/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Corretor CRM" }] }),
  component: ClientsPage,
});

type Client = Row<"clients">;
const blank = { name: "", email: "", phone: "", type: "comprador", source: "", budget: "", interest: "", stage: "novo", notes: "" };

export function ClientForm({ initial, onDone }: { initial?: Client | null | undefined; onDone: () => void }) {
  const { save } = useTable("clients");
  const [f, setF] = useState<typeof blank>(
    initial ? (Object.fromEntries(Object.keys(blank).map((k) => [k, (initial as Record<string, unknown>)[k] == null ? "" : String((initial as Record<string, unknown>)[k])])) as typeof blank) : blank,
  );
  const set = (k: keyof typeof blank) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <form
      className="grid grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const v = emptyToNull({ ...f, budget: f.budget ? Number(f.budget) : "" });
        save.mutate({ ...(initial ? { id: initial.id } : {}), name: f.name, email: v["email"], phone: v["phone"], type: f.type, source: v["source"], budget: v["budget"], interest: v["interest"], stage: f.stage, notes: v["notes"] } as never, { onSuccess: onDone });
      }}
    >
      <Field label="Nome *" className="col-span-2"><Input required value={f.name} onChange={(e) => set("name")(e.target.value)} /></Field>
      <Field label="Telefone / WhatsApp"><Input value={f.phone} onChange={(e) => set("phone")(e.target.value)} /></Field>
      <Field label="E-mail"><Input type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} /></Field>
      <Field label="Tipo"><SelectField value={f.type} onChange={set("type")} options={opts(CLIENT_TYPES)} /></Field>
      <Field label="Origem"><SelectField value={f.source} onChange={set("source")} options={SOURCES.map((s) => ({ id: s, label: s }))} /></Field>
      <Field label="Orçamento (R$)"><Input type="number" value={f.budget} onChange={(e) => set("budget")(e.target.value)} /></Field>
      <Field label="Etapa"><SelectField value={f.stage} onChange={set("stage")} options={STAGES.map((s) => ({ id: s.id, label: s.label }))} /></Field>
      <Field label="Interesse (ex: 3 quartos, Zona Sul)" className="col-span-2"><Input value={f.interest} onChange={(e) => set("interest")(e.target.value)} /></Field>
      <Field label="Anotações" className="col-span-2"><Textarea rows={3} value={f.notes} onChange={(e) => set("notes")(e.target.value)} /></Field>
      <Button className="col-span-2" disabled={save.isPending}>Salvar cliente</Button>
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
          [c.name, c.email, c.phone, c.interest].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q, stage],
  );

  return (
    <>
      <PageHeader title="Clientes" subtitle={`${rows.length} contatos na sua carteira`} action={<Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Novo cliente</Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 bg-card" placeholder="Buscar por nome, telefone, interesse..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="w-48"><SelectField value={stage} onChange={setStage} options={[{ id: "todos", label: "Todas as etapas" }, ...STAGES]} /></div>
      </div>
      {list.length === 0 ? (
        <Empty>Nenhum cliente encontrado.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const wa = whatsappLink(c.phone);
            return (
              <div key={c.id} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg">{c.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{c.type}{c.source ? ` · ${c.source}` : ""}</p>
                  </div>
                  <Badge variant="secondary">{stageLabel(c.stage)}</Badge>
                </div>
                {c.interest && <p className="mt-3 text-sm">{c.interest}</p>}
                {c.budget != null && <p className="mt-1 text-sm font-semibold text-primary">Até {brl(Number(c.budget))}</p>}
                <div className="mt-4 flex gap-1">
                  {wa && <Button asChild size="icon" variant="ghost"><a href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a></Button>}
                  {c.phone && <Button asChild size="icon" variant="ghost"><a href={`tel:${c.phone}`} aria-label="Ligar"><Phone className="h-4 w-4" /></a></Button>}
                  <div className="flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => setEditing(c)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm("Excluir cliente?") && remove.mutate(c.id)} aria-label="Excluir"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
          <ClientForm initial={editing} onDone={() => setEditing(undefined)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
