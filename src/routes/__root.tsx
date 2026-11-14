import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6">
    <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
    <p className="text-muted-foreground mb-4">
      A página que você procura não existe.
    </p>
    <a href="/" className="text-primary underline">
      Voltar ao início
    </a>
  </div>
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mota Negócios Imobiliários" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  );

  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
