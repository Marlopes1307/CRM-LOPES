import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as supabase } from "./client-SAOWSTXM.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
import { _ as Check, g as ChevronDown, h as ChevronUp } from "../_libs/lucide-react.mjs";
import { n as useQuery, r as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-table-BMo7zDqC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
function PageHeader({ title, subtitle, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 flex flex-wrap items-end justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl md:text-4xl",
			children: title
		}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-muted-foreground",
			children: subtitle
		})] }), action]
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5 " + (className ?? ""),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs text-muted-foreground",
			children: label
		}), children]
	});
}
function SelectField({ value, onChange, options, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: placeholder ?? "Selecione" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: o.id,
			children: o.label
		}, o.id)) })]
	});
}
function Empty({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-dashed p-10 text-center text-muted-foreground",
		children
	});
}
var cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
var opts = (arr) => arr.map((a) => ({
	id: a,
	label: cap(a)
}));
var STAGES = [
	{
		id: "novo",
		label: "Novo lead"
	},
	{
		id: "contato",
		label: "Em contato"
	},
	{
		id: "visita",
		label: "Visita agendada"
	},
	{
		id: "proposta",
		label: "Proposta"
	},
	{
		id: "negociacao",
		label: "Negociação"
	},
	{
		id: "fechado",
		label: "Fechado"
	},
	{
		id: "perdido",
		label: "Perdido"
	}
];
var stageLabel = (s) => STAGES.find((x) => x.id === s)?.label ?? s;
var PROPERTY_KINDS = [
	"apartamento",
	"casa",
	"terreno",
	"comercial",
	"cobertura",
	"sala"
];
var PROPERTY_STATUS = [
	{
		id: "disponivel",
		label: "Disponível"
	},
	{
		id: "reservado",
		label: "Reservado"
	},
	{
		id: "vendido",
		label: "Vendido"
	},
	{
		id: "alugado",
		label: "Alugado"
	}
];
var APPOINTMENT_KINDS = [
	{
		id: "visita",
		label: "Visita"
	},
	{
		id: "reuniao",
		label: "Reunião"
	},
	{
		id: "ligacao",
		label: "Ligação"
	},
	{
		id: "tarefa",
		label: "Tarefa"
	}
];
var CLIENT_TYPES = [
	"comprador",
	"vendedor",
	"locatário",
	"proprietário",
	"investidor"
];
var SOURCES = [
	"Indicação",
	"Instagram",
	"Portal imobiliário",
	"WhatsApp",
	"Site",
	"Placa",
	"Outro"
];
function brl(n) {
	return (n ?? 0).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
		maximumFractionDigits: 0
	});
}
function commission(value, pct) {
	return Math.round(value * pct) / 100;
}
function whatsappLink(phone) {
	const d = (phone ?? "").replace(/\D/g, "");
	if (!d) return null;
	return `https://wa.me/${d.length <= 11 ? "55" + d : d}`;
}
var ORDER = {
	clients: {
		col: "created_at",
		asc: false
	},
	properties: {
		col: "created_at",
		asc: false
	},
	appointments: {
		col: "starts_at",
		asc: true
	},
	deals: {
		col: "closed_at",
		asc: false
	}
};
function useTable(table) {
	const qc = useQueryClient();
	const query = useQuery({
		queryKey: [table],
		queryFn: async () => {
			const o = ORDER[table];
			const { data, error } = await supabase.from(table).select("*").order(o.col, { ascending: o.asc });
			if (error) throw error;
			return data ?? [];
		}
	});
	const done = () => qc.invalidateQueries({ queryKey: [table] });
	const onError = (e) => toast.error(e.message);
	const save = useMutation({
		mutationFn: async (values) => {
			const { id, ...rest } = values;
			const res = id ? await supabase.from(table).update(rest).eq("id", id) : await supabase.from(table).insert(rest);
			if (res.error) throw res.error;
		},
		onSuccess: () => {
			done();
			toast.success("Salvo");
		},
		onError
	});
	const patch = useMutation({
		mutationFn: async ({ id, ...rest }) => {
			const { error } = await supabase.from(table).update(rest).eq("id", id);
			if (error) throw error;
		},
		onSuccess: done,
		onError
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from(table).delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			done();
			toast.success("Excluído");
		},
		onError
	});
	return {
		rows: query.data ?? [],
		loading: query.isLoading,
		save,
		patch,
		remove
	};
}
function emptyToNull(obj) {
	const out = {};
	for (const [k, v] of Object.entries(obj)) out[k] = v === "" ? null : v;
	return out;
}
//#endregion
export { whatsappLink as _, PROPERTY_KINDS as a, SOURCES as c, brl as d, commission as f, useTable as g, stageLabel as h, Field as i, STAGES as l, opts as m, CLIENT_TYPES as n, PROPERTY_STATUS as o, emptyToNull as p, Empty as r, PageHeader as s, APPOINTMENT_KINDS as t, SelectField as u };
