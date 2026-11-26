import { BrainCircuit, CalendarDays, Factory, FileText, Gauge, History, Home, LogIn, Package, Settings2, Wrench, Zap } from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavGroup = {
  name: string;
  items: NavItem[];
};

export const MODULES = [
  { code: "PLANT", label: "Whole plant", href: "/dashboard" },
  { code: "FMIR", label: "Finishing Mill · DSR", href: "/fmir" },
  { code: "RMIR", label: "Roughing Mill", href: "/rmir" },
  { code: "MIR", label: "Motors", href: "/mir" },
  { code: "DIR", label: "Drives", href: "/dir" },
  { code: "SSIR", label: "Screw Shafts", href: "/ssir" },
];

const FMIR: NavGroup[] = [
  { name: "Overview", items: [
    { name: "FMIR Home", href: "/fmir", icon: Home },
    { name: "Stand Preparation", href: "/stand-area", icon: Factory },
    { name: "Running Stands", href: "/running-stands", icon: Gauge },
    { name: "Alerts", href: "/alerts", icon: Zap },
  ]},
  { name: "Record changes", items: [
    { name: "Stand Change", href: "/operations", icon: Wrench },
    { name: "Entry Guide Change", href: "/entry-guides", icon: Settings2 },
  ]},
  { name: "Maintenance", items: [
    { name: "Maintenance Data", href: "/pm-schedule", icon: CalendarDays },
    { name: "Scheduled Maintenance", href: "/maintenance?module=DSIR", icon: CalendarDays },
    { name: "Spare service life", href: "/inventory", icon: Package },
  ]},
  { name: "Insights", items: [
    { name: "Equipment insights", href: "/intelligence", icon: BrainCircuit },
    { name: "Equipment life & history", href: "/reliability?module=DSIR", icon: BrainCircuit },
    { name: "Investigation", href: "/investigation", icon: Zap },
  ]},
  { name: "History", items: [
    { name: "Change history", href: "/activity", icon: History },
    { name: "Export History", href: "/reports", icon: FileText },
    { name: "Import Report", href: "/import-report", icon: FileText },
    { name: "Import old records", href: "/historical-import", icon: History },
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
    { name: "Scheduled Maintenance", href: "/maintenance?module=RMIR", icon: CalendarDays },
    { name: "Spare service life", href: "/rmir/spare-life", icon: Package },
  ]},
  { name: "Intelligence", items: [
    { name: "Equipment insights", href: "/rmir/intelligence", icon: BrainCircuit },
    { name: "Equipment life & history", href: "/reliability?module=RMIR", icon: BrainCircuit },
  ]},
  { name: "History", items: [
    { name: "History", href: "/rmir/history", icon: History },
  ]},
];

const MIR: NavGroup[] = [
  { name: "Overview", items: [{ name: "Equipment status", href: "/mir", icon: Gauge }] },
  { name: "Alerts & issues", items: [{ name: "Motor issues", href: "/mir/issues", icon: Zap }] },
  { name: "Maintenance", items: [{ name: "Maintenance Data", href: "/mir/maintenance", icon: CalendarDays }, { name: "Scheduled Maintenance", href: "/maintenance?module=MIR", icon: CalendarDays }] },
  { name: "Intelligence", items: [{ name: "Equipment insights", href: "/mir/intelligence", icon: BrainCircuit }, { name: "Equipment life & history", href: "/reliability?module=MIR", icon: BrainCircuit }] },
  { name: "History", items: [{ name: "History", href: "/mir/history", icon: History }] },
];

const DIR: NavGroup[] = [
  { name: "Overview", items: [{ name: "Equipment status", href: "/dir", icon: Gauge }] },
  { name: "Alerts", items: [{ name: "Alerts", href: "/dir/alerts", icon: Zap }] },
  { name: "Maintenance", items: [{ name: "Maintenance Data", href: "/dir/maintenance", icon: CalendarDays }, { name: "Scheduled Maintenance", href: "/maintenance?module=DIR", icon: CalendarDays }, { name: "Equipment life & history", href: "/reliability?module=DIR", icon: BrainCircuit }] },
  { name: "History", items: [{ name: "History", href: "/dir/history", icon: History }] },
];

