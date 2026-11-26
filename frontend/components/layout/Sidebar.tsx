"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Factory, LogIn, LogOut, Menu, X, LayoutDashboard, Network, CalendarDays, Package, BrainCircuit, PanelLeftClose, PanelLeftOpen, ChevronRight } from "lucide-react";
import { useWorkspaceResource } from "@/hooks/useWorkspaceResource";
import { PlantLine } from "@/lib/equipment";
import { AuthUser, clearSession, getUser } from "@/lib/auth";
import { MODULES, groupsFor, moduleForPath, storageModule, type NavItem } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const module = moduleForPath(pathname, searchParams.get("module"));
  const groups = groupsFor(module);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false), [collapsed, setCollapsed] = useState(false);
  const locations = useWorkspaceResource<PlantLine[]>("/dashboard/");
  useEffect(() => { try { setCollapsed(localStorage.getItem("ati-sidebar-collapsed") === "true"); } catch {} }, []);
  const toggleSidebar = () => setCollapsed(value => { const next = !value; try { localStorage.setItem("ati-sidebar-collapsed", String(next)); } catch {} return next; });
  const rail = [
    { label: "Plant overview", href: "/dashboard", icon: LayoutDashboard, selected: pathname === "/dashboard" },
    { label: "Equipment explorer", href: "/equipment", icon: Network, selected: pathname === "/equipment" || ["FMIR","RMIR","MIR","DIR","SSIR"].includes(module) && !["/inventory","/reliability","/maintenance"].includes(pathname) },
    { label: "Maintenance work", href: "/maintenance", icon: CalendarDays, selected: pathname === "/maintenance" },
    { label: "Spares", href: "/inventory", icon: Package, selected: pathname === "/inventory" },
    { label: "Reliability", href: "/reliability", icon: BrainCircuit, selected: pathname === "/reliability" },
  ];
  const primaryRail = <nav className="ati-primary-rail" aria-label="Primary workspaces">
    <Link href="/dashboard" className="ati-rail-brand" aria-label="Asset Tracking Intelligence"><Factory size={23}/></Link>
    {rail.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} title={item.label} aria-label={item.label} aria-current={item.selected ? "page" : undefined}><Icon size={21}/><span>{item.label}</span></Link>; })}
    <button type="button" onClick={toggleSidebar} aria-label={collapsed ? "Expand workflow sidebar" : "Collapse workflow sidebar"} aria-expanded={!collapsed} className="ati-rail-collapse">{collapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}</button>
  </nav>;

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    window.addEventListener("dsr-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("dsr-auth-change", sync); window.removeEventListener("storage", sync); };
  }, []);
  useEffect(() => setOpen(false), [pathname, searchParams]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const active = (href: string) => {
    const [path, query] = href.split("?");
    if (path !== pathname) return false;
    if (!query) return true;
    return storageModule(new URLSearchParams(query).get("module") || "ALL") === storageModule(searchParams.get("module") || "ALL");
  };
  const logout = () => { clearSession(); setUser(null); router.push("/dashboard"); };
  const allItems = groups.flatMap(group => group.items);
  const quickHrefs = module === "FMIR"
    ? ["/fmir", "/stand-area", "/operations", "/inventory", "/activity"]
    : module === "PLANT" ? ["/dashboard", "/fmir", "/rmir", "/reliability", "/system-status"]
    : allItems.slice(0, 5).map(item => item.href);
  const quickItems = quickHrefs.map(href => allItems.find(item => item.href === href)).filter((item): item is NavItem => !!item);

  const panel = <>
    <Link href="/dashboard" className="ati-brand" aria-label="Asset Tracking Intelligence plant home">
      <span className="ati-brand-mark"><Factory size={19} /></span>
      <span><b>Asset Tracking<br />Intelligence</b><small>Plant-wide maintenance</small></span>
    </Link>
    <label className="ati-register-picker">Equipment register
      <select value={module} onChange={event => { const target = MODULES.find(item => item.code === event.target.value); if (target) router.push(target.href); }}>
        {MODULES.map(item => <option key={item.code} value={item.code}>{item.code === "PLANT" ? "Plant overview" : `${item.code} · ${item.label}`}</option>)}
      </select>
    </label>
    <div className="ati-navigation-scroll">
      <section className="ati-navigation-group">
        <h2>Plant → Line → Equipment</h2>
        <Link href="/equipment" className={"ati-nav-item " + (pathname === "/equipment" && !searchParams.get("line") ? "ati-nav-active" : "")}><Network className="h-4 w-4"/><span>Equipment explorer</span></Link>
        {locations.data?.map(line => <Link key={line.id} href={"/equipment?line=" + encodeURIComponent(line.name)} className={"ati-nav-item ati-location-link " + (pathname === "/equipment" && searchParams.get("line") === line.name ? "ati-nav-active" : "")}><ChevronRight className="h-3 w-3"/><span>{line.name}</span><small>{line.positions.length} positions</small></Link>)}
        {locations.error && <button className="ati-nav-item text-amber-300" onClick={() => void locations.reload()}>Retry line navigation</button>}
      </section>
      {groups.map(group => <section key={group.name} className="ati-navigation-group">
        <h2>{group.name}</h2>
        <nav aria-label={`${module} ${group.name}`}>
          {group.items.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={`ati-nav-item ${active(item.href) ? "ati-nav-active" : ""}`}><Icon className="h-4 w-4" /><span>{item.name}</span></Link>; })}
        </nav>
      </section>)}
    </div>
    <div className="ati-sidebar-account">
      <Link href="/dashboard" className="ati-nav-item"><Factory size={16} /><span>Plant overview</span></Link>
      {user ? <button onClick={logout} className="ati-nav-item"><LogOut size={16} /><span>Sign out · {user.username}</span></button> : <Link href="/login" className="ati-nav-item"><LogIn size={16} /><span>Viewer mode · Sign in</span></Link>}
    </div>
  </>;

  return <>
    {primaryRail}
    <aside className={"ati-desktop-sidebar " + (collapsed ? "ati-secondary-collapsed" : "")} aria-label="Workflow navigation">{panel}</aside>
    <header className="ati-mobile-topbar">
      <button className="ati-menu-button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={20} /></button>
      <div><b>{module === "PLANT" ? "Asset Tracking Intelligence" : MODULES.find(item => item.code === module)?.label}</b><small>{module === "PLANT" ? "Whole plant" : `${module} · Equipment register`}</small></div>
    </header>
    {open && <div className="ati-mobile-overlay" onClick={() => setOpen(false)}>
      <aside className="ati-mobile-drawer" aria-label="Mobile workspace navigation" onClick={event => event.stopPropagation()}>
        <nav className="ati-mobile-workspaces" aria-label="Workspaces">{rail.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
        <button className="ati-drawer-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button>
        {panel}
      </aside>
    </div>}
    <nav className="ati-mobile-bottom" aria-label="Quick navigation" style={{ gridTemplateColumns: `repeat(${quickItems.length}, minmax(0, 1fr))` }}>
      {quickItems.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined}><Icon className="h-4 w-4" /><span>{item.name}</span></Link>; })}
    </nav>
  </>;
}
