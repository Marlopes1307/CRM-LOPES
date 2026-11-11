import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { _ as Check, i as Trash2, s as Plus } from "../_libs/lucide-react.mjs";
import { g as useTable, i as Field, r as Empty, s as PageHeader, t as APPOINTMENT_KINDS, u as SelectField } from "./use-table-BMo7zDqC.mjs";
import { a as DialogTitle, i as DialogHeader, n as Dialog, r as DialogContent, t as Badge } from "./dialog-CWtemGy5.mjs";
import { a as format, i as isPast, n as parseISO, r as isToday, t as ptBR } from "../_libs/date-fns.mjs";
import { i as TabsTrigger$1, n as TabsContent$1, r as TabsList$1, t as Tabs$1 } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agenda-D9jAxexG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var Tabs = Tabs$1;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList$1, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = TabsList$1.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger$1, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = TabsTrigger$1.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent$1, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = TabsContent$1.displayName;
function Agenda() {
	const { rows, save, patch, remove } = useTable("appointments");
	const clients = useTable("clients").rows;
	const properties = useTable("properties").rows;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("pendentes");
	const [f, setF] = (0, import_react.useState)({
		title: "",
		kind: "visita",
		date: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
		time: "10:00",
		client_id: "",
		property_id: "",
		notes: ""
	});
	const set = (k) => (v) => setF((p) => ({
		...p,
		[k]: v
	}));
	const groups = (0, import_react.useMemo)(() => {
		const list = rows.filter((a) => tab === "pendentes" ? !a.done : tab === "concluidas" ? a.done : true);
		const m = /* @__PURE__ */ new Map();
		for (const a of list) {
			const k = a.starts_at.slice(0, 10);
			m.set(k, [...m.get(k) ?? [], a]);
		}
		return [...m.entries()];
	}, [rows, tab]);
	const name = (id, arr) => {
		const x = arr.find((y) => y.id === id);
		return x ? x.name ?? x.title : null;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Agenda",
			subtitle: "Visitas, reuniões e tarefas",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Novo compromisso"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
			value: tab,
			onValueChange: setTab,
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "pendentes",
					children: "Pendentes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "concluidas",
					children: "Concluídas"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "todas",
					children: "Todas"
				})
			] })
		}),
		groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Nada agendado." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children: groups.map(([day, items]) => {
				const d = parseISO(day);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-lg capitalize",
					children: isToday(d) ? "Hoje" : format(d, "EEEE, d 'de' MMMM", { locale: ptBR })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: items.map((a) => {
						const late = !a.done && isPast(parseISO(a.starts_at));
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: a.done,
									onCheckedChange: (c) => patch.mutate({
										id: a.id,
										done: !!c
									}),
									"aria-label": "Concluir"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-12 font-semibold tabular-nums",
									children: format(parseISO(a.starts_at), "HH:mm")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium " + (a.done ? "line-through text-muted-foreground" : ""),
										children: a.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground truncate",
										children: [
											name(a.client_id, clients),
											name(a.property_id, properties),
											a.notes
										].filter(Boolean).join(" · ")
									})]
								}),
								late && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "destructive",
									children: "Atrasado"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									children: APPOINTMENT_KINDS.find((k) => k.id === a.kind)?.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									onClick: () => remove.mutate(a.id),
									"aria-label": "Excluir",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						}, a.id);
					})
				})] }, day);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Novo compromisso" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid grid-cols-2 gap-3",
				onSubmit: (e) => {
					e.preventDefault();
					save.mutate({
						title: f.title,
						kind: f.kind,
						starts_at: (/* @__PURE__ */ new Date(`${f.date}T${f.time}`)).toISOString(),
						client_id: f.client_id || null,
						property_id: f.property_id || null,
						notes: f.notes || null
					}, { onSuccess: () => {
						setOpen(false);
						setF((p) => ({
							...p,
							title: "",
							notes: ""
						}));
					} });
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Título *",
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: f.title,
							onChange: (e) => set("title")(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Tipo",
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							value: f.kind,
							onChange: set("kind"),
							options: APPOINTMENT_KINDS
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Data",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							required: true,
							value: f.date,
							onChange: (e) => set("date")(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Hora",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							required: true,
							value: f.time,
							onChange: (e) => set("time")(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Cliente",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							value: f.client_id,
							onChange: set("client_id"),
							options: clients.map((c) => ({
								id: c.id,
								label: c.name
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Imóvel",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							value: f.property_id,
							onChange: set("property_id"),
							options: properties.map((p) => ({
								id: p.id,
								label: p.title
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Observações",
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: f.notes,
							onChange: (e) => set("notes")(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "col-span-2",
						disabled: save.isPending,
						children: "Agendar"
					})
				]
			})] })
		})
	] });
}
//#endregion
export { Agenda as component };
