import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client"; // Ajuste se o caminho do supabase no seu projeto for outro (ex: ~/lib/supabase)
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [creci, setCreci] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name || data.name || "");
        setPhone(data.phone || data.whatsapp || "");
        if (data.email) setEmail(data.email);
        setCreci(data.creci || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        phone,
        email,
        creci,
      });

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar perfil: " + error.message);
    } else {
      toast.success("Dados do corretor atualizados com sucesso!");
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando dados do corretor...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil (Corretor)</h1>
        <p className="text-sm text-muted-foreground">
          Esses dados aparecerão automaticamente no rodapé das fichas em PDF geradas para os clientes.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome completo / Nome profissional</Label>
          <Input
            id="fullName"
            placeholder="Ex: Marcelo Lopes"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input
            id="phone"
            placeholder="Ex: (62) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail de contato</Label>
          <Input
            id="email"
            type="email"
            placeholder="Ex: contato@motanegocios.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="creci">CRECI (opcional)</Label>
          <Input
            id="creci"
            placeholder="Ex: CRECI-GO 12345"
            value={creci}
            onChange={(e) => setCreci(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
          {saving ? "Salvando..." : "Salvar Dados do Corretor"}
        </Button>
      </form>
    </div>
  );
}
