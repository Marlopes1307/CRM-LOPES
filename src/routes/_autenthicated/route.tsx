import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, KanbanSquare, LayoutDashboard, LogOut, Users, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_autenthicated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

const nav = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/funil", label: "Funil", icon: KanbanSquare },
  { to: "/imoveis", label: "Imóveis", icon: Building2 },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
] as const;

function Layout() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-sidebar text-sidebar-foreground md:w-60 md:min-h-screen md:sticky md:top-0 flex md:flex-col">
        <div className="hidden md:block px-6 py-6 font-display text-xl text-sidebar-accent-foreground">Corretor CRM</div>
        <nav className="flex md:flex-col gap-1 px-2 md:px-3 py-2 overflow-x-auto flex-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-primary font-semibold" }}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 md:border-t border-sidebar-border">
          <div className="hidden md:block truncate text-xs opacity-70 px-3 mb-2">{user.email}</div>
          <button onClick={signOut} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent w-full">
            <LogOut className="h-4 w-4" /> <span className="hidden md:inline">Sair</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
