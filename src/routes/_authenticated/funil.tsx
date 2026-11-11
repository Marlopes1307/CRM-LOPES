import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical, Home, MessageCircle, Wallet } from "lucide-react";
import { PageHeader } from "@/components/crm/ui";
import { STAGES, brl, whatsappLink } from "@/lib/crm";
import { useTable } from "@/lib/use-table";

export const Route = createFileRoute("/_authenticated/funil")({
  head: () => ({ meta: [{ title: "Funil de vendas — Corretor CRM" }] }),
  component: Funnel,
});

const stageTopBorders = [
  "border-t-blue-500",
  "border-t-indigo-500",
  "border-t-amber-500",
  "border-t-purple-500",
  "border-t-emerald-500",
  "border-t-slate-400",
];

const stageDotColors = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-slate-400",
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function Funnel() {
  const { rows, patch } = useTable("clients");
  const [over, setOver] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="pb-8">
      <PageHeader
        title="Funil de vendas"
        subtitle="Arraste os cartões entre as etapas para atualizar o andamento das negociações"
      />

      <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
        {STAGES.map((s, idx) => {
          const items = rows.filter((c) => c.stage === s.id);
          const total = items.reduce((a, c) => a + Number(c.budget ?? 0), 0);
          const topBorder = stageTopBorders[idx % stageTopBorders.length];
          const dotColor = stageDotColors[idx % stageDotColors.length];
          const isOver = over === s.id;

          return (
            <div
              key={s.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(s.id);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                setDraggingId(null);
                const id = e.dataTransfer.getData("id");
                if (id) patch.mutate({ id, stage: s.id });
              }}
              className={
                `w-72 shrink-0 rounded-2xl border border-t-4 ${topBorder} p-3.5 transition-all duration-150 flex flex-col ` +
                (isOver
                  ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20"
                  : "bg-slate-100/80 border-slate-200/80")
              }
            >
              {/* Cabeçalho da Coluna */}
              <div className="mb-3 px-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />
                    <h3 className="font-display text-sm font-semibold text-slate-900 truncate">
                      {s.label}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white border border-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-700 tabular-nums shadow-2xs">
                    {items.length}
                  </span>
                </div>

                <p className="mt-1.5 text-xs font-medium text-slate-500 tabular-nums">
                  Potencial:{" "}
                  <span className="font-semibold text-slate-700">{brl(total)}</span>
                </p>
              </div>

              {/* Lista de Cartões da Etapa */}
              <div className="space-y-2.5 min-h-[320px] flex-1">
                {items.length === 0 ? (
                  <div className="h-24 rounded-xl border border-dashed border-slate-300/80 flex items-center justify-center text-xs text-slate-400">
                    Solte um lead aqui
                  </div>
                ) : (
                  items.map((c) => {
                    const wa = whatsappLink(c.phone);
                    const isDragging = draggingId === c.id;

                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("id", c.id);
                          setDraggingId(c.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setOver(null);
                        }}
                        className={
                          "group cursor-grab rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:cursor-grabbing " +
                          (isDragging ? "opacity-40 scale-95" : "")
                        }
                      >
                        {/* Topo do Cartão */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
                              {getInitials(c.name)}
                            </div>
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {c.name}
                            </p>
                          </div>
                          <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
                        </div>

                        {/* Interesse do Cliente */}
                        {c.interest && (
                          <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-600">
                            <Home className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="line-clamp-2 leading-relaxed">{c.interest}</p>
                          </div>
                        )}

                        {/* Rodapé: Orçamento + Botão WhatsApp */}
                        {(c.budget != null || wa) && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            {c.budget != null ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 tabular-nums">
                                <Wallet className="h-3 w-3 text-emerald-600" />
                                {brl(Number(c.budget))}
                              </span>
                            ) : (
                              <span />
                            )}

                            {wa && (
                              <a
                                href={wa}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Abrir conversa no WhatsApp"
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <MessageCircle className="h-3 w-3" />
                                WhatsApp
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
