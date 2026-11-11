import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { b as Building2, n as Wallet, r as Users, y as CalendarDays } from "../_libs/lucide-react.mjs";
import { d as brl, f as commission, g as useTable, l as STAGES, s as PageHeader } from "./use-table-BMo7zDqC.mjs";
import { a as format, n as parseISO, r as isToday } from "../_libs/date-fns.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/painel-D6SYmO0t.js
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const clients = useTable("clients").rows;
	const properties = useTable("properties").rows;
	const appts = useTable("appointments").rows;
	const deals = useTable("deals").rows;
	const active = clients.filter((c) => c.stage !== "fechado" && c.stage !== "perdido").length;
	const today = appts.filter((a) => !a.done && isToday(parseISO(a.starts_at)));
	const upcoming = appts.filter((a) => !a.done).slice(0, 6);
	const pending = deals.filter((d) => !d.paid).reduce((s, d) => s + commission(Number(d.value), Number(d.commission_pct)), 0);
	const closed = clients.filter((c) => c.stage === "fechado").length;
	const conv = clients.length ? Math.round(closed / clients.length * 100) : 0;
	const cards = [
		{
			label: "Leads ativos",
			value: active,
			icon: Users,
			to: "/clientes"
		},
		{
			label: "Imóveis disponíveis",
			value: properties.filter((p) => p.status === "disponivel").length,
			icon: Building2,
			to: "/imoveis"
		},
		{
			label: "Compromissos hoje",
			value: today.length,
			icon: CalendarDays,
			to: "/agenda"
		},
		{
			label: "Comissões a receber",
			value: brl(pending),
			icon: Wallet,
			to: "/financeiro"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Bom trabalho hoje",
			subtitle: format(/* @__PURE__ */ new Date(), "dd/MM/yyyy")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: c.to,
				className: "rounded-xl border bg-card p-5 shadow-card hover:border-primary transition-colors",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-5 w-5 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-3xl",
						children: c.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: c.label
					})
				]
			}, c.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border bg-card p-5 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg",
						children: "Funil"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm text-muted-foreground",
						children: [
							"Conversão ",
							conv,
							"%"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: STAGES.map((s) => {
						const n = clients.filter((c) => c.stage === s.id).length;
						const w = clients.length ? n / clients.length * 100 : 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: n
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 h-2 rounded-full bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 rounded-full bg-primary",
								style: { width: `${w}%` }
							})
						})] }, s.id);
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border bg-card p-5 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg mb-4",
					children: "Próximos compromissos"
				}), upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nada agendado."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y",
					children: upcoming.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-4 py-2.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-24 text-muted-foreground tabular-nums",
							children: format(parseISO(a.starts_at), "dd/MM HH:mm")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: a.title
						})]
					}, a.id))
				})]
			})]
		})
	] });
}
//#endregion
export { Dashboard as component };
