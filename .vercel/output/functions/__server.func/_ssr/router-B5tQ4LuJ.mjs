import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { f as createRouter, g as createRootRoute, h as createFileRoute, m as lazyRouteComponent, p as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$9 } from "./route-Ck04MhX-.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Route$8 = createRootRoute({ component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
var $$splitComponentImporter$7 = () => import("./routes-pXUdNxA-.mjs");
var Route$7 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Corretor CRM — gestão para corretor de imóveis autônomo" },
		{
			name: "description",
			content: "Clientes, funil de vendas, imóveis com fotos, agenda de visitas e comissões em um só lugar."
		},
		{
			property: "og:title",
			content: "Corretor CRM"
		},
		{
			property: "og:description",
			content: "O CRM feito para o corretor de imóveis autônomo."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./auth-B46LnoQ2.mjs");
var Route$6 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Entrar — Corretor CRM" },
		{
			name: "description",
			content: "Acesse seu CRM de corretor de imóveis."
		},
		{
			property: "og:title",
			content: "Entrar — Corretor CRM"
		},
		{
			property: "og:description",
			content: "Acesse seu CRM de corretor de imóveis."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./agenda-D9jAxexG.mjs");
var Route$5 = createFileRoute("/_autenthicated/agenda")({
	head: () => ({ meta: [{ title: "Agenda — Corretor CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./clientes-DvBhhCsg.mjs");
var Route$4 = createFileRoute("/_autenthicated/clientes")({
	head: () => ({ meta: [{ title: "Clientes — Corretor CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./financeiro-6wRhvDIE.mjs");
var Route$3 = createFileRoute("/_autenthicated/financeiro")({
	head: () => ({ meta: [{ title: "Financeiro — Corretor CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./funil-DEKCPuJm.mjs");
var Route$2 = createFileRoute("/_autenthicated/funil")({
	head: () => ({ meta: [{ title: "Funil de vendas — Corretor CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./imoveis-CCB1CsNb.mjs");
var Route$1 = createFileRoute("/_autenthicated/imoveis")({
	head: () => ({ meta: [{ title: "Imóveis — Corretor CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./painel-D6SYmO0t.mjs");
var Route = createFileRoute("/_autenthicated/painel")({
	head: () => ({ meta: [{ title: "Painel — Corretor CRM" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var AutenthicatedRouteRoute = Route$9.update({
	id: "/_autenthicated",
	getParentRoute: () => Route$8
});
var AuthRoute = Route$6.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$8
});
var AutenthicatedRouteRouteChildren = {
	AutenthicatedAgendaRoute: Route$5.update({
		id: "/agenda",
		path: "/agenda",
		getParentRoute: () => AutenthicatedRouteRoute
	}),
	AutenthicatedClientesRoute: Route$4.update({
		id: "/clientes",
		path: "/clientes",
		getParentRoute: () => AutenthicatedRouteRoute
	}),
	AutenthicatedFinanceiroRoute: Route$3.update({
		id: "/financeiro",
		path: "/financeiro",
		getParentRoute: () => AutenthicatedRouteRoute
	}),
	AutenthicatedFunilRoute: Route$2.update({
		id: "/funil",
		path: "/funil",
		getParentRoute: () => AutenthicatedRouteRoute
	}),
	AutenthicatedImoveisRoute: Route$1.update({
		id: "/imoveis",
		path: "/imoveis",
		getParentRoute: () => AutenthicatedRouteRoute
	}),
	AutenthicatedPainelRoute: Route.update({
		id: "/painel",
		path: "/painel",
		getParentRoute: () => AutenthicatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AutenthicatedRouteRoute: AutenthicatedRouteRoute._addFileChildren(AutenthicatedRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
}
//#endregion
export { getRouter };
