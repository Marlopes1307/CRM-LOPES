import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bath, BedDouble, Car, ImagePlus, Maximize, MessageCircle, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, Field, PageHeader, SelectField, opts } from "@/components/crm/ui";
import { PROPERTY_KINDS, PROPERTY_STATUS, brl, whatsappLink } from "@/lib/crm";
import { emptyToNull, useTable, type Row } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/imoveis")({
  head: () => ({ meta: [{ title: "Imóveis — Corretor CRM" }] }),
  component: PropertiesPage,
});

type Property = Row<"properties"> & {
  captador_name?: string | null;
};

type ClientMatchItem = Row<"clients"> & {
  status?: string | null;
};

const BUCKET = "property-photos";

function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user-profile"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", user.id)
        .single();
      return { id: user.id, role: profile?.role ?? "corretor" };
    },
  });
}

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

function getMatchingClients(p: Property, clients: ClientMatchItem[]) {
  const propPrice = p.price != null ? Number(p.price) : null;
  const propText = [p.title, p.kind, p.purpose, p.address, p.city, p.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return clients
    .filter((c) => {
      if (c.stage === "fechado" || c.stage === "perdido" || c.status === "adiado") return false;
      if (c.type && !["comprador", "investidor", "locatario"].includes(c.type)) return false;
      if (c.type === "locatario" && p.purpose !== "aluguel") return false;
      if ((c.type === "comprador" || c.type === "investidor") && p.purpose === "aluguel") return false;

      const budget = c.budget != null ? Number(c.budget) : null;
      const budgetOk = propPrice == null || budget == null || budget * 1.15 >= propPrice;
      if (!budgetOk) return false;

      const keywords = (c.interest ?? "")
        .toLowerCase()
        .split(/[\s,.;/-]+/)
        .filter((w) => w.length >= 3 && !["com", "para", "que", "dos", "das", "por", "uma", "uns"].includes(w));

      const matchedWords = keywords.filter((kw) => propText.includes(kw));

      return matchedWords.length > 0 || (keywords.length === 0 && budget != null && propPrice != null);
    })
    .map((c) => {
      const budget = c.budget != null ? Number(c.budget) : null;
      const keywords = (c.interest ?? "")
        .toLowerCase()
        .split(/[\s,.;/-]+/)
        .filter((w) => w.length >= 3 && !["com", "para", "que", "dos", "das", "por", "uma", "uns"].includes(w));
      const matchedWords = keywords.filter((kw) => propText.includes(kw));

      const reasons: string[] = [];
      if (budget != null && propPrice != null) {
        reasons.push(budget >= propPrice ? "Dentro do orçamento" : "Orçamento próximo (+15%)");
      }
      if (matchedWords.length > 0) {
        reasons.push(`Perfil: ${matchedWords.slice(0, 3).join(", ")}`);
      }

      return { client: c, reasons };
    });
}

const blank = {
  title: "",
  kind: "apartamento",
  purpose: "venda",
  status: "disponivel",
  price: "",
  address: "",
  city: "",
  bedrooms: "",
  bathrooms: "",
  parking: "",
  area: "",
  description: "",
  owner_name: "",
  owner_phone: "",
};

const NUM = ["price", "bedrooms", "bathrooms", "parking", "area"];

function PropertyForm({ initial, onDone }: { initial: Property | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const { save } = useTable("properties");
  const [f, setF] = useState<typeof blank>(
    initial
      ? (Object.fromEntries(
          Object.keys(blank).map((k) => [
            k,
            (initial as Record<string, unknown>)[k] == null ? "" : String((initial as Record<string, unknown>)[k]),
          ]),
        ) as typeof blank)
      : blank,
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
        const v = emptyToNull(
          Object.fromEntries(Object.entries(f).map(([k, x]) => [k, NUM.includes(k) && x ? Number(x) : x])),
        );
        save.mutate(
          { ...(initial ? { id: initial.id } : {}), ...v, title: f.title, photos } as never,
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["shared_properties"] });
              onDone();
            },
          },
        );
      }}
    >
      <Field label="Título *" className="col-span-2 md:col-span-4">
        <Input
          required
          value={f.title}
          onChange={(e) => set("title")(e.target.value)}
          placeholder="Apartamento 3 quartos com varanda"
        />
      </Field>
      <Field label="Tipo">
        <SelectField value={f.kind} onChange={set("kind")} options={opts(PROPERTY_KINDS)} />
      </Field>
      <Field label="Finalidade">
        <SelectField
          value={f.purpose}
          onChange={set("purpose")}
          options={[
            { id: "venda", label: "Venda" },
            { id: "aluguel", label: "Aluguel" },
          ]}
        />
      </Field>
      <Field label="Status">
        <SelectField value={f.status} onChange={set("status")} options={PROPERTY_STATUS} />
      </Field>
      <Field label="Preço (R$)">
        <Input type="number" value={f.price} onChange={(e) => set("price")(e.target.value)} />
      </Field>
      <Field label="Endereço" className="col-span-2 md:col-span-3">
        <Input value={f.address} onChange={(e) => set("address")(e.target.value)} />
      </Field>
      <Field label="Cidade">
        <Input value={f.city} onChange={(e) => set("city")(e.target.value)} />
      </Field>
      <Field label="Quartos">
        <Input type="number" value={f.bedrooms} onChange={(e) => set("bedrooms")(e.target.value)} />
      </Field>
      <Field label="Banheiros">
        <Input type="number" value={f.bathrooms} onChange={(e) => set("bathrooms")(e.target.value)} />
      </Field>
      <Field label="Vagas">
        <Input type="number" value={f.parking} onChange={(e) => set("parking")(e.target.value)} />
      </Field>
      <Field label="Área (m²)">
        <Input type="number" value={f.area} onChange={(e) => set("area")(e.target.value)} />
      </Field>
      <Field label="Proprietário" className="col-span-2">
        <Input value={f.owner_name} onChange={(e) => set("owner_name")(e.target.value)} />
      </Field>
      <Field label="Telefone do proprietário" className="col-span-2">
        <Input value={f.owner_phone} onChange={(e) => set("owner_phone")(e.target.value)} />
      </Field>
                <Field label="Descrição" className="col-span-2">
        <Textarea rows={4} value={f.description} onChange={(e) => set("description")(e.target.value)} />
      </Field>

      <div className="col-span-2 space-y-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          <ImagePlus className="h-4 w-4" />
          <span>{uploading ? "Enviando fotos..." : "Adicionar fotos"}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {f.photos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {f.photos.map((path, idx) => (
              <span
                key={path}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
              >
                Foto {idx + 1}
                <button
                  type="button"
                  onClick={() =>
                    setF((prev) => ({
                      ...prev,
                      photos: prev.photos.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Button className="col-span-2" disabled={save.isPending || uploading}>
        {save.isPending ? "Salvando..." : "Salvar imóvel"}
      </Button>

          <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted">
            <ImagePlus className="h-5 w-5" />
            {uploading ? "Enviando..." : "Adicionar"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
           <Button className="col-span-2" disabled={save.isPending || uploading}>
        {save.isPending ? "Salvando..." : "Salvar imóvel"}
      </Button>
    </form>
  );
}

async function generatePropertyPDF(p: Property, photoUrls: Record<string, string> = {}) {
toast.info("Preparando ficha em PDF...");
let corretorNome = p.captador_name || "Mota Negócios Imobiliários";
let corretorTelefone = "";
let corretorEmail = "";
let corretorCreci = "";
try {
const { data: { user } } = await supabase.auth.getUser();
if (user) {
const coverUrl = p.photos?. ? urls?.[p.photos] : undefined;
const { data: profile } = await supabase
.from("profiles")
.select("*")
.eq("id", user.id)
.single();
if (profile) {
corretorNome = profile.full_name || profile.name || corretorNome;
corretorTelefone = profile.phone || profile.whatsapp || profile.telefone || "";
corretorEmail = profile.email || user.email || "";
corretorCreci = profile.creci || "";
}
}
} catch (err) {
console.error("Erro ao buscar perfil do corretor:", err);
}
const photos = (p.photos ?? [])
.map((path) => photoUrls[path])
.filter(Boolean);
const formattedPrice = p.price != null ? brl(p.price) : "Sob consulta";
const location = [p.address, p.city].filter(Boolean).join(", ");
const printWindow = window.open("", "_blank");
if (!printWindow) {
toast.error("Por favor, permita pop-ups no navegador para gerar o PDF.");
return;
}
const html = <!DOCTYPE html> <html lang="pt-BR"> <head> <meta charset="UTF-8" /> <title>${p.title} - Ficha do Imóvel</title> <style> * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; } body { color: #1e293b; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; } .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; } .brand { font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px; } .badge { display: inline-block; background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 8px; } h1 { font-size: 24px; color: #0f172a; margin-bottom: 6px; } .location { font-size: 14px; color: #64748b; } .price-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; } .price-label { font-size: 12px; color: #64748b; text-transform: uppercase; } .price-value { font-size: 24px; font-weight: 800; color: #059669; } .specs { display: flex; gap: 16px; font-size: 13px; font-weight: 600; color: #334155; } .main-photo { width: 100%; height: 340px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; } .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; } .photo-grid img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; } .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; border-left: 3px solid #059669; padding-left: 8px; } .description { font-size: 14px; line-height: 1.6; color: #475569; white-space: pre-line; margin-bottom: 32px; } .footer { border-top: 2px solid #e2e8f0; padding-top: 16px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; } .broker-info { font-size: 13px; color: #1e293b; } .broker-phone { font-size: 14px; font-weight: 700; color: #059669; margin-top: 2px; } .doc-date { font-size: 11px; color: #94a3b8; } @media print { body { padding: 0; } @page { margin: 1.5cm; } } </style> </head> <body> <div class="header"> <div> <div class="brand">Mota Negócios Imobiliários</div> <div style="margin-top: 8px;"> <span class="badge">${p.kind} · ${p.purpose === "venda" ? "Venda" : "Aluguel"}</span> <h1>${p.title}</h1> ${location ?📍 ${location}` : ""}


Valor do Investimento
${formattedPrice}


${p.bedrooms != null ? <span>🛏️ ${p.bedrooms} Quartos</span> : ""}
${p.bathrooms != null ? <span>🚿 ${p.bathrooms} Banheiros</span> : ""}
${p.parking != null ? <span>🚗 ${p.parking} Vagas</span> : ""}
${p.area != null ? <span>📐 ${p.area} m²</span> : ""}

${photos.length > 0 ? <img src="${photos}" class="main-photo" alt="Foto principal" />

${photos.slice(1, 7).map((url) => <img src="${url}" alt="Foto do imóvel" />).join("")}

: ""} : ""}
${p.description ? <div> <div class="section-title">Descrição do Imóvel</div> <p class="description">${p.description}</p> </div> : ""}
Atendimento: ${corretorNome}${corretorCreci ? — ${corretorCreci.toUpperCase().includes("CRECI") ? corretorCreci :CRECI: ${corretorCreci}} : ""}
${corretorTelefone ? <div class="broker-phone">📱 WhatsApp / Tel: ${corretorTelefone}</div> : ""}
${corretorEmail ? <div style="font-size: 12px; color: #475569; margin-top: 2px;">✉️ ${corretorEmail}</div> : ""}

Ficha gerada em ${new Date().toLocaleDateString("pt-BR")}
window.onload = function() {
setTimeout(() => {
window.print();
}, 700);
};



`;
printWindow.document.open();
printWindow.document.write(html);
printWindow.document.close();
}
function PropertyDetailsDialog({
p,
open,
onClose,
}: {
p: Property | null;
open: boolean;
onClose: () => void;
}) {
const { data: urls } = usePhotoUrls(p?.photos ?? []);
const { rows: clients } = useTable("clients");
const [activePhoto, setActivePhoto] = useState(0);
const matches = useMemo(() => {
if (!p) return [];
return getMatchingClients(p, clients as ClientMatchItem[]);
}, [p, clients]);
if (!p) return null;
const photos = p.photos ?? [];
const currentUrl = photos[activePhoto] ? urls?.[photos[activePhoto]] : undefined;
const status = PROPERTY_STATUS.find((s) => s.id === p.status)?.label;
return (
<Dialog open={open} onOpenChange={(v) => !v && onClose()}>




{status}

{p.kind} · {p.purpose}


<Button
type="button"
onClick={() => generatePropertyPDF(p, urls ?? {})}
className="bg-emerald-600 hover:bg-emerald-700 text-white"
>
Gerar Ficha em PDF

{p.title}

{[p.address, p.city].filter(Boolean).join(", ")}

{photos.length > 0 ? (


{currentUrl ? (

) : (
Carregando foto...
)}

{photos.length > 1 && (

{photos.map((path, idx) => (
<Button
key={path}
type="button"
variant={activePhoto === idx ? "default" : "outline"}
size="sm"
onClick={() => setActivePhoto(idx)}
>
Foto {idx + 1}

))}

)}

) : (

Nenhuma foto cadastrada

)}
Valor

{p.price != null ? brl(p.price) : "Sob consulta"}



{p.bedrooms != null && (

 {p.bedrooms} quartos

)}
{p.bathrooms != null && (

 {p.bathrooms} banheiros

)}
{p.parking != null && (

 {p.parking} vagas

)}
{p.area != null && (

 {p.area} m²

)}

{p.description && (

Descrição do imóvel

{p.description}


)}
{/* Cruzamento Automático: Clientes Compatíveis */}




Clientes Compatíveis ({matches.length})


Cruzamento automático por orçamento e perfil

{matches.length === 0 ? (

Nenhum cliente ativo compatível encontrado para este perfil e faixa de valor.

) : (

{matches.map(({ client: c, reasons }) => {
const wa = whatsappLink(c.phone);
return (


{c.name}
{c.budget != null && (

Orçamento: até {brl(Number(c.budget))}

)}
{reasons.length > 0 && (

{reasons.join(" · ")}

)}
{wa && (


 WhatsApp


)}

);
})}

)}
{p.captador_name ? Captado por: ${p.captador_name} : ""}




);
}
function PropertyCard({
p,
canEdit,
onView,
onEdit,
onDelete,
}: {
p: Property;
canEdit: boolean;
onView: () => void;
onEdit: () => void;
onDelete: () => void;
}) {
const { data: urls } = usePhotoUrls((p.photos ?? []).slice(0, 1));
const cover = p.photos?.[0] ? urls?.[p.photos[0]] : undefined;
const status = PROPERTY_STATUS.find((s) => s.id === p.status)?.label;
return (



{cover ? (

) : (

Sem foto

)}
{status}
{(p.photos?.length ?? 0) > 1 && (

{p.photos.length} fotos

)}
{p.kind} · {p.purpose}

{p.title}

{[p.address, p.city].filter(Boolean).join(", ")}
{p.price != null && (
{brl(p.price)}
)}
{p.bedrooms != null && (


{p.bedrooms}

)}
{p.bathrooms != null && (


{p.bathrooms}

)}
{p.parking != null && (


{p.parking}

)}
{p.area != null && (


{p.area} m²

)}


Ver detalhes
{canEdit ? (


{p.owner_name && Prop.: {p.owner_name}}
{p.owner_phone &&  · {p.owner_phone}}










) : (


Captado por: {p.captador_name || "Outro corretor"}


)}


);
}
function PropertiesPage() {
const queryClient = useQueryClient();
const { data: me } = useCurrentUser();
const { remove } = useTable("properties");
const [open, setOpen] = useState(false);
const [editing, setEditing] = useState<Property | null>(null);
const [viewing, setViewing] = useState<Property | null>(null);
const [query, setQuery] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [ownerFilter, setOwnerFilter] = useState<"all" | "mine">("all");
const { data: list = [], isLoading } = useQuery({
queryKey: ["shared_properties"],
queryFn: async () => {
const { data, error } = await supabase
.from("shared_properties" as any)
.select("*")
.order("created_at", { ascending: false });
if (error) throw error;
return (data ?? []) as Property[];
},
});
const filtered = useMemo(() => {
return list.filter((p) => {
if (ownerFilter === "mine" && p.user_id !== me?.id) return false;
if (statusFilter !== "all" && p.status !== statusFilter) return false;
if (query.trim()) {
const q = query.toLowerCase();
const match = [p.title, p.address, p.city, p.kind, p.captador_name]
.filter(Boolean)
.some((v) => String(v).toLowerCase().includes(q));
if (!match) return false;
}
return true;
});
}, [list, ownerFilter, statusFilter, query, me?.id]);
return (

<PageHeader
title="Imóveis"
subtitle="Carteira compartilhada da equipe"
action={
<Button
onClick={() => {
setEditing(null);
setOpen(true);
}}
>

Novo imóvel

}
/>
<Input
placeholder="Buscar por título, endereço, cidade ou captador..."
value={query}
onChange={(e) => setQuery(e.target.value)}
className="sm:max-w-sm"
/>
<Button
variant={ownerFilter === "all" ? "default" : "outline"}
size="sm"
onClick={() => setOwnerFilter("all")}
>
Todos ({list.length})

<Button
variant={ownerFilter === "mine" ? "default" : "outline"}
size="sm"
onClick={() => setOwnerFilter("mine")}
>
          Meus imóveis
        </Button>

        <div className="w-48">
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ id: "all", label: "Todos os status" }, ...PROPERTY_STATUS]}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Carregando imóveis...</p>
      ) : filtered.length === 0 ? (
        <Empty>Nenhum imóvel encontrado com os filtros atuais.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              p={p}
              onView={() => setViewing(p)}
              onEdit={() => setEditing(p)}
              onDelete={() => confirm("Excluir este imóvel?") && remove.mutate(p.id)}
            />
          ))}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      <Dialog open={editing !== undefined} onOpenChange={(v) => !v && setEditing(undefined)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar imóvel" : "Novo imóvel"}</DialogTitle>
          </DialogHeader>
          <PropertyForm initial={editing} onDone={() => setEditing(undefined)} />
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes + Match de Clientes + Gerador de PDF */}
      <PropertyDetailsDialog
        p={viewing}
        open={viewing !== null}
        onClose={() => setViewing(null)}
      />
    </>
  );
}

function PropertyCard({
  p,
  onView,
  onEdit,
  onDelete,
}: {
  p: Property;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: urls } = usePhotoUrls(p.photos?.slice(0, 1) ?? []);
  const coverUrl = p.photos?.[0] ? urls?.[p.photos[0]] : undefined;
  const status = PROPERTY_STATUS.find((s) => s.id === p.status)?.label;

  return (
    <div className="group overflow-hidden rounded-xl border bg-card shadow-card transition-all hover:border-primary/40 flex flex-col">
      <div
        onClick={onView}
        className="relative aspect-video w-full cursor-pointer overflow-hidden bg-muted"
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Sem foto
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {status}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {p.kind} · {p.purpose}
        </span>
        <h3
          onClick={onView}
          className="mt-1 cursor-pointer text-base font-semibold leading-snug hover:text-primary line-clamp-1"
        >
          {p.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">
          {[p.address, p.city].filter(Boolean).join(", ") || "Endereço não informado"}
        </p>

        <p className="mt-3 text-lg font-bold text-primary">
          {p.price != null ? brl(p.price) : "Sob consulta"}
        </p>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {p.bedrooms != null && <span>{p.bedrooms} qts</span>}
          {p.bathrooms != null && <span>{p.bathrooms} ban</span>}
          {p.parking != null && <span>{p.parking} vgs</span>}
          {p.area != null && <span>{p.area} m²</span>}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onView}>
            Ver detalhes / PDF
          </Button>
          <div className="flex gap-1">
            <Button type="button" size="icon" variant="ghost" onClick={onEdit} aria-label="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={onDelete} aria-label="Excluir">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function usePhotoUrls(paths: string[]) {
  return useQuery({
    queryKey: ["property-photos", paths],
    enabled: paths.length > 0,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        paths.map(async (path) => {
          if (path.startsWith("http")) {
            map[path] = path;
            return;
          }
          const { data } = await supabase.storage
            .from("property-photos")
            .createSignedUrl(path, 3600);
          if (data?.signedUrl) map[path] = data.signedUrl;
        }),
      );
      return map;
    },
  });
}

function PropertyForm({
  initial,
  onDone,
}: {
  initial?: Property | null;
  onDone: () => void;
}) {
  const { save } = useTable("properties");
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const [f, setF] = useState({
    title: initial?.title ?? "",
    kind: initial?.kind ?? "apartamento",
    purpose: initial?.purpose ?? "venda",
    status: initial?.status ?? "disponivel",
    price: initial?.price != null ? String(initial.price) : "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    bedrooms: initial?.bedrooms != null ? String(initial.bedrooms) : "",
    bathrooms: initial?.bathrooms != null ? String(initial.bathrooms) : "",
    parking: initial?.parking != null ? String(initial.parking) : "",
    area: initial?.area != null ? String(initial.area) : "",
    description: initial?.description ?? "",
    owner_name: initial?.owner_name ?? "",
    owner_phone: initial?.owner_phone ?? "",
    photos: initial?.photos ?? [],
  });

  const set = (k: keyof typeof f) => (v: string) => setF((prev) => ({ ...prev, [k]: v }));

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("property-photos").upload(filePath, file);
      if (error) {
        toast.error(`Erro ao enviar ${file.name}: ${error.message}`);
      } else {
        uploaded.push(filePath);
      }
    }

    setF((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }));
    setUploading(false);
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = emptyToNull({
      title: f.title,
      kind: f.kind,
      purpose: f.purpose,
      status: f.status,
      price: f.price ? Number(f.price) : "",
      address: f.address,
      city: f.city,
      bedrooms: f.bedrooms ? Number(f.bedrooms) : "",
      bathrooms: f.bathrooms ? Number(f.bathrooms) : "",
      parking: f.parking ? Number(f.parking) : "",
      area: f.area ? Number(f.area) : "",
      description: f.description,
      owner_name: f.owner_name,
      owner_phone: f.owner_phone,
    });

    save.mutate(
      {
        ...(initial ? { id: initial.id } : {}),
        ...cleaned,
        photos: f.photos,
      } as never,
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["shared_properties"] });
          onDone();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <Field label="Título do anúncio *" className="col-span-2">
        <Input required value={f.title} onChange={(e) => set("title")(e.target.value)} />
      </Field>
      <Field label="Tipo">
        <SelectField value={f.kind} onChange={set("kind")} options={opts(PROPERTY_KINDS)} />
      </Field>
      <Field label="Finalidade">
        <SelectField
          value={f.purpose}
          onChange={set("purpose")}
          options={[
            { id: "venda", label: "Venda" },
            { id: "aluguel", label: "Aluguel" },
          ]}
        />
      </Field>
      <Field label="Status">
        <SelectField value={f.status} onChange={set("status")} options={PROPERTY_STATUS} />
      </Field>
      <Field label="Valor (R$)">
        <Input type="number" value={f.price} onChange={(e) => set("price")(e.target.value)} />
      </Field>
      <Field label="Endereço / Bairro">
        <Input value={f.address} onChange={(e) => set("address")(e.target.value)} />
      </Field>
      <Field label="Cidade">
        <Input value={f.city} onChange={(e) => set("city")(e.target.value)} />
      </Field>
      <Field label="Quartos">
        <Input type="number" value={f.bedrooms} onChange={(e) => set("bedrooms")(e.target.value)} />
      </Field>
      <Field label="Banheiros">
        <Input type="number" value={f.bathrooms} onChange={(e) => set("bathrooms")(e.target.value)} />
      </Field>
      <Field label="Vagas">
        <Input type="number" value={f.parking} onChange={(e) => set("parking")(e.target.value)} />
      </Field>
      <Field label="Área (m²)">
        <Input type="number" value={f.area} onChange={(e) => set("area")(e.target.value)} />
      </Field>
      <Field label="Nome do proprietário (interno)">
        <Input value={f.owner_name} onChange={(e) => set("owner_name")(e.target.value)} />
      </Field>
      <Field label="Telefone do proprietário (interno)">
<Input value={f.owner_phone} onChange={(e) => set("owner_phone")(e.target.value)} />


<Textarea rows={4} value={f.description} onChange={(e) => set("description")(e.target.value)} />
{f.photos.length > 0 && (

{f.photos.map((path, idx) => (

Foto {idx + 1}
<button
type="button"
onClick={() =>
setF((prev) => ({
...prev,
photos: prev.photos.filter((_, i) => i !== idx),
}))
}
>



))}

)}
<Button className="col-span-2" disabled={save.isPending || uploading}>
{save.isPending ? "Salvando..." : "Salvar imóvel"}


);
}
async function generatePropertyPDF(p: Property, photoUrls: Record<string, string> = {}) {
toast.info("Preparando ficha em PDF...");
let corretorNome = p.captador_name || "Mota Negócios Imobiliários";
let corretorTelefone = "";
let corretorEmail = "";
let corretorCreci = "";
try {
const { data: { user } } = await supabase.auth.getUser();
if (user) {
const { data: profile } = await supabase
.from("profiles")
.select("*")
.eq("id", user.id)
.single();
if (profile) {
corretorNome = profile.full_name || profile.name || corretorNome;
corretorTelefone = profile.phone || profile.whatsapp || profile.telefone || "";
corretorEmail = profile.email || user.email || "";
corretorCreci = profile.creci || "";
}
}
} catch (err) {
console.error("Erro ao buscar perfil do corretor:", err);
}
const photos = (p.photos ?? [])
.map((path) => photoUrls[path])
.filter(Boolean);
const formattedPrice = p.price != null ? brl(p.price) : "Sob consulta";
const location = [p.address, p.city].filter(Boolean).join(", ");
const printWindow = window.open("", "_blank");
if (!printWindow) {
toast.error("Por favor, permita pop-ups no navegador para gerar o PDF.");
return;
}
const html = <!DOCTYPE html> <html lang="pt-BR"> <head> <meta charset="UTF-8" /> <title>${p.title} - Ficha do Imóvel</title> <style> * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; } body { color: #1e293b; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; } .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; } .brand { font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px; } .badge { display: inline-block; background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 8px; } h1 { font-size: 24px; color: #0f172a; margin-bottom: 6px; } .location { font-size: 14px; color: #64748b; } .price-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; } .price-label { font-size: 12px; color: #64748b; text-transform: uppercase; } .price-value { font-size: 24px; font-weight: 800; color: #059669; } .specs { display: flex; gap: 16px; font-size: 13px; font-weight: 600; color: #334155; } .main-photo { width: 100%; height: 340px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; } .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; } .photo-grid img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; } .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; border-left: 3px solid #059669; padding-left: 8px; } .description { font-size: 14px; line-height: 1.6; color: #475569; white-space: pre-line; margin-bottom: 32px; } .footer { border-top: 2px solid #e2e8f0; padding-top: 16px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; } .broker-info { font-size: 13px; color: #1e293b; } .broker-phone { font-size: 14px; font-weight: 700; color: #059669; margin-top: 2px; } .doc-date { font-size: 11px; color: #94a3b8; } @media print { body { padding: 0; } @page { margin: 1.5cm; } } </style> </head> <body> <div class="header"> <div> <div class="brand">Mota Negócios Imobiliários</div> <div style="margin-top: 8px;"> <span class="badge">${p.kind} · ${p.purpose === "venda" ? "Venda" : "Aluguel"}</span> <h1>${p.title}</h1> ${location ?📍 ${location}` : ""}


Valor do Investimento
${formattedPrice}


${p.bedrooms != null ? <span>🛏️ ${p.bedrooms} Quartos</span> : ""}
${p.bathrooms != null ? <span>🚿 ${p.bathrooms} Banheiros</span> : ""}
${p.parking != null ? <span>🚗 ${p.parking} Vagas</span> : ""}
${p.area != null ? <span>📐 ${p.area} m²</span> : ""}

${photos.length > 0 ? <img src="${photos[0]}" class="main-photo" alt="Foto principal" /> ${photos.length > 1 ?

${photos.slice(1, 7).map((url) => <img src="${url}" alt="Foto do imóvel" />).join("")}

: ""} : ""}
${p.description ? <div> <div class="section-title">Descrição do Imóvel</div> <p class="description">${p.description}</p> </div> : ""}
Atendimento: ${corretorNome}${corretorCreci ? — ${corretorCreci.toUpperCase().includes("CRECI") ? corretorCreci :CRECI: ${corretorCreci}} : ""}
${corretorTelefone ? <div class="broker-phone">📱 WhatsApp / Tel: ${corretorTelefone}</div> : ""}
${corretorEmail ? <div style="font-size: 12px; color: #475569; margin-top: 2px;">✉️ ${corretorEmail}</div> : ""}

Ficha gerada em ${new Date().toLocaleDateString("pt-BR")}
window.onload = function() {
setTimeout(() => {
window.print();
}, 700);
};



`;
printWindow.document.open();
printWindow.document.write(html);
printWindow.document.close();
}
function PropertyDetailsDialog({
p,
open,
onClose,
}: {
p: Property | null;
open: boolean;
onClose: () => void;
}) {
const { data: urls } = usePhotoUrls(p?.photos ?? []);
const { rows: allClients } = useTable("clients");
const [activePhoto, setActivePhoto] = useState(0);
const matchingClients = useMemo(() => {
if (!p) return [];
const propPrice = p.price != null ? Number(p.price) : null;
const propText = [p.title, p.kind, p.purpose, p.address, p.city, p.description]
.filter(Boolean)
.join(" ")
.toLowerCase();
return allClients
.filter((c) => {
const isDeferred = (c as { status?: string }).status === "adiado";
if (c.stage === "fechado" || c.stage === "perdido" || isDeferred) return false;
if (c.type === "locatario" && p.purpose !== "aluguel") return false;
if ((c.type === "comprador" || c.type === "investidor") && p.purpose === "aluguel") return false;
const budget = c.budget != null ? Number(c.budget) : null;
const budgetOk = propPrice == null || budget == null || budget * 1.15 >= propPrice;
if (!budgetOk) return false;
const keywords = (c.interest ?? "")
.toLowerCase()
.split(/[\s,.;/-]+/)
.filter((w) => w.length >= 3);
return keywords.length === 0 || keywords.some((kw) => propText.includes(kw));
})
.slice(0, 6);
}, [allClients, p]);
if (!p) return null;
const photos = p.photos ?? [];
const currentUrl = photos[activePhoto] ? urls?.[photos[activePhoto]] : undefined;
const status = PROPERTY_STATUS.find((s) => s.id === p.status)?.label;
return (
<Dialog open={open} onOpenChange={(v) => !v && onClose()}>



{status}

{p.kind} · {p.purpose}


{p.title}

{[p.address, p.city].filter(Boolean).join(", ")}

{photos.length > 0 ? (


{currentUrl ? (

) : (
Carregando foto...
)}

{photos.length > 1 && (

{photos.map((path, idx) => (
<Button
key={path}
type="button"
variant={activePhoto === idx ? "default" : "outline"}
size="sm"
onClick={() => setActivePhoto(idx)}
>
Foto {idx + 1}

))}

)}

) : (

Nenhuma foto cadastrada

)}
Valor

{p.price != null ? brl(p.price) : "Sob consulta"}



{p.bedrooms != null && (

 {p.bedrooms} quartos

)}
{p.bathrooms != null && (

 {p.bathrooms} banheiros

)}
{p.parking != null && (

 {p.parking} vagas

)}
{p.area != null && (

 {p.area} m²

)}

{p.description && (

Descrição do imóvel

{p.description}


)}
{/* Cruzamento Automático: Clientes Compatíveis */}




Clientes Compatíveis ({matchingClients.length})

Orçamento e perfil
{matchingClients.length === 0 ? (

Nenhum cliente ativo compatível encontrado para este imóvel.

) : (

{matchingClients.map((c) => {
const wa = whatsappLink(c.phone);
return (


{c.name}

{c.budget != null ? Até ${brl(Number(c.budget))} : "Sem teto"}
{c.interest ?  · ${c.interest} : ""}


{wa && (


 WhatsApp


)}

);
})}

)}
{p.captador_name ? Captado por: ${p.captador_name} : ""}

<Button
type="button"
onClick={() => generatePropertyPDF(p, urls ?? {})}
className="bg-emerald-600 hover:bg-emerald-700 text-white"
>
Gerar Ficha em PDF




);
}
