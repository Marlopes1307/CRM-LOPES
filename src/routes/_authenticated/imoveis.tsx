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

  function shareWhatsApp() {
    const lines = [
      `*${p!.title}*`,
      `${p!.kind.toUpperCase()} · ${p!.purpose === "venda" ? "Venda" : "Aluguel"}`,
      p!.price != null ? `Valor: *${brl(p!.price)}*` : null,
      [p!.address, p!.city].filter(Boolean).length
        ? `Localização: ${[p!.address, p!.city].filter(Boolean).join(", ")}`
        : null,
      [
        p!.bedrooms != null ? `${p!.bedrooms} quartos` : null,
        p!.bathrooms != null ? `${p!.bathrooms} banheiros` : null,
        p!.parking != null ? `${p!.parking} vagas` : null,
        p!.area != null ? `${p!.area} m²` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      p!.description ? `\n${p!.description}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl = "https://wa.me" + encodeURIComponent(lines);
    window.open(whatsappUrl, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge>{status}</Badge>
            <span className="text-xs uppercase text-muted-foreground">
              {p.kind} · {p.purpose}
            </span>
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
                <img
                  src={currentUrl}
                  alt={p.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Carregando foto...
                </p>
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

            Valor

            {p.price != null ? brl(p.price) : "Sob consulta"}



            {p.bedrooms != null && (

              { p.bedrooms } quartos

)}
            {p.bathrooms != null && (

              { p.bathrooms } banheiros

)}
            {p.parking != null && (

              { p.parking } vagas

)}
            {p.area != null && (

              { p.area } m²

)}

            {p.description && (

              Descrição do imóvel

            {p.description}


)}
            {p.captador_name ? Captado por: ${p.captador_name} : ""}


            Compartilhar no WhatsApp




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
const {data: urls } = usePhotoUrls((p.photos ?? []).slice(0, 1));
            const cover = p.photos?.[0] ? urls?.[p.photos[0]] : undefined;
const status = PROPERTY_STATUS.find((s) => s.id === p.status)?.label;
            return (



            {cover ? (

            ): (

                Sem foto

)}
            {status}
            {(p.photos?.length ?? 0) > 1 && (

              { p.photos.length } fotos

)}
            {p.kind} · {p.purpose}

            {p.title}

            {[p.address, p.city].filter(Boolean).join(", ")}
            {p.price != null && (
              { brl(p.price)}
)}
            {p.bedrooms != null && (


              { p.bedrooms }

            )}
            {p.bathrooms != null && (


              { p.bathrooms }

            )}
            {p.parking != null && (


              { p.parking }

            )}
            {p.area != null && (


              { p.area } m²

)}


            Ver fotos e detalhes
            {canEdit ? (


              { p.owner_name && Prop.: { p.owner_name }}
            {p.owner_phone &&  · {p.owner_phone}}










            ) : (


            Captado por: {p.captador_name || "Outro corretor"}


)}


            );
}
            function PropertiesPage() {
const queryClient = useQueryClient();
            const {data: me } = useCurrentUser();
            const {remove} = useTable("properties");
            const [open, setOpen] = useState(false);
            const [editing, setEditing] = useState<Property | null>(null);
            const [viewing, setViewing] = useState<Property | null>(null);
            const [query, setQuery] = useState("");
            const [statusFilter, setStatusFilter] = useState("all");
            const [ownerFilter, setOwnerFilter] = useState<"all" | "mine">("all");
            const {data: list = [], isLoading } = useQuery({
              queryKey: ["shared_properties"],
queryFn: async () => {
const {data, error} = await supabase
            .from("shared_properties" as any)
            .select("*")
            .order("created_at", {ascending: false });
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

                      <SelectField
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[{ id: "all", label: "Todos os status" }, ...PROPERTY_STATUS]}
                      />

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
