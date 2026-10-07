"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  Factory,
  FileText,
  Gauge,
  History,
  Home,
  LogIn,
  LogOut,
  Menu,
  Package,
  Settings2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AuthUser, clearSession, getUser } from "@/lib/auth";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  name: string;
  items: NavItem[];
};

const MODULES = [
  { code: "DSIR", label: "Finishing Mill", href: "/dsir" },
  { code: "RMIR", label: "Roughing Mill", href: "/rmir" },
  { code: "MIR", label: "Motors", href: "/mir" },
  { code: "DIR", label: "Drives", href: "/dir" },
  { code: "SSIR", label: "Screw Shafts", href: "/ssir" },
];

const DSIR: NavGroup[] = [
  { name: "Overview", items: [
    { name: "Stand Area", href: "/stand-area", icon: Factory },
    { name: "Running Stands", href: "/running-stands", icon: Gauge },
    { name: "Alerts", href: "/alerts", icon: Zap },
  ]},
  { name: "Operations", items: [
    { name: "Stand Change", href: "/operations", icon: Wrench },
    { name: "Entry Guide Change", href: "/entry-guides", icon: Settings2 },
  ]},
  { name: "Maintenance", items: [
    { name: "Maintenance Data", href: "/pm-schedule", icon: CalendarDays },
    { name: "Spare Life", href: "/inventory", icon: Package },
  ]},
  { name: "Intelligence", items: [
    { name: "AI / Intelligence", href: "/intelligence", icon: BrainCircuit },
    { name: "Investigation", href: "/investigation", icon: Zap },
  ]},
  { name: "History", items: [
    { name: "Activity History", href: "/activity", icon: History },
    { name: "Export History", href: "/reports", icon: FileText },
    { name: "Import Report", href: "/import-report", icon: FileText },
    { name: "Historical Data", href: "/historical-import", icon: History },
  ]},
];

const RMIR: NavGroup[] = [
  { name: "Overview", items: [
    { name: "Running Stands", href: "/rmir", icon: Gauge },
    { name: "Stand Area", href: "/rmir/stand-area", icon: Factory },
  ]},
  { name: "Operations", items: [
    { name: "Stand Change", href: "/rmir/stand-change", icon: Wrench },
    { name: "Entry Guide Change", href: "/rmir/entry-guide-change", icon: Settings2 },
  ]},
  { name: "Maintenance", items: [
    { name: "Maintenance Data", href: "/rmir/maintenance", icon: CalendarDays },
    { name: "Spare Life", href: "/rmir/spare-life", icon: Package },
  ]},
  { name: "Intelligence", items: [
    { name: "AI / Intelligence", href: "/rmir/intelligence", icon: BrainCircuit },
  ]},
  { name: "History", items: [
    { name: "History", href: "/rmir/history", icon: History },
  ]},
];

const MIR: NavGroup[] = [
  { name: "Overview", items: [{ name: "Running Status", href: "/mir", icon: Gauge }] },
  { name: "Issues", items: [{ name: "Vibration / Temperature / Torque", href: "/mir/issues", icon: Zap }] },
  { name: "Maintenance", items: [{ name: "Maintenance Data", href: "/mir/maintenance", icon: CalendarDays }] },
  { name: "Intelligence", items: [{ name: "AI / Intelligence", href: "/mir/intelligence", icon: BrainCircuit }] },
  { name: "History", items: [{ name: "History", href: "/mir/history", icon: History }] },
];

const DIR: NavGroup[] = [
  { name: "Overview", items: [{ name: "Running Status", href: "/dir", icon: Gauge }] },
  { name: "Alerts", items: [{ name: "Alerts", href: "/dir/alerts", icon: Zap }] },
  { name: "Maintenance", items: [{ name: "Maintenance Data", href: "/dir/maintenance", icon: CalendarDays }] },
  { name: "History", items: [{ name: "History", href: "/dir/history", icon: History }] },
];

const SSIR: NavGroup[] = [
  { name: "Overview", items: [{ name: "Running Status", href: "/ssir", icon: Gauge }] },
  { name: "Alerts", items: [{ name: "Alerts", href: "/ssir/alerts", icon: Zap }] },
  { name: "Maintenance", items: [{ name: "Maintenance Data", href: "/ssir/maintenance", icon: CalendarDays }] },
  { name: "Intelligence", items: [{ name: "AI / Intelligence", href: "/ssir/intelligence", icon: BrainCircuit }] },
  { name: "History", items: [{ name: "History", href: "/ssir/history", icon: History }] },
];

