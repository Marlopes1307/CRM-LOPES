import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { d as brl, g as useTable, l as STAGES, s as PageHeader } from "./use-table-BMo7zDqC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/funil-DEKCPuJm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Funnel() {
	const { rows, patch } = useTable("clients");
	const [over, setOver] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Funil de vendas",
		subtitle: "Arraste os cartões entre as etapas"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-3 overflow-x-auto pb-4",
		children: STAGES.map((s) => {
			const items = rows.filter((c) => c.stage === s.id);
			const total = items.reduce((a, c) => a + Number(c.budget ?? 0), 0);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onDragOver: (e) => {
					e.preventDefault();
					setOver(s.id);
				},
				onDragLeave: () => setOver(null),
				onDrop: (e) => {
					setOver(null);
					const id = e.dataTransfer.getData("id");
					if (id) patch.mutate({
						id,
						stage: s.id
					});
				},
				className: "w-64 shrink-0 rounded-xl p-3 transition-colors " + (over === s.id ? "bg-primary-soft" : "bg-secondary"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-baseline justify-between px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold font-sans",
							children: s.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: items.length
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-1 mb-3 text-xs text-muted-foreground",
						children: brl(total)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2 min-h-24",
						children: items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							draggable: true,
							onDragStart: (e) => e.dataTransfer.setData("id", c.id),
							className: "cursor-grab rounded-lg border bg-card p-3 shadow-card active:cursor-grabbing",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-sm",
									children: c.name
								}),
								c.interest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-1 line-clamp-2",
									children: c.interest
								}),
								c.budget != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold text-primary mt-1",
									children: brl(Number(c.budget))
								})
							]
						}, c.id))
					})
				]
			}, s.id);
		})
	})] });
}
//#endregion
export { Funnel as component };
