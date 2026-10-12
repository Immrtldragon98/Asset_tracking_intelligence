"use client";

import Link from "next/link";
import {
  ArrowRight, ClipboardCheck, Factory, Wrench, CalendarClock,
  History, Cpu, Zap, Boxes, ClipboardList, Gauge,
  ShieldCheck, Activity, Database, Search,
} from "lucide-react";

const tasks = [
  { title: "Record a stand change", description: "Capture a stand change or entry-guide replacement.", href: "/rmir/stand-change", icon: Wrench, label: "SHOPFLOOR RECORD" },
  { title: "Update an asset", description: "Record a motor, drive or critical-component change.", href: "/mir", icon: Cpu, label: "ASSET REGISTER" },
  { title: "Check equipment status", description: "Review stand and equipment records by mill.", href: "/dsir", icon: ClipboardCheck, label: "EQUIPMENT STATUS" },
  { title: "Find lifecycle history", description: "Trace component installations, removals and service life.", href: "/reliability", icon: History, label: "RELIABILITY" },
  { title: "Coordinate maintenance", description: "Review planned jobs and organise maintenance windows.", href: "/maintenance", icon: CalendarClock, label: "MAINTENANCE" },
];

const registers = [
  { code: "DSIR", name: "Finishing mill", detail: "Stand status, stand area, entry guides and spare life.", href: "/dsir", icon: Factory },
  { code: "RMIR", name: "Roughing mill", detail: "Stand changes, running stands and entry guides.", href: "/rmir", icon: Boxes },
  { code: "MIR", name: "Motors", detail: "Motor records, installation details and change history.", href: "/mir", icon: Cpu },
  { code: "DIR", name: "Drives", detail: "Drive inventory, equipment records and alerts.", href: "/dir", icon: Zap },
  { code: "SSIR", name: "Critical assets", detail: "Screw shafts, lubrication and hydraulic pumps.", href: "/ssir", icon: ShieldCheck },
];

export default function DashboardPage() {
  return (
    <main className="command-page">
      <div className="command-wrap">
        <section className="command-hero" aria-labelledby="command-title">
          <div className="command-eyebrow"><Activity className="h-3.5 w-3.5" /> Plant maintenance workspace</div>
          <h1 id="command-title">Asset intelligence.<br />Built for the shopfloor.</h1>
          <p>One workspace for equipment records, component lifecycle, maintenance coordination and reliability history. Start with the job in front of you.</p>
          <div className="command-hero-tags">
            <span><Factory className="h-3.5 w-3.5" /> WRM equipment registers</span>
            <span><History className="h-3.5 w-3.5" /> Traceable change history</span>
            <span><ShieldCheck className="h-3.5 w-3.5" /> Engineer-reviewed records</span>
          </div>
        </section>

        <section className="command-section" aria-labelledby="actions-title">
          <div className="command-section-head">
            <div>
              <h2 id="actions-title">Get work done</h2>
              <p>Task-first shortcuts for common maintenance activities.</p>
            </div>
            <span className="command-count">5 quick actions</span>
          </div>
          <div className="command-actions">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <Link key={task.title} href={task.href} className="command-action group">
                  <span className="command-action-icon"><Icon className="h-[19px] w-[19px]" aria-hidden="true" /></span>
                  <span className="command-action-label">{task.label}</span>
                  <span className="command-action-title">{task.title}</span>
                  <span className="command-action-desc">{task.description}</span>
                  <span className="command-action-arrow">Open workflow <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="command-section" aria-labelledby="registers-title">
          <div className="command-section-head">
            <div>
              <h2 id="registers-title">Equipment registers</h2>
              <p>Open the register that matches the asset you are working on.</p>
            </div>
            <span className="command-count">5 register groups</span>
          </div>
          <div className="command-registers">
            {registers.map((register) => {
              const Icon = register.icon;
              return (
                <Link key={register.code} href={register.href} className="command-register group">
                  <div className="command-register-top">
                    <span className="command-register-icon"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="command-register-code block">{register.code}</span>
                      <span className="command-register-name block">{register.name}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-teal-300" />
                  </div>
                  <p className="command-register-detail">{register.detail}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="command-section command-bottom-grid" aria-label="Additional workspace tools">
          <Link href="/planning" className="command-shortcut group">
            <ClipboardList className="command-shortcut-icon h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="command-shortcut-title block">Stand life planning</span>
              <span className="command-shortcut-desc block">Use historical service life to support maintenance planning.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300" />
          </Link>
          <Link href="/intelligence" className="command-shortcut group">
            <Search className="command-shortcut-icon h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="command-shortcut-title block">Equipment intelligence</span>
              <span className="command-shortcut-desc block">Explore recorded equipment signals and supporting context.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300" />
          </Link>
          <Link href="/system-status" className="command-shortcut group">
            <Database className="command-shortcut-icon h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="command-shortcut-title block">System status</span>
              <span className="command-shortcut-desc block">Check platform availability and data connectivity.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300" />
          </Link>
          <Link href="/operations" className="command-shortcut group">
            <Gauge className="command-shortcut-icon h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="command-shortcut-title block">Operations log</span>
              <span className="command-shortcut-desc block">Record and review equipment change activities.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300" />
          </Link>
        </section>

        <footer className="command-footer">
          <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Asset Tracking Intelligence</span>
          <p className="mt-1">Use saved records as the source of truth. Missing installation dates, service-life readings or history mean the record needs review—not that the equipment has no history.</p>
        </footer>
      </div>
    </main>
  );
}
