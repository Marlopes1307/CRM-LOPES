import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as supabase } from "./client-SAOWSTXM.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-B46LnoQ2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		...opts,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("login");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({
				to: "/painel",
				replace: true
			});
		});
		const { data } = supabase.auth.onAuthStateChange((_e, session) => {
			if (session) navigate({
				to: "/painel",
				replace: true
			});
		});
		return () => data.subscription.unsubscribe();
	}, [navigate]);
	async function submit(e) {
		console.log("🟢 1. Função submit iniciada");
		e.preventDefault();
		console.log("🟢 2. preventDefault executado");
		setBusy(true);
		console.log("🟢 3. busy = true, modo:", mode);
		console.log("📧 Email:", email, "🔑 Senha:", password ? "preenchida" : "vazia");
		try {
			if (mode === "login") {
				console.log("🟢 4. Tentando login...");
				const { error, data } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				console.log("🟢 5. Resposta recebida");
				if (error) {
					console.error("🔴 Erro no login:", error);
					toast.error("E-mail ou senha inválidos");
				} else console.log("✅ Login OK!", data);
			} else {
				console.log("🟢 4. Tentando cadastro...");
				const { error, data } = await supabase.auth.signUp({
					email,
					password,
					options: { emailRedirectTo: window.location.origin + "/painel" }
				});
				console.log("🟢 5. Resposta recebida");
				if (error) {
					console.error("🔴 Erro no cadastro:", error);
					toast.error(error.message);
				} else {
					console.log("✅ Cadastro OK!", data);
					toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
				}
			}
		} catch (err) {
			console.error("🔴 Erro inesperado:", err);
			toast.error("Ocorreu um erro inesperado");
		} finally {
			console.log("🟢 6. Finalizando, setBusy(false)");
			setBusy(false);
		}
	}
	async function google() {
		if ((await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" })).error) toast.error("Não foi possível entrar com Google");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen grid md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden md:flex bg-hero text-primary-foreground p-12 flex-col justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "font-display text-xl",
				children: "Corretor CRM"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-4xl leading-tight max-w-md",
				children: "\"Cada lead bem cuidado é uma chave entregue.\""
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "w-full max-w-sm space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl",
						children: mode === "login" ? "Bem-vindo de volta" : "Criar conta"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "w-full",
						onClick: google,
						children: "Continuar com Google"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center text-xs text-muted-foreground",
						children: "ou com e-mail"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "auth-email",
							children: "E-mail"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "auth-email",
							type: "email",
							autoComplete: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "auth-password",
							children: "Senha"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "auth-password",
							type: "password",
							autoComplete: mode === "login" ? "current-password" : "new-password",
							required: true,
							minLength: 6,
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: busy,
						children: mode === "login" ? "Entrar" : "Cadastrar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted-foreground",
						children: mode === "login" ? "Ainda não tem uma conta?" : "Já tem uma conta?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "w-full",
						disabled: busy,
						onClick: () => setMode(mode === "login" ? "signup" : "login"),
						children: mode === "login" ? "Cadastrar" : "Voltar para entrar"
					})
				]
			})
		})]
	});
}
//#endregion
export { AuthPage as component };
