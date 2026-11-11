import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { a as SquareKanban, b as Building2, n as Wallet, y as CalendarDays } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-pXUdNxA-.js
var import_jsx_runtime = require_jsx_runtime();
var features = [
	{
		icon: SquareKanban,
		t: "Funil de vendas",
		d: "Arraste cada lead do primeiro contato ao fechamento."
	},
	{
		icon: Building2,
		t: "Carteira de imóveis",
		d: "Fotos, características e dados do proprietário."
	},
	{
		icon: CalendarDays,
		t: "Agenda",
		d: "Visitas, reuniões, ligações e tarefas do dia."
	},
	{
		icon: Wallet,
		t: "Comissões",
		d: "Vendas fechadas, valores a receber e relatórios."
	}
];
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "bg-hero text-primary-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-6 py-6 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-xl",
					children: "Corretor CRM"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: "Entrar"
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-6 pb-28 pt-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm uppercase tracking-[0.2em] text-accent",
						children: "Para corretores autônomos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 max-w-3xl text-5xl md:text-6xl leading-[1.05]",
						children: "Toda a sua carteira, seus clientes e suas comissões em um só lugar."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl text-lg opacity-80",
						children: "Pare de perder lead em planilha e WhatsApp. Organize o funil, agende visitas e saiba quanto vai receber."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						className: "mt-10 bg-accent text-accent-foreground hover:bg-accent/90",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							children: "Começar grátis"
						})
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto max-w-6xl px-6 -mt-14 grid gap-4 md:grid-cols-4 pb-20",
			children: features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-card p-6 shadow-card border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "h-6 w-6 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-4 text-lg",
						children: f.t
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: f.d
					})
				]
			}, f.t))
		})]
	});
}
//#endregion
export { Index as component };
