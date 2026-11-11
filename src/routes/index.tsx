import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CalendarDays, KanbanSquare, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Corretor CRM — gestão para corretor de imóveis autônomo" },
      { name: "description", content: "Clientes, funil de vendas, imóveis com fotos, agenda de visitas e comissões em um só lugar." },
      { property: "og:title", content: "Mota Negócios Imobiliários" },
      { property: "og:description", content: "O CRM feito para o corretor de imóveis especialista." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: KanbanSquare, t: "Funil de vendas", d: "Arraste cada lead do primeiro contato ao fechamento." },
  { icon: Building2, t: "Carteira de imóveis", d: "Fotos, características e dados do proprietário." },
  { icon: CalendarDays, t: "Agenda", d: "Visitas, reuniões, ligações e tarefas do dia." },
  { icon: Wallet, t: "Comissões", d: "Vendas fechadas, valores a receber e relatórios." },
];

function Index() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-hero text-white">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-display text-xl tracking-tight text-white">Corretor CRM</span>
          </div>
          <Button asChild variant="secondary" size="sm" className="font-semibold">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-32 pt-20">
          <span className="inline-block rounded-full bg-amber-500/15 border border-amber-400/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Para corretores autônomos
          </span>
          <h1 className="font-display mt-5 max-w-3xl text-4xl sm:text-5xl md:text-6xl leading-[1.08] text-white">
            Toda a sua carteira, seus clientes e suas comissões em um só lugar.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300 leading-relaxed">
            Pare de perder lead em planilha e WhatsApp. Organize o funil, agende visitas e saiba exatamente quanto vai receber.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 px-8">
              <Link to="/auth" className="flex items-center gap-2">
                Começar grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 -mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-4 pb-24">
        {features.map((f) => (
          <div
            key={f.t}
            className="rounded-xl bg-white p-6 shadow-card border border-slate-200/80 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display mt-5 text-lg text-slate-900">{f.t}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
