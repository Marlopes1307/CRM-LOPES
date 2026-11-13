import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bath, BedDouble, Car, ImagePlus, Maximize, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, Field, PageHeader, SelectField, opts } from "@/components/crm/ui";
import { PROPERTY_KINDS, PROPERTY_STATUS, brl } from "@/lib/crm";
import { emptyToNull, useTable, type Row } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/imoveis")({
  head: () => ({ meta: [{ title: "Imóveis — Corretor CRM" }] }),
  component: PropertiesPage,
});

type Property = Row<"properties">;
const BUCKET = "property-photos";

function usePhotoUrls(paths: string[]) {
  return useQuery({
    queryKey: ["photos", paths],
    enabled: paths.length > 0,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
      return Object.fromEntries((data ?? []).map((d) => [d.path, d.signedUrl]));
    },
  });
}

const blank = { title: "", kind: "apartamento", purpose: "venda", status: "disponivel", price: "", address: "", city: "", bedrooms: "", bathrooms: "", parking: "", area: "", description: "", owner_name: "", owner_phone: "" };
const NUM = ["price", "bedrooms", "bathrooms", "parking", "area"];

function PropertyForm({ initial, onDone }: { initial: Property | null; onDone: () => void }) {
  const { save } = useTable("properties");
  const [f, setF] = useState<typeof blank>(
    initial ? (Object.fromEntries(Object.keys(blank).map((k) => [k, (initial as Record<string, unknown>)[k] == null ? "" : String((initial as Record<string, unknown>)[k])])) as typeof blank) : blank,
  );
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const { data: urls } = usePhotoUrls(photos);
  const set = (k: keyof typeof blank) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const { data: u } = await supabase.auth.getUser();
    const added: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${u.user!.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.]/g, "_")}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file);
      if (error) toast.error(error.message);
      else added.push(path);
    }
    setPhotos((p) => [...p, ...added]);
    setUploading(false);
  }

  return (
    <form
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const v = emptyToNull(Object.fromEntries(Object.entries(f).map(([k, x]) => [k, NUM.includes(k) && x ? Number(x) : x])));
        save.mutate({ ...(initial ? { id: initial.id } : {}), ...v, title: f.title, photos } as never, { onSuccess: onDone });
      }}
    >
      <Field label="Título *" className="col-span-2 md:col-span-4"><Input required value={f.title} onChange={(e) => set("title")(e.target.value)} placeholder="Apartamento 3 quartos com varanda" /></Field>
      <Field label="Tipo"><SelectField value={f.kind} onChange={set("kind")} options={opts(PROPERTY_KINDS)} /></Field>
      <Field label="Finalidade"><SelectField value={f.purpose} onChange={set("purpose")} options={[{ id: "venda", label: "Venda" }, { id: "aluguel", label: "Aluguel" }]} /></Field>
      <Field label="Status"><SelectField value={f.status} onChange={set("status")} options={PROPERTY_STATUS} /></Field>
      <Field label="Preço (R$)"><Input type="number" value={f.price} onChange={(e) => set("price")(e.target.value)} /></Field>
      <Field label="Endereço" className="col-span-2 md:col-span-3"><Input value={f.address} onChange={(e) => set("address")(e.target.value)} /></Field>
      <Field label="Cidade"><Input value={f.city} onChange={(e) => set("city")(e.target.value)} /></Field>
      <Field label="Quartos"><Input type="number" value={f.bedrooms} onChange={(e) => set("bedrooms")(e.target.value)} /></Field>
      <Field label="Banheiros"><Input type="number" value={f.bathrooms} onChange={(e) => set("bathrooms")(e.target.value)} /></Field>
      <Field label="Vagas"><Input type="number" value={f.parking} onChange={(e) => set("parking")(e.target.value)} /></Field>
      <Field label="Área (m²)"><Input type="number" value={f.area} onChange={(e) => set("area")(e.target.value)} /></Field>
      <Field label="Proprietário" className="col-span-2"><Input value={f.owner_name} onChange={(e) => set("owner_name")(e.target.value)} /></Field>
      <Field label="Telefone do proprietário" className="col-span-2"><Input value={f.owner_phone} onChange={(e) => set("owner_phone")(e.target.value)} /></Field>
      <Field label="Descrição" className="col-span-2 md:col-span-4"><Textarea rows={3} value={f.description} onChange={(e) => set("description")(e.target.value)} /></Field>
      <div className="col-span-2 md:col-span-4">
        <p className="text-xs text-muted-foreground mb-2">Fotos</p>
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <div key={p} className="relative h-20 w-28 overflow-hidden rounded-lg bg-muted">
              {urls?.[p] && <img src={urls[p]} alt="" className="h-full w-full object-cover" />}
              <button type="button" onClick={() => setPhotos((x) => x.filter((y) => y !== p))} className="absolute right-1 top-1 rounded-full bg-card p-0.5" aria-label="Remover foto"><X className="h-3 w-3" /></button>
            </div>
          ))}
          <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted">
            <ImagePlus className="h-5 w-5" />{uploading ? "Enviando..." : "Adicionar"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
      </div>
      <Button className="col-span-2 md:col-span-4" disabled={save.isPending || uploading}>Salvar imóvel</Button>
    </form>
  );
}

