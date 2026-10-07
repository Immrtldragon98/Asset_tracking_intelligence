"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

const DSIR_PATHS=[
  "/running-stands","/stand-area","/operations","/pm-schedule","/inventory","/activity","/entry-guides",
  "/reports","/import-report","/historical-import","/users","/planning","/system-status",
  "/intelligence","/investigation","/knowledge","/login"
];

export default function AppShell({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const showDSIRNavigation=DSIR_PATHS.some(p=>pathname===p||pathname.startsWith(p+"/"));
  const showRMIRNavigation=pathname==="/rmir"||pathname.startsWith("/rmir/");
  return (showDSIRNavigation||showRMIRNavigation)
    ? <div className="flex min-h-screen"><Sidebar/><div className="flex-1 min-w-0">{children}</div></div>
    : <div className="min-h-screen">{children}</div>;
}
