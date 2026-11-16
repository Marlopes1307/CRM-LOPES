import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

type Property = Row<"properties"> & {
  captador_name?: string | null;
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
      <Field label="Descrição" className="col-span-2 md:col-span-4">
        <Textarea rows={3} value={f.description} onChange={(e) => set("description")(e.target.value)} />
      </Field>
      <div className="col-span-2 md:col-span-4">
        <p className="text-xs text-muted-foreground mb-2">Fotos</p>
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <div key={p} className="relative h-20 w-28 overflow-hidden rounded-lg bg-muted">
              {urls?.[p] && <img src={urls[p]} alt="" className="h-full w-full object-cover" />}
              <button
                type="button"
                onClick={() => setPhotos((x) => x.filter((y) => y !== p))}
                className="absolute right-1 top-1 rounded-full bg-card p-0.5"
                aria-label="Remover foto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted">
            <ImagePlus className="h-5 w-5" />
            {uploading ? "Enviando..." : "Adicionar"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
      </div>
      <Button className="col-span-2 md:col-span-4" disabled={save.isPending || uploading}>
        Salvar imóvel
      </Button>
    </form>
  );
}
function buildPropertyShareText(p: Property) {
  const shareUrl = `${window.location.origin}/imovel/${p.id}`;

  return [
    "*" + p.title + "*",
    p.kind.toUpperCase() + " - " + (p.purpose === "venda" ? "Venda" : "Aluguel"),
    p.price != null ? "Valor: *" + brl(p.price) + "*" : null,
    [p.address, p.city].filter(Boolean).length
      ? "Localização: " + [p.address, p.city].filter(Boolean).join(", ")
      : null,
    [
      p.bedrooms != null ? p.bedrooms + " quartos" : null,
      p.bathrooms != null ? p.bathrooms + " banheiros" : null,
      p.parking != null ? p.parking + " vagas" : null,
      p.area != null ? p.area + " m²" : null,
    ]
      .filter(Boolean)
      .join(" | "),
    p.description ? "\n" + p.description : null,
    "\nVeja fotos e detalhes: " + shareUrl,
  ]
    .filter(Boolean)
    .join("\n");
}
async function generatePropertyPDF(p: Property, photoUrls: Record<string, string> = {}) {
  toast.info("Preparando ficha em PDF...");

  // Busca o nome e telefone/WhatsApp do corretor logado na tabela profiles
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

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${p.title} - Ficha do Imóvel</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        body { color: #1e293b; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .brand { font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px; }
        .badge { display: inline-block; background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 8px; }
        h1 { font-size: 24px; color: #0f172a; margin-bottom: 6px; }
        .location { font-size: 14px; color: #64748b; }
        .price-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
        .price-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
        .price-value { font-size: 24px; font-weight: 800; color: #059669; }
        .specs { display: flex; gap: 16px; font-size: 13px; font-weight: 600; color: #334155; }
        .main-photo { width: 100%; height: 340px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; }
        .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
        .photo-grid img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; }
        .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; border-left: 3px solid #059669; padding-left: 8px; }
        .description { font-size: 14px; line-height: 1.6; color: #475569; white-space: pre-line; margin-bottom: 32px; }
        .footer { border-top: 2px solid #e2e8f0; padding-top: 16px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .broker-info { font-size: 13px; color: #1e293b; }
        .broker-phone { font-size: 14px; font-weight: 700; color: #059669; margin-top: 2px; }
        .doc-date { font-size: 11px; color: #94a3b8; }
        @media print {
          body { padding: 0; }
          @page { margin: 1.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Mota Negócios Imobiliários</div>
          <div style="margin-top: 8px;">
            <span class="badge">${p.kind} · ${p.purpose === "venda" ? "Venda" : "Aluguel"}</span>
            <h1>${p.title}</h1>
            ${location ? `<p class="location">📍 ${location}</p>` : ""}
          </div>
        </div>
      </div>

      <div class="price-box">
        <div>
          <div class="price-label">Valor do Investimento</div>
          <div class="price-value">${formattedPrice}</div>
        </div>
        <div class="specs">
          ${p.bedrooms != null ? `<span>🛏️ ${p.bedrooms} Quartos</span>` : ""}
          ${p.bathrooms != null ? `<span>🚿 ${p.bathrooms} Banheiros</span>` : ""}
          ${p.parking != null ? `<span>🚗 ${p.parking} Vagas</span>` : ""}
          ${p.area != null ? `<span>📐 ${p.area} m²</span>` : ""}
        </div>
      </div>

      ${photos.length > 0 ? `
        <img src="${photos[0]}" class="main-photo" alt="Foto principal" />
        ${photos.length > 1 ? `
          <div class="photo-grid">
            ${photos.slice(1, 7).map((url) => `<img src="${url}" alt="Foto do imóvel" />`).join("")}
          </div>
        ` : ""}
      ` : ""}

      ${p.description ? `
        <div>
          <div class="section-title">Descrição do Imóvel</div>
          <p class="description">${p.description}</p>
        </div>
      ` : ""}

           <div class="footer">
        <div class="broker-info">
          <div>Atendimento: <strong>${corretorNome}</strong> ${corretorCreci ? `(${corretorCreci})` : ""}</div>
          ${corretorTelefone ? `<div class="broker-phone">📱 WhatsApp / Tel: ${corretorTelefone}</div>` : ""}
          ${corretorEmail ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">✉️ ${corretorEmail}</div>` : ""}
        </div>
        <div class="doc-date">Ficha gerada em ${new Date().toLocaleDateString("pt-BR")}</div>
      </div>


      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 700);
        };
      </script>
    </body>
    </html>
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
  const [activePhoto, setActivePhoto] = useState(0);

  if (!p) return null;

  const photos = p.photos ?? [];
  const currentUrl = photos[activePhoto] ? urls?.[photos[activePhoto]] : undefined;
  const status = PROPERTY_STATUS.find((s) => s.id === p.status)?.label;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
             <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {p.captador_name ? `Captado por: ${p.captador_name}` : ""}
          </p>
          <Button
            type="button"
            onClick={() => generatePropertyPDF(p, urls ?? {})}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Gerar Ficha em PDF
          </Button>
        </div>

          <DialogTitle className="text-xl pt-1">{p.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {[p.address, p.city].filter(Boolean).join(", ")}
          </p>
        </DialogHeader>

        {photos.length > 0 ? (
          <div className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
              {currentUrl ? (
                <img src={currentUrl} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <p className="p-8 text-center text-sm text-muted-foreground">Carregando foto...</p>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((path, idx) => (
                  <Button
                    key={path}
                    type="button"
                    variant={activePhoto === idx ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivePhoto(idx)}
                  >
                    Foto {idx + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">
            Nenhuma foto cadastrada
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="text-xl font-bold text-primary">
              {p.price != null ? brl(p.price) : "Sob consulta"}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {p.bedrooms != null && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" /> {p.bedrooms} quartos
              </span>
            )}
            {p.bathrooms != null && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" /> {p.bathrooms} banheiros
              </span>
            )}
            {p.parking != null && (
              <span className="flex items-center gap-1.5">
                <Car className="h-4 w-4" /> {p.parking} vagas
              </span>
            )}
            {p.area != null && (
              <span className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" /> {p.area} m²
              </span>
            )}
          </div>
        </div>

        {p.description && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Descrição do imóvel</h4>
            <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
              {p.description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {p.captador_name ? `Captado por: ${p.captador_name}` : ""}
          </p>
         </div>
      </DialogContent>
    </Dialog>
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
    <div className="flex flex-col justify-between overflow-hidden rounded-xl border bg-card shadow-card">
      <div onClick={onView} className="cursor-pointer">
        <div className="relative aspect-[4/3] bg-muted">
          {cover ? (
            <img src={cover} alt={p.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sem foto
            </div>
          )}
          <Badge className="absolute left-3 top-3">{status}</Badge>
          {(p.photos?.length ?? 0) > 1 && (
            <span className="absolute right-3 bottom-3 rounded bg-card px-2 py-0.5 text-xs">
              {p.photos.length} fotos
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {p.kind} · {p.purpose}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-snug">{p.title}</h3>
          <p className="text-sm text-muted-foreground">
            {[p.address, p.city].filter(Boolean).join(", ")}
          </p>

          {p.price != null && (
            <p className="mt-2 text-lg font-bold text-primary">{brl(p.price)}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {p.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {p.bedrooms}
              </span>
            )}
            {p.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {p.bathrooms}
              </span>
            )}
            {p.parking != null && (
              <span className="flex items-center gap-1">
                <Car className="h-3.5 w-3.5" />
                {p.parking}
              </span>
            )}
            {p.area != null && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" />
                {p.area} m²
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onView}>
            Ver detalhes
          </Button>
             </div>

        {canEdit ? (
          <div className="flex items-center justify-between border-t pt-3">
            <div className="text-xs text-muted-foreground">
              {p.owner_name && <span>Prop.: {p.owner_name}</span>}
              {p.owner_phone && <span> · {p.owner_phone}</span>}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-amber-600">
              Captado por: {p.captador_name || "Outro corretor"}
            </p>
          </div>
        )}
      </div>
    </div>
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
    <div className="space-y-6">
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
            <Plus className="mr-2 h-4 w-4" />
            Novo imóvel
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por título, endereço, cidade ou captador..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={ownerFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setOwnerFilter("all")}
          >
            Todos ({list.length})
          </Button>
          <Button
            variant={ownerFilter === "mine" ? "default" : "outline"}
            size="sm"
            onClick={() => setOwnerFilter("mine")}
          >
            Meus imóveis
          </Button>
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ id: "all", label: "Todos os status" }, ...PROPERTY_STATUS]}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando imóveis...</p>
      ) : filtered.length === 0 ? (
        <Empty>Nenhum imóvel encontrado.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const canEdit = Boolean(
              me?.id && (me.id === p.user_id || ["gerente", "admin"].includes(me.role))
            );
            return (
              <PropertyCard
                key={p.id}
                p={p}
                canEdit={canEdit}
                onView={() => setViewing(p)}
                onEdit={() => {
                  setEditing(p);
                  setOpen(true);
                }}
                onDelete={() =>
                  remove.mutate(p.id, {
                    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared_properties"] }),
                  })
                }
              />
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar imóvel" : "Novo imóvel"}</DialogTitle>
          </DialogHeader>
          <PropertyForm
            initial={editing}
            onDone={() => {
              setOpen(false);
              queryClient.invalidateQueries({ queryKey: ["shared_properties"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <PropertyDetailsDialog
        p={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
