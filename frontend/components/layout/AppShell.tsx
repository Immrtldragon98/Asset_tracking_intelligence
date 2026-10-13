"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import WorkspaceBar from "@/components/layout/WorkspaceBar";

const DSIR_PATHS = [
  "/dashboard",
  "/dsir",
  "/running-stands",
  "/stand-area",
  "/operations",
  "/pm-schedule",
  "/maintenance",
  "/reliability",
  "/inventory",
  "/activity",
  "/entry-guides",
  "/reports",
  "/import-report",
  "/historical-import",
  "/planning",
  "/system-status",
  "/intelligence",
  "/investigation",
  "/knowledge",
  "/alerts",
  "/users",
];

const matches = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(path + "/");

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showNavigation =
    DSIR_PATHS.some((path) => matches(pathname, path)) ||
    ["/rmir", "/mir", "/dir", "/ssir"].some((path) => matches(pathname, path));

  return showNavigation ? (
    <div className="min-h-screen">
      <Sidebar />
      <main className="app-shell-content"><WorkspaceBar />{children}</main>
    </div>
  ) : (
    <div className="min-h-screen">{children}</div>
  );
}
