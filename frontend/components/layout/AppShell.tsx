"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

const DSIR_PATHS = [
  "/dsir",
  "/running-stands",
  "/stand-area",
  "/operations",
  "/pm-schedule",
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
      <main className="app-shell-content">{children}</main>
    </div>
  ) : (
    <div className="min-h-screen">{children}</div>
  );
}
