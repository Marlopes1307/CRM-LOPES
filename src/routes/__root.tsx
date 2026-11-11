import { createRootRoute, Outlet } from '@tanstack/react-router'
import "../styles.css";
// Removi a importação com ?url que pode estar causando o problema

export const Route = createRootRoute({
  component: () => <Outlet />,
  // Removi a referência ao appCss do head
})