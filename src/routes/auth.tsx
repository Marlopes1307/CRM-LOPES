import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Mota Negócios Imobiliários" },
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
      if (data.session) {
        navigate({ to: "/painel", replace: true });
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        navigate({ to: "/painel", replace: true });
      }
    });

    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha o e-mail e a senha.");
      return;
    }

    setBusy(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          toast.error("E-mail ou senha inválidos.");
        } else if (data.session) {
          toast.success("Login realizado!");
          navigate({ to: "/painel", replace: true });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/painel" },
        });
        if (error) {
          toast.error(error.message);
        } else if (data.session) {
          toast.success("Conta criada com sucesso!");
          navigate({ to: "/painel", replace: true });
        } else {
          toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
        }
      }
    } catch {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-slate-50">
      {/* Lado Esquerdo: Identidade Visual */}
      <div className="hidden md:flex bg-hero text-white p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2.5 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-display text-xl tracking-tight text-white">
            Mota Negócios Imobiliários
          </span>
        </Link>

        <div className="space-y-4 max-w-md">
          <p className="font-display text-4xl leading-tight text-white">
            "Cada lead bem cuidado é uma chave entregue."
          </p>
          <p className="text-slate-300 text-sm">
            Gestão completa de clientes, carteira de imóveis, agenda de visitas e comissões.
          </p>
        </div>

        <p className="text-xs text-slate-400">
          Mota Negócios Imobiliários · Plataforma de Gestão
        </p>
      </div>

      {/* Lado Direito: Formulário de Acesso */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>

          <div className="rounded-2xl bg-white p-8 shadow-card border border-slate-200/80 space-y-6">
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl sm:text-3xl text-slate-900">
                {mode === "login" ? "Bem-vindo de volta" : "Criar sua conta"}
              </h1>
              <p className="text-sm text-slate-500">
                {mode === "login"
                  ? "Insira suas credenciais para acessar o painel."
                  : "Preencha os dados abaixo para começar gratuitamente."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-email" className="text-slate-700">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password" className="text-slate-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="auth-password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold text-base mt-2"
                disabled={busy}
              >
                {busy
                  ? "Aguarde..."
                  : mode === "login"
                  ? "Entrar no painel"
                  : "Criar conta gratuita"}
              </Button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                {mode === "login" ? "Ainda não tem uma conta?" : "Já possui uma conta?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="font-semibold text-primary hover:underline"
                >
                  {mode === "login" ? "Criar conta" : "Fazer login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
