"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronRight, Command, Search, X } from "lucide-react";

const destinations = [
  { title: "Command center", href: "/dashboard", group: "Overview" },
  { title: "Finishing mill register", href: "/dsir", group: "Equipment" },
  { title: "Roughing mill register", href: "/rmir", group: "Equipment" },
  { title: "Motor register", href: "/mir", group: "Equipment" },
  { title: "Drive register", href: "/dir", group: "Equipment" },
  { title: "Critical asset register", href: "/ssir", group: "Equipment" },
  { title: "Stand preparation", href: "/stand-area", group: "Operations" },
  { title: "Running stands", href: "/running-stands", group: "Operations" },
  { title: "Stand change", href: "/operations", group: "Operations" },
  { title: "Entry guide change", href: "/entry-guides", group: "Operations" },
  { title: "Maintenance schedule", href: "/maintenance", group: "Maintenance" },
  { title: "Preventive maintenance", href: "/pm-schedule", group: "Maintenance" },
  { title: "Reliability history", href: "/reliability", group: "Intelligence" },
  { title: "Stand life planning", href: "/planning", group: "Intelligence" },
  { title: "Equipment intelligence", href: "/intelligence", group: "Intelligence" },
  { title: "Alerts", href: "/alerts", group: "Intelligence" },
  { title: "Reports", href: "/reports", group: "Records" },
  { title: "Change history", href: "/activity", group: "Records" },
  { title: "Inventory", href: "/inventory", group: "Records" },
  { title: "System status", href: "/system-status", group: "System" },
];

const pretty = (segment: string) => segment
  .split("-")
  .map(word => word.length < 4 && /^(rmir|mir|dir|ssir|dsir)$/i.test(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

export default function WorkspaceBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const segments = pathname.split("/").filter(Boolean);
  const current = destinations.find(item => item.href === pathname);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? destinations.filter(item => (item.title + " " + item.group).toLowerCase().includes(q)) : destinations;
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(value => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => { if (open) inputRef.current?.focus(); else setQuery(""); }, [open]);
  useEffect(() => { setOpen(false); }, [pathname]);

  const navigate = (href: string) => { setOpen(false); router.push(href); };

  return (
    <>
      <div className="workspace-bar">
        <nav aria-label="Breadcrumb" className="workspace-breadcrumb">
          <Link href="/dashboard">Workspace</Link>
          {segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");
            const label = index === segments.length - 1 && current ? current.title : pretty(segment);
            return <span key={href} className="workspace-crumb">
              <ChevronRight size={13} aria-hidden="true" />
              {index === segments.length - 1 ? <span aria-current="page">{label}</span> : <Link href={href}>{label}</Link>}
            </span>;
          })}
        </nav>
        <button type="button" className="workspace-search-trigger" onClick={() => setOpen(true)} aria-label="Search workspace pages">
          <Search size={15} aria-hidden="true" />
          <span>Go to a page</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>
      {open && <div className="workspace-search-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
        <section className="workspace-search-dialog" role="dialog" aria-modal="true" aria-label="Navigate workspace">
          <div className="workspace-search-input-row">
            <Search size={20} aria-hidden="true" />
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && results.length) navigate(results[0].href); }}
              placeholder="Search registers, maintenance, history..." aria-label="Search pages" />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close search"><X size={19}/></button>
          </div>
          <div className="workspace-search-results">
            {results.map(item => <button type="button" key={item.href} onClick={() => navigate(item.href)} className="workspace-search-result">
              <span><small>{item.group}</small><strong>{item.title}</strong></span><ArrowRight size={16} aria-hidden="true"/>
            </button>)}
            {!results.length && <p className="workspace-search-empty">No matching pages. Try a register name or maintenance.</p>}
          </div>
          <footer className="workspace-search-help"><Command size={14}/> Press Ctrl+K to open search · Enter to open the first result · Esc to close</footer>
        </section>
      </div>}
    </>
  );
}
