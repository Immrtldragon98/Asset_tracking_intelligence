"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import WorkspaceBar from "@/components/layout/WorkspaceBar";

const PUBLIC_PATHS = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (PUBLIC_PATHS.includes(pathname)) return <div className="min-h-screen">{children}</div>;
  return <div className="ati-shell">
    <a className="ati-skip-link" href="#workspace-content">Skip to workspace</a>
    <Suspense fallback={<div className="h-16" />}><Sidebar /></Suspense>
    <div className="app-shell-content"><WorkspaceBar /><div id="workspace-content" tabIndex={-1}>{children}</div></div>
  </div>;
}