function groupsFor(module: string): NavGroup[] {
  if (module === "RMIR") return RMIR;
  if (module === "MIR") return MIR;
  if (module === "DIR") return DIR;
  if (module === "SSIR") return SSIR;
  return DSIR;
}

function moduleForPath(pathname: string): string {
  if (pathname === "/rmir" || pathname.startsWith("/rmir/")) return "RMIR";
  if (pathname === "/mir" || pathname.startsWith("/mir/")) return "MIR";
  if (pathname === "/dir" || pathname.startsWith("/dir/")) return "DIR";
  if (pathname === "/ssir" || pathname.startsWith("/ssir/")) return "SSIR";
  return "DSIR";
}

function Brand() {
  return (
    <Link href="/dashboard" className="app-brand" aria-label="Asset Tracking Intelligence home">
      <div className="brand-mark"><span /></div>
      <div>
        <div className="brand-title">Asset Tracking Intelligence</div>
        <div className="brand-subtitle">Plant-wide maintenance</div>
      </div>
    </Link>
  );
}

function ModulePicker({ module, onNavigate }: { module: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const current = MODULES.find((item) => item.code === module) ?? MODULES[0];

  return (
    <div className="nav-popover">
      <button className="module-switch-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{current.code}</span>
        <b>{current.label}</b>
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="module-dropdown">
          {MODULES.map((item) => (
            <Link
              key={item.code}
              href={item.href}
              onClick={() => { setOpen(false); onNavigate?.(); }}
              className={`module-option ${item.code === module ? "module-option-active" : ""}`}
            >
              <b>{item.code}</b>
              <small>{item.label}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupMenu({ group, pathname, onNavigate }: { group: NavGroup; pathname: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const isActive = group.items.some((item) => pathname === item.href || (item.href === "/intelligence" && pathname === "/investigation"));

  return (
    <div className="nav-popover">
      <button className={`nav-group-btn ${isActive ? "nav-group-active" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{group.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="nav-dropdown">
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href === "/intelligence" && pathname === "/investigation");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { setOpen(false); onNavigate?.(); }}
                className={`nav-dropdown-item ${active ? "nav-dropdown-active" : ""}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
                <ArrowRight className="nav-item-arrow w-3.5 h-3.5" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const module = moduleForPath(pathname);
  const groups = groupsFor(module);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    window.addEventListener("dsr-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dsr-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const logout = () => {
    clearSession();
    setUser(null);
    router.push("/dashboard");
  };

  return (
    <>
      <header className="app-topnav">
        <div className="app-topnav-inner">
          <Brand />
          <div className="desktop-module"><ModulePicker module={module} /></div>
          <Link href="/dashboard" className="home-nav"><Home className="w-4 h-4" /> Platform</Link>
          <nav className="desktop-groups" aria-label={`${module} navigation`}>
            {groups.map((group) => <GroupMenu key={group.name} group={group} pathname={pathname} />)}
          </nav>
          <div className="nav-account">
            {user ? (
              <button onClick={logout} className="account-action"><LogOut className="w-4 h-4" /> Sign out</button>
            ) : (
              <Link href="/login" className="account-action"><LogIn className="w-4 h-4" /> Sign in</Link>
            )}
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <div>
              <div className="drawer-head">
                <Brand />
                <button onClick={() => setMobileOpen(false)} className="drawer-close" aria-label="Close navigation"><X className="w-5 h-5" /></button>
              </div>
              <ModulePicker module={module} onNavigate={() => setMobileOpen(false)} />
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="mobile-platform-link"><Home className="w-4 h-4" /> Platform Home</Link>
              <div className="mobile-group-list">
                {groups.map((group) => <GroupMenu key={group.name} group={group} pathname={pathname} onNavigate={() => setMobileOpen(false)} />)}
              </div>
            </div>
            <div className="drawer-account">
              {user ? (
                <button onClick={logout} className="account-action"><LogOut className="w-4 h-4" /> Sign out</button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="account-action"><LogIn className="w-4 h-4" /> Sign in</Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
