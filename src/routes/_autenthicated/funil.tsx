import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/crm/ui";
import { STAGES, brl } from "@/lib/crm";
import { useTable } from "@/lib/use-table";

export const Route = createFileRoute("/_autenthicated/funil")({
  head: () => ({ meta: [{ title: "Funil de vendas — Corretor CRM" }] }),
  component: Funnel,
});

function Funnel() {
  const { rows, patch } = useTable("clients");
  const [over, setOver] = useState<string | null>(null);
  return (
    <>
      <PageHeader title="Funil de vendas" subtitle="Arraste os cartões entre as etapas" />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((s) => {
          const items = rows.filter((c) => c.stage === s.id);
          const total = items.reduce((a, c) => a + Number(c.budget ?? 0), 0);
          return (
            <div
              key={s.id}
              onDragOver={(e) => { e.preventDefault(); setOver(s.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                setOver(null);
                const id = e.dataTransfer.getData("id");
                if (id) patch.mutate({ id, stage: s.id });
              }}
              className={"w-64 shrink-0 rounded-xl p-3 transition-colors " + (over === s.id ? "bg-primary-soft" : "bg-secondary")}
            >
              <div className="mb-3 flex items-baseline justify-between px-1">
                <h3 className="text-sm font-semibold font-sans">{s.label}</h3>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <p className="px-1 mb-3 text-xs text-muted-foreground">{brl(total)}</p>
              <div className="space-y-2 min-h-24">
                {items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("id", c.id)}
                    className="cursor-grab rounded-lg border bg-card p-3 shadow-card active:cursor-grabbing"
                  >
                    <p className="font-medium text-sm">{c.name}</p>
                    {c.interest && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.interest}</p>}
                    {c.budget != null && <p className="text-xs font-semibold text-primary mt-1">{brl(Number(c.budget))}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
