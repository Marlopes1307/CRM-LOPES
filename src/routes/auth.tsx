import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Corretor CRM" },
      { name: "description", content: "Acesse seu CRM de corretor de imóveis." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/painel", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit() {
    console.log("🟢 Botão clicado!");
    setBusy(true);

    try {
      if (mode === "login") {
        console.log("🟢 Fazendo login com:", email);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error("🔴 Erro login:", error);
          toast.error("E-mail ou senha inválidos");
        }
      } else {
        console.log("🟢 Fazendo cadastro com:", email);
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/painel" },
        });
        if (error) {
          console.error("🔴 Erro cadastro:", error);
          toast.error(error.message);
        } else {
          toast.success("Conta criada! Verifique seu e-mail.");
        }
      }
    } catch (err) {
      console.error("🔴 Erro:", err);
      toast.error("Ocorreu um erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Não foi possível entrar com Google");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-hero text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="font-display text-xl">Corretor CRM</Link>
        <p className="font-display text-4xl leading-tight max-w-md">"Cada lead bem cuidado é uma chave entregue."</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-3xl">{mode === "login" ? "Bem-vindo de volta" : "Criar conta"}</h1>
          
          <Button type="button" variant="outline" className="w-full" onClick={google}>
            Continuar com Google
          </Button>
          
          <div className="text-center text-xs text-muted-foreground">ou com e-mail</div>
          
          <div className="space-y-2">
            <Label htmlFor="auth-email">E-mail</Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="auth-password">Senha</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
  type="button"
  onClick={() => {
    console.log("🟢 BOTÃO FUNCIONOU!!!");
    alert("Clique detectado!");
    handleSubmit();
  }}
  style={{
    width: "100%",
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "6px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "8px"
  }}
>
  {mode === "login" ? "Entrar" : "Cadastrar"}
</button>
          
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Ainda não tem uma conta?" : "Já tem uma conta?"}
          </p>
          
          <Button
  type="button"
  className="w-full"
  onClick={handleSubmit}
>
  {mode === "login" ? "Entrar" : "Cadastrar"}
</Button>
        </div>
      </div>
    </div>
  );
}