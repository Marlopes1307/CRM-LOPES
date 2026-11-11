import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as supabase } from "./client-SAOWSTXM.mjs";
import { a as SquareKanban, b as Building2, f as LogOut, n as Wallet, p as LayoutDashboard, r as Users, y as CalendarDays } from "../_libs/lucide-react.mjs";
import { r as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { _ as Link, p as Outlet, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./route-Ck04MhX-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-BBWHZsJ2.js
var import_jsx_runtime = require_jsx_runtime();
var nav = [
	{
		to: "/painel",
		label: "Painel",
		icon: LayoutDashboard
	},
	{
		to: "/clientes",
		label: "Clientes",
		icon: Users
	},
	{
		to: "/funil",
		label: "Funil",
		icon: SquareKanban
	},
	{
		to: "/imoveis",
		label: "Imóveis",
		icon: Building2
	},
	{
		to: "/agenda",
		label: "Agenda",
		icon: CalendarDays
	},
	{
		to: "/financeiro",
		label: "Financeiro",
		icon: Wallet
	}
];
function Layout() {
	const { user } = Route.useRouteContext();
	const qc = useQueryClient();
	const navigate = useNavigate();
	async function signOut() {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen md:flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "bg-sidebar text-sidebar-foreground md:w-60 md:min-h-screen md:sticky md:top-0 flex md:flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden md:block px-6 py-6 font-display text-xl text-sidebar-accent-foreground",
					children: "Corretor CRM"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex md:flex-col gap-1 px-2 md:px-3 py-2 overflow-x-auto flex-1",
					children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: n.to,
						className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-sidebar-accent",
						activeProps: { className: "bg-sidebar-accent text-sidebar-primary font-semibold" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n.icon, { className: "h-4 w-4" }), n.label]
					}, n.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 md:border-t border-sidebar-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden md:block truncate text-xs opacity-70 px-3 mb-2",
						children: user.email
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: signOut,
						className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden md:inline",
								children: "Sair"
							})
						]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 p-4 md:p-8 max-w-7xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})]
	});
}
//#endregion
export { Layout as component };
