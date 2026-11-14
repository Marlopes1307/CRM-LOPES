import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useManagerAccess } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    if (location.pathname === "/auth") return;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw redirect({ to: "/auth" });
      }
      return { user: data.user };
    } catch (err) {
      if ((err as { isRedirect?: boolean })?.isRedirect) throw err;
      throw redirect({ to: "/auth" });
    }
  },
  component: Layout,
});

const baseNav = [
  { to: "/painel", label: "Painel Geral", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/funil", label: "Funil de Vendas", icon: KanbanSquare },
  { to: "/imoveis", label: "Imóveis", icon: Building2 },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
] as const;

function Layout() {
  const { user } = Route.useRouteContext();
  const { isManager, me } = useManagerAccess();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen md:flex bg-slate-50/90">
      {/* Menu Lateral Executivo Escuro */}
      <aside className="bg-slate-900 text-slate-200 md:w-64 md:min-h-screen md:sticky md:top-0 flex md:flex-col border-b md:border-b-0 md:border-r border-slate-800 shadow-xl z-20">
        {/* Marca / Logo */}
        <div className="px-5 py-4 md:py-6 flex items-center justify-between md:justify-start gap-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-sm font-bold tracking-tight text-white block leading-tight">
                Mota Negócios
              </span>
              <span className="text-[11px] text-amber-400 font-semibold tracking-wide uppercase block mt-0.5">
                Imobiliários
              </span>
            </div>
          </div>

          <button
            onClick={signOut}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex md:flex-col gap-1.5 px-3 py-3 md:py-5 overflow-x-auto flex-1">
          <p className="hidden md:block px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu Principal
          </p>
          {baseNav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 whitespace-nowrap transition-all duration-150 hover:bg-slate-800/80 hover:text-white"
              activeProps={{
                className:
                  "bg-blue-600 text-white font-semibold shadow-md shadow-blue-950/50 hover:bg-blue-600",
              }}
            >
              <span className="flex items-center gap-3">
                <n.icon className="h-4 w-4 shrink-0 opacity-85 group-hover:opacity-100" />
                {n.label}
              </span>
              <ChevronRight className="hidden md:block h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
            </Link>
          ))}

          {/* Aba Exclusiva do Gerente */}
          {isManager && (
            <>
              <p className="hidden md:block px-3 mt-5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-500/80">
                Gerência
              </p>
              <Link
                to={"/equipe" as never}
                className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-amber-200/90 whitespace-nowrap transition-all duration-150 hover:bg-slate-800/80 hover:text-white"
                activeProps={{
                  className:
                    "bg-amber-500 text-slate-950 font-semibold shadow-md hover:bg-amber-500 hover:text-slate-950",
                }}
              >
                <span className="flex items-center gap-3">
                  <UserCog className="h-4 w-4 shrink-0" />
                  Equipe
                </span>
                <ChevronRight className="hidden md:block h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
              </Link>
            </>
          )}
        </nav>

        {/* Rodapé com Perfil do Corretor / Gerente */}
        <div className="hidden md:block p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 uppercase">
              {user?.email?.slice(0, 2) ?? "CR"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {me?.full_name || (isManager ? "Gerente" : "Corretor")}
                </p>
                {isManager && <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-red-950/40 hover:text-red-300 hover:border-red-900/50 transition-colors w-full"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
