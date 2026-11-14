import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Check, Mail, Pencil, ShieldCheck, UserCheck, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/crm/ui";
import { brl, commission } from "@/lib/crm";
import { useManagerAccess, useTable } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/equipe" as never)({
  head: () => ({ meta: [{ title: "Equipe — Mota Negócios Imobiliários" }] }),
  component: TeamPage,
});

const initials = (s: string) =>
  s.trim().split(/\s+/).slice(0, 2).map((n) => n?.toUpperCase() ?? "").join("");

function TeamPage() {
  const { isManager, profiles, me, isLoading, updateProfile } = useManagerAccess();
  const clients = useTable("clients").rows;
  const deals = useTable("deals").rows;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  if (!isLoading && me && !isManager) return <Navigate to="/painel" replace />;

  const stats = [
    { label: "Total de Usuários", val: profiles.length, icon: Users, bg: "bg-blue-50 text-blue-600" },
    { label: "Corretores Ativos", val: profiles.filter((p) => p.role === "corretor").length, icon: UserCheck, bg: "bg-emerald-50 text-emerald-600" },
    { label: "Gerentes / Admins", val: profiles.filter((p) => p.role === "gerente").length, icon: ShieldCheck, bg: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      <PageHeader title="Gestão de Equipe" subtitle="Gerencie corretores, permissões e desempenho individual" />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 font-display text-3xl text-slate-900 tabular-nums">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((m) => {
          const isMe = m.id === me?.id;
          const isMgr = m.role === "gerente";
          const name = m.full_name || m.email?.split("@") || "Usuário";
          const mClients = clients.filter((c) => (c as Record<string, unknown>).user_id === m.id).length;
          const mDeals = deals.filter((d) => (d as Record<string, unknown>).user_id === m.id);
          const mComm = mDeals.reduce((sum, d) => sum + commission(Number(d.value), Number(d.commission_pct)), 0);

          return (
            <div key={m.id} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold border ${isMgr ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {initials(name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingId === m.id ? (
                        <div className="flex items-center gap-1.5">
                          <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-8 text-sm" autoFocus />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => { updateProfile.mutate({ id: m.id, full_name: tempName }); setEditingId(null); }}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-slate-900 truncate">{name}</h3>
                          <button type="button" onClick={() => { setEditingId(m.id); setTempName(name); }} className="text-slate-400 hover:text-slate-700">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {isMe && <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Você</span>}
                        </div>
                      )}
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        {m.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={isMgr ? "bg-amber-50 text-amber-800 border-amber-200 gap-1" : "bg-slate-50 text-slate-700 border-slate-200"}>
                    {isMgr && <ShieldCheck className="h-3 w-3" />}
                    {isMgr ? "Gerente" : "Corretor"}
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                  <div>
                    <p className="text-[11px] text-slate-500">Leads</p>
                    <p className="font-display text-base font-bold text-slate-900 tabular-nums mt-0.5">{mClients}</p>
                  </div>
                  <div className="border-x border-slate-200/80">
                    <p className="text-[11px] text-slate-500">Vendas</p>
                    <p className="font-display text-base font-bold text-slate-900 tabular-nums mt-0.5">{mDeals.length}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Comissões</p>
                    <p className="font-display text-sm font-bold text-emerald-700 tabular-nums mt-0.5">{brl(mComm)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-slate-400" />
                  Permissão
                </span>
                {!isMe ? (
                  <Button size="sm" variant={isMgr ? "outline" : "secondary"} disabled={updateProfile.isPending} onClick={() => updateProfile.mutate({ id: m.id, role: isMgr ? "corretor" : "gerente" })} className="h-8 text-xs font-medium">
                    {isMgr ? "Rebaixar para Corretor" : "Promover a Gerente"}
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Admin principal</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