const SSIR: NavGroup[] = [
  { name: "Overview", items: [{ name: "Equipment status", href: "/ssir", icon: Gauge }] },
  { name: "Alerts", items: [{ name: "Alerts", href: "/ssir/alerts", icon: Zap }] },
  { name: "Maintenance", items: [{ name: "Maintenance Data", href: "/ssir/maintenance", icon: CalendarDays }, { name: "Scheduled Maintenance", href: "/maintenance?module=SSIR", icon: CalendarDays }] },
  { name: "Intelligence", items: [{ name: "Equipment insights", href: "/ssir/intelligence", icon: BrainCircuit }, { name: "Equipment life & history", href: "/reliability?module=SSIR", icon: BrainCircuit }] },
  { name: "History", items: [{ name: "History", href: "/ssir/history", icon: History }] },
];

const PLANT: NavGroup[] = [
  { name: "Overview", items: [{ name: "Plant dashboard", href: "/dashboard", icon: Home }, { name: "Equipment explorer", href: "/equipment", icon: Factory }] },
  { name: "Registers", items: [
    { name: "FMIR · Finishing Mill (DSR)", href: "/fmir", icon: Factory },
    { name: "RMIR · Roughing Mill", href: "/rmir", icon: Wrench },
    { name: "MIR · Motors", href: "/mir", icon: Gauge },
    { name: "DIR · Drives", href: "/dir", icon: Zap },
    { name: "SSIR · Screw Shafts", href: "/ssir", icon: Settings2 },
  ] },
  { name: "Plant reliability", items: [{ name: "Equipment life & history", href: "/reliability", icon: BrainCircuit }, { name: "Maintenance schedule", href: "/maintenance", icon: CalendarDays }] },
  { name: "System", items: [
    { name: "System status", href: "/system-status", icon: Gauge },
    { name: "Settings", href: "/settings", icon: Settings2 },
    { name: "Users", href: "/users", icon: LogIn },
  ] },
];

export function groupsFor(module: string): NavGroup[] {
  if (module === "PLANT") return PLANT;
  if (module === "RMIR") return RMIR;
  if (module === "MIR") return MIR;
  if (module === "DIR") return DIR;
  if (module === "SSIR") return SSIR;
  return FMIR;
}

const FMIR_PATHS = ["/fmir", "/dsir", "/stand-area", "/running-stands", "/operations", "/entry-guides", "/pm-schedule", "/inventory", "/intelligence", "/investigation", "/activity", "/reports", "/import-report", "/historical-import", "/planning", "/alerts", "/positions", "/transactions"];
export const matchesPath = (pathname: string, path: string) => pathname === path || pathname.startsWith(path + "/");
export const displayModule = (code: string) => code.toUpperCase() === "DSIR" ? "FMIR" : code.toUpperCase();
export const storageModule = (code: string) => code.toUpperCase() === "FMIR" ? "DSIR" : code.toUpperCase();

export function moduleForPath(pathname: string, requested?: string | null): string {
  if (FMIR_PATHS.some(path => matchesPath(pathname, path))) return "FMIR";
  for (const code of ["RMIR", "MIR", "DIR", "SSIR"]) {
    if (matchesPath(pathname, "/" + code.toLowerCase()) || matchesPath(pathname, "/asset-intelligence/" + code.toLowerCase())) return code;
  }
  if (/^\/asset-intelligence\/(dsir|fmir)(\/|$)/i.test(pathname)) return "FMIR";
  const module = requested ? displayModule(requested) : "PLANT";
  return MODULES.some(item => item.code === module) ? module : "PLANT";
}

export const destinations = Array.from(new Map([
  ...MODULES.map(item => ({ title: item.code === "PLANT" ? "Plant dashboard" : `${item.code} · ${item.label}`, href: item.href, group: "Registers" })),
  ...MODULES.flatMap(module => groupsFor(module.code).flatMap(group => group.items.map(item => ({ title: item.name, href: item.href, group: `${module.label} · ${group.name}` })))),
].map(item => [item.href, item])).values());
