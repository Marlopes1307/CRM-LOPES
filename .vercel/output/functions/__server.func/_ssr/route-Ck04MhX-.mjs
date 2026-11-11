import { t as supabase } from "./client-SAOWSTXM.mjs";
import { Mt as redirect, h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-Ck04MhX-.js
var $$splitComponentImporter = () => import("./route-BBWHZsJ2.mjs");
var Route = createFileRoute("/_autenthicated")({
	ssr: false,
	beforeLoad: async () => {
		const { data } = await supabase.auth.getUser();
		if (!data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
