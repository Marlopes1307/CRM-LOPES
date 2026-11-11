import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { i as Trash2, s as Plus } from "../_libs/lucide-react.mjs";
import { d as brl, f as commission, g as useTable, i as Field, r as Empty, s as PageHeader, u as SelectField } from "./use-table-BMo7zDqC.mjs";
import { a as DialogTitle, i as DialogHeader, n as Dialog, r as DialogContent, t as Badge } from "./dialog-CWtemGy5.mjs";
import { a as format, n as parseISO, t as ptBR } from "../_libs/date-fns.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/financeiro-6wRhvDIE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Table = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "relative w-full overflow-auto",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
}));
Table.displayName = "Table";
var TableHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
}));
TableHeader.displayName = "TableHeader";
var TableBody = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
}));
TableBody.displayName = "TableBody";
var TableFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
}));
TableFooter.displayName = "TableFooter";
var TableRow = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
	ref,
	className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
	...props
}));
TableRow.displayName = "TableRow";
var TableHead = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
	ref,
	className: cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableHead.displayName = "TableHead";
var TableCell = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
	ref,
	className: cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableCell.displayName = "TableCell";
var TableCaption = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
}));
TableCaption.displayName = "TableCaption";
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border bg-card p-5 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-display text-3xl " + (tone ?? ""),
			children: value
		})]
	});
}
function Finance() {
	const { rows, save, patch, remove } = useTable("deals");
	const clients = useTable("clients").rows;
	const properties = useTable("properties").rows;
	const [open, setOpen] = (0, import_react.useState)(false);
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const [f, setF] = (0, import_react.useState)({
		description: "",
		value: "",
		commission_pct: "6",
		closed_at: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
		client_id: "",
		property_id: ""
	});
	const set = (k) => (v) => setF((p) => ({
		...p,
		[k]: v
	}));
	const stats = (0, import_react.useMemo)(() => {
		let received = 0, pending = 0, volume = 0;
		const months = Array.from({ length: 12 }, (_, i) => ({
			mes: format(new Date(year, i, 1), "MMM", { locale: ptBR }),
			comissao: 0
		}));
		for (const d of rows) {
			const c = commission(Number(d.value), Number(d.commission_pct));
			if (d.paid) received += c;
			else pending += c;
			volume += Number(d.value);
			const dt = parseISO(d.closed_at);
			if (dt.getFullYear() === year) months[dt.getMonth()].comissao += c;
		}
		return {
			received,
			pending,
			volume,
			months
		};
	}, [rows, year]);
	const preview = commission(Number(f.value || 0), Number(f.commission_pct || 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Financeiro",
			subtitle: "Negócios fechados e comissões",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Registrar negócio"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 md:grid-cols-4 mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Comissões recebidas",
					value: brl(stats.received),
					tone: "text-success"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "A receber",
					value: brl(stats.pending),
					tone: "text-warning"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "VGV negociado",
					value: brl(stats.volume)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Negócios fechados",
					value: String(rows.length)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border bg-card p-5 shadow-card mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "mb-4 text-lg",
				children: ["Comissões por mês — ", year]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
					data: stats.months,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							vertical: false,
							stroke: "var(--border)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "mes",
							tickLine: false,
							axisLine: false,
							fontSize: 12
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							tickLine: false,
							axisLine: false,
							fontSize: 12,
							tickFormatter: (v) => `${Math.round(v / 1e3)}k`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => brl(v) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "comissao",
							fill: "var(--chart-1)",
							radius: [
								6,
								6,
								0,
								0
							]
						})
					]
				}) })
			})]
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Nenhum negócio registrado." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border bg-card shadow-card overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Data" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Negócio" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Valor" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Comissão" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: rows.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: format(parseISO(d.closed_at), "dd/MM/yyyy") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: d.description || properties.find((p) => p.id === d.property_id)?.title || "—"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: clients.find((c) => c.id === d.client_id)?.name
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: brl(Number(d.value)) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					className: "font-semibold",
					children: [
						brl(commission(Number(d.value), Number(d.commission_pct))),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								"(",
								Number(d.commission_pct),
								"%)"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => patch.mutate({
						id: d.id,
						paid: !d.paid
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: d.paid ? "default" : "outline",
						children: d.paid ? "Recebida" : "A receber"
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "ghost",
					onClick: () => confirm("Excluir negócio?") && remove.mutate(d.id),
					"aria-label": "Excluir",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
				}) })
			] }, d.id)) })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Registrar negócio fechado" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid grid-cols-2 gap-3",
				onSubmit: (e) => {
					e.preventDefault();
					save.mutate({
						description: f.description || null,
						value: Number(f.value),
						commission_pct: Number(f.commission_pct),
						closed_at: f.closed_at,
						client_id: f.client_id || null,
						property_id: f.property_id || null
					}, { onSuccess: () => setOpen(false) });
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Descrição",
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.description,
							onChange: (e) => set("description")(e.target.value),
							placeholder: "Venda apto Moema"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Valor do negócio (R$) *",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							required: true,
							value: f.value,
							onChange: (e) => set("value")(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Comissão (%)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.1",
							value: f.commission_pct,
							onChange: (e) => set("commission_pct")(e.target.value)
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
						label: "Data de fechamento",
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: f.closed_at,
							onChange: (e) => set("closed_at")(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "col-span-2 rounded-lg bg-primary-soft p-3 text-sm",
						children: ["Sua comissão: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: brl(preview) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "col-span-2",
						disabled: save.isPending,
						children: "Salvar"
					})
				]
			})] })
		})
	] });
}
//#endregion
export { Finance as component };
