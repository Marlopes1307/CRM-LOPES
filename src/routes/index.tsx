import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CalendarDays, KanbanSquare, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mota Negócios Imobiliários — CRM e Gestão" },
      { name: "description", content: "Clientes, funil de vendas, imóveis com fotos, agenda de visitas e comissões em um só lugar." },
      { property: "og:title", content: "Lopes Imóveis GYN" },
      { property: "og:description", content: "O CRM feito para o corretor de imóveis autônomo." },
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
    <div className="min-h-screen">
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <span className="font-display text-xl">Mota Negócios Imobiliários
          </span>
          <Button asChild variant="secondary" size="sm">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-28 pt-20">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Para corretores autônomos</p>
          <h1 className="mt-4 max-w-3xl text-5xl md:text-6xl leading-[1.05]">
            Toda a sua carteira, seus clientes e suas comissões em um só lugar.
          </h1>
          <p className="mt-6 max-w-xl text-lg opacity-80">
            Pare de perder lead em planilha e WhatsApp. Organize o funil, agende visitas e saiba quanto vai receber.
          </p>
          <Button asChild size="lg" className="mt-10 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/auth">Começar grátis</Link>
          </Button>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 -mt-14 grid gap-4 md:grid-cols-4 pb-20">
        {features.map((f) => (
          <div key={f.t} className="rounded-xl bg-card p-6 shadow-card border">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-lg">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