function PropertyCard({ p, onEdit, onDelete }: { p: Property; onEdit: () => void; onDelete: () => void }) {
  const { data: urls } = usePhotoUrls(p.photos.slice(0, 1));
  const cover = p.photos[0] ? urls?.[p.photos[0]] : undefined;
  const status = PROPERTY_STATUS.find((s) => s.id === p.status)?.label;
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div className="relative aspect-[4/3] bg-muted">
        {cover ? <img src={cover} alt={p.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem foto</div>}
        <Badge className="absolute left-3 top-3">{status}</Badge>
        {p.photos.length > 1 && <span className="absolute right-3 bottom-3 rounded bg-card px-2 py-0.5 text-xs">{p.photos.length} fotos</span>}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.kind} · {p.purpose}</p>
        <h3 className="mt-1 text-lg leading-snug">{p.title}</h3>
        <p className="text-sm text-muted-foreground">{[p.address, p.city].filter(Boolean).join(", ")}</p>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          {p.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bedrooms}</span>}
          {p.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.bathrooms}</span>}
          {p.parking != null && <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" />{p.parking}</span>}
          {p.area != null && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{p.area} m²</span>}
        </div>
        <div className="mt-3 flex items-center">
          <span className="flex-1 font-semibold text-primary">{brl(Number(p.price))}{p.purpose === "aluguel" ? "/mês" : ""}</span>
          <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Excluir"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

function PropertiesPage() {
  const { rows, remove } = useTable("properties");
  const [editing, setEditing] = useState<Property | null | undefined>(undefined);
  const [status, setStatus] = useState("todos");
  const [q, setQ] = useState("");
  const list = useMemo(() => rows.filter((p) => (status === "todos" || p.status === status) && [p.title, p.address, p.city].join(" ").toLowerCase().includes(q.toLowerCase())), [rows, status, q]);
  return (
    <>
      <PageHeader title="Imóveis" subtitle={`${rows.length} imóveis na carteira`} action={<Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Novo imóvel</Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input className="flex-1 min-w-60 bg-card" placeholder="Buscar por título, endereço ou cidade" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="w-48"><SelectField value={status} onChange={setStatus} options={[{ id: "todos", label: "Todos os status" }, ...PROPERTY_STATUS]} /></div>
      </div>
      {list.length === 0 ? <Empty>Nenhum imóvel cadastrado.</Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => <PropertyCard key={p.id} p={p} onEdit={() => setEditing(p)} onDelete={() => confirm("Excluir imóvel?") && remove.mutate(p.id)} />)}
        </div>
      )}
      <Dialog open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar imóvel" : "Novo imóvel"}</DialogTitle></DialogHeader>
          {editing !== undefined && <PropertyForm initial={editing} onDone={() => setEditing(undefined)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
