import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { c as Phone, i as Trash2, l as Pencil, o as Search, s as Plus, u as MessageCircle } from "../_libs/lucide-react.mjs";
import { _ as whatsappLink, c as SOURCES, d as brl, g as useTable, h as stageLabel, i as Field, l as STAGES, m as opts, n as CLIENT_TYPES, p as emptyToNull, r as Empty, s as PageHeader, u as SelectField } from "./use-table-BMo7zDqC.mjs";
import { a as DialogTitle, i as DialogHeader, n as Dialog, r as DialogContent, t as Badge } from "./dialog-CWtemGy5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/clientes-DvBhhCsg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var blank = {
	name: "",
	email: "",
	phone: "",
	type: "comprador",
	source: "",
	budget: "",
	interest: "",
	stage: "novo",
	notes: ""
};
function ClientForm({ initial, onDone }) {
	const { save } = useTable("clients");
	const [f, setF] = (0, import_react.useState)(initial ? Object.fromEntries(Object.keys(blank).map((k) => [k, initial[k] == null ? "" : String(initial[k])])) : blank);
	const set = (k) => (v) => setF((p) => ({
		...p,
		[k]: v
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid grid-cols-2 gap-3",
		onSubmit: (e) => {
			e.preventDefault();
			const v = emptyToNull({
				...f,
				budget: f.budget ? Number(f.budget) : ""
			});
			save.mutate({
				...initial ? { id: initial.id } : {},
				name: f.name,
				email: v["email"],
				phone: v["phone"],
				type: f.type,
				source: v["source"],
				budget: v["budget"],
				interest: v["interest"],
				stage: f.stage,
				notes: v["notes"]
			}, { onSuccess: onDone });
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Nome *",
				className: "col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					required: true,
					value: f.name,
					onChange: (e) => set("name")(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Telefone / WhatsApp",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.phone,
					onChange: (e) => set("phone")(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "E-mail",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "email",
					value: f.email,
					onChange: (e) => set("email")(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Tipo",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					value: f.type,
					onChange: set("type"),
					options: opts(CLIENT_TYPES)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Origem",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					value: f.source,
					onChange: set("source"),
					options: SOURCES.map((s) => ({
						id: s,
						label: s
					}))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Orçamento (R$)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					value: f.budget,
					onChange: (e) => set("budget")(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Etapa",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					value: f.stage,
					onChange: set("stage"),
					options: STAGES.map((s) => ({
						id: s.id,
						label: s.label
					}))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Interesse (ex: 3 quartos, Zona Sul)",
				className: "col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.interest,
					onChange: (e) => set("interest")(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Anotações",
				className: "col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 3,
					value: f.notes,
					onChange: (e) => set("notes")(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "col-span-2",
				disabled: save.isPending,
				children: "Salvar cliente"
			})
		]
	});
}
function ClientsPage() {
	const { rows, remove } = useTable("clients");
	const [q, setQ] = (0, import_react.useState)("");
	const [stage, setStage] = (0, import_react.useState)("todos");
	const [editing, setEditing] = (0, import_react.useState)(void 0);
	const list = (0, import_react.useMemo)(() => rows.filter((c) => (stage === "todos" || c.stage === stage) && [
		c.name,
		c.email,
		c.phone,
		c.interest
	].join(" ").toLowerCase().includes(q.toLowerCase())), [
		rows,
		q,
		stage
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Clientes",
			subtitle: `${rows.length} contatos na sua carteira`,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setEditing(null),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Novo cliente"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 min-w-60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "pl-9 bg-card",
					placeholder: "Buscar por nome, telefone, interesse...",
					value: q,
					onChange: (e) => setQ(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-48",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					value: stage,
					onChange: setStage,
					options: [{
						id: "todos",
						label: "Todas as etapas"
					}, ...STAGES]
				})
			})]
		}),
		list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Nenhum cliente encontrado." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
			children: list.map((c) => {
				const wa = whatsappLink(c.phone);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border bg-card p-5 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground capitalize",
								children: [c.type, c.source ? ` · ${c.source}` : ""]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: stageLabel(c.stage)
							})]
						}),
						c.interest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm",
							children: c.interest
						}),
						c.budget != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm font-semibold text-primary",
							children: ["Até ", brl(Number(c.budget))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-1",
							children: [
								wa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "icon",
									variant: "ghost",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: wa,
										target: "_blank",
										rel: "noreferrer",
										"aria-label": "WhatsApp",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" })
									})
								}),
								c.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "icon",
									variant: "ghost",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: `tel:${c.phone}`,
										"aria-label": "Ligar",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" })
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => setEditing(c),
									"aria-label": "Editar",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => confirm("Excluir cliente?") && remove.mutate(c.id),
									"aria-label": "Excluir",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						})
					]
				}, c.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: editing !== void 0,
			onOpenChange: (o) => !o && setEditing(void 0),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-w-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Editar cliente" : "Novo cliente" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientForm, {
					initial: editing,
					onDone: () => setEditing(void 0)
				})]
			})
		})
	] });
}
//#endregion
export { ClientForm, ClientsPage as component };
