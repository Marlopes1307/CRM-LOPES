import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Bath,
  BedDouble,
  Building2,
  Camera,
  Car,
  ImagePlus,
  MapPin,
  Maximize,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
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

const statusBadgeStyles: Record<string, string> = {
  disponivel: "bg-emerald-600/95 text-white border-0 shadow-sm",
  reservado: "bg-amber-500/95 text-slate-950 border-0 shadow-sm",
  vendido: "bg-slate-800/95 text-white border-0 shadow-sm",
  alugado: "bg-blue-600/95 text-white border-0 shadow-sm",
};

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
  const { save } = useTable("properties");
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
      className="space-y-5 pt-2 max-h-[80vh] overflow-y-auto pr-1"
      onSubmit={(e) => {
        e.preventDefault();
        const v = emptyToNull(
          Object.fromEntries(
            Object.entries(f).map(([k, x]) => [k, NUM.includes(k) && x ? Number(x) : x])
          )
        );
        save.mutate(
          { ...(initial ? { id: initial.id } : {}), ...v, title: f.title, photos } as never,
          { onSuccess: onDone }
        );
      }}
    >
      {/* Bloco 1: Informações Básicas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Field label="Título do anúncio *" className="col-span-2 md:col-span-4">
          <Input
            required
            value={f.title}
            onChange={(e) => set("title")(e.target.value)}
            placeholder="Ex: Apartamento 3 quartos com varanda gourmet"
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
        <Field label="Valor (R$)">
          <Input
            type="number"
            placeholder="650000"
            value={f.price}
            onChange={(e) => set("price")(e.target.value)}
          />
        </Field>
        <Field label="Endereço / Bairro" className="col-span-2 md:col-span-3">
          <Input
            placeholder="Rua T-55, Setor Bueno"
            value={f.address}
            onChange={(e) => set("address")(e.target.value)}
          />
        </Field>
        <Field label="Cidade">
          <Input
            placeholder="Goiânia"
            value={f.city}
            onChange={(e) => set("city")(e.target.value)}
          />
        </Field>
      </div>

      {/* Bloco 2: Características */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Quartos">
          <Input
            type="number"
            placeholder="3"
            value={f.bedrooms}
            onChange={(e) => set("bedrooms")(e.target.value)}
          />
        </Field>
        <Field label="Banheiros">
          <Input
            type="number"
            placeholder="2"
            value={f.bathrooms}
            onChange={(e) => set("bathrooms")(e.target.value)}
          />
        </Field>
        <Field label="Vagas">
          <Input
            type="number"
            placeholder="2"
            value={f.parking}
            onChange={(e) => set("parking")(e.target.value)}
          />
        </Field>
        <Field label="Área útil (m²)">
          <Input
            type="number"
            placeholder="98"
            value={f.area}
            onChange={(e) => set("area")(e.target.value)}
          />
        </Field>
      </div>

      {/* Bloco 3: Proprietário e Descrição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <Field label="Nome do proprietário">
          <Input
            placeholder="Ex: Carlos Mendes"
            value={f.owner_name}
            onChange={(e) => set("owner_name")(e.target.value)}
          />
        </Field>
        <Field label="Telefone do proprietário">
          <Input
            placeholder="(62) 99999-9999"
            value={f.owner_phone}
            onChange={(e) => set("owner_phone")(e.target.value)}
          />
        </Field>
        <Field label="Descrição e diferenciais" className="md:col-span-2">
          <Textarea
            rows={3}
            placeholder="Sol da manhã, armários planejados, lazer completo no condomínio..."
            value={f.description}
            onChange={(e) => set("description")(e.target.value)}
          />
        </Field>
      </div>

      {/* Bloco 4: Galeria de Fotos */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
          Fotos do imóvel ({photos.length})
        </p>
        <div className="flex flex-wrap gap-2.5">
          {photos.map((p) => (
            <div
              key={p}
              className="group relative h-20 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              {urls?.[p] && <img src={urls[p]} alt="" className="h-full w-full object-cover" />}
              <button
                type="button"
                onClick={() => setPhotos((x) => x.filter((y) => y !== p))}
                className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/80 text-white p-1 opacity-90 hover:bg-red-600 transition-colors"
                aria-label="Remover foto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-xs font-medium text-slate-500 hover:border-primary hover:bg-blue-50/50 hover:text-primary transition-colors">
            <ImagePlus className="h-5 w-5" />
            <span>{uploading ? "Enviando..." : "Adicionar"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
          </label>
        </div>
      </div>

      <Button className="w-full h-11 font-semibold" disabled={save.isPending || uploading}>
        {save.isPending ? "Salvando imóvel..." : "Salvar imóvel"}
      </Button>
    </form>
  );
}

function PropertyCard({
  p,
  onEdit,
  onDelete,
}: {
  p: Property;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: urls } = usePhotoUrls(p.photos.slice(0, 1));
  const cover = p.photos[0] ? urls?.[p.photos[0]] : undefined;
  const statusLabel = PROPERTY_STATUS.find((s) => s.id === p.status)?.label;
  const badgeStyle = statusBadgeStyles[p.status] ?? "bg-slate-800 text-white";

  return (
