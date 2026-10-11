"use client";

import Link from "next/link";
import {
  ArrowRight, ClipboardCheck, Factory, Wrench, CalendarClock,
  History, Cpu, Zap, Boxes, CircleHelp, ClipboardList,
} from "lucide-react";

const tasks = [
  {
    title: "Record a stand change",
    description: "Record a roughing-mill stand change or entry-guide replacement.",
    href: "/rmir/stand-change",
    icon: Wrench,
    label: "MOST USED",
  },
  {
    title: "Update a motor or critical asset",
    description: "Open the motor or critical-asset register to record a change.",
    href: "/mir",
    icon: Cpu,
    label: "UPDATE ASSET",
  },
  {
    title: "Check running equipment",
    description: "Open a register to review the equipment and its recorded status.",
    href: "/dsir",
    icon: ClipboardCheck,
    label: "VIEW STATUS",
  },
  {
    title: "View maintenance history",
    description: "Review recorded changes and component lifecycle information.",
    href: "/reliability",
    icon: History,
    label: "FIND RECORDS",
  },
  {
    title: "Plan maintenance",
    description: "Review planned work and maintenance schedules.",
    href: "/maintenance",
    icon: CalendarClock,
    label: "PLAN WORK",
  },
];

const registers = [
  { code: "DSIR", name: "Finishing mill stands", detail: "Stand status, stand area, entry guides and spare life.", href: "/dsir", icon: Factory },
  { code: "RMIR", name: "Roughing mill stands", detail: "Running stands, stand changes and entry guides.", href: "/rmir", icon: Boxes },
  { code: "MIR", name: "Motors", detail: "Motor records, windings, bearings and couplings.", href: "/mir", icon: Cpu },
  { code: "DIR", name: "Drives", detail: "VFD and drive equipment records.", href: "/dir", icon: Zap },
  { code: "SSIR", name: "Other critical assets", detail: "Screw shafts, lubrication pumps and hydraulic pumps.", href: "/ssir", icon: Wrench },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#080D16] px-4 py-6 text-slate-100 sm:px-6 md:py-9">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-[#26354a] bg-gradient-to-br from-[#142238] to-[#0d1522] p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-sky-300">Plant maintenance workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">What would you like to do?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Record equipment changes, check asset records, and organise maintenance from one place.
            Choose a task below to get started.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-slate-600/70 px-3 py-1.5">1. Choose a task</span>
            <span className="rounded-full border border-slate-600/70 px-3 py-1.5">2. Select equipment</span>
            <span className="rounded-full border border-slate-600/70 px-3 py-1.5">3. Save the record</span>
          </div>
        </header>

        <section aria-labelledby="tasks-heading">
          <div className="mb-3">
            <h2 id="tasks-heading" className="text-lg font-bold text-white">Quick actions</h2>
            <p className="mt-1 text-sm text-slate-400">Start with the task you need—not the module name.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <Link key={task.title} href={task.href} className="group flex min-h-[142px] items-start gap-4 rounded-xl border border-[#2a3a50] bg-[#101827] p-4 transition hover:border-sky-500/70 hover:bg-[#142033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#34465f] bg-[#0b111d] text-sky-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-white">{task.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-400">{task.description}</span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sky-300">
                      {task.label} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-9" aria-labelledby="registers-heading">
          <div className="mb-3">
            <h2 id="registers-heading" className="text-lg font-bold text-white">Browse equipment registers</h2>
            <p className="mt-1 text-sm text-slate-400">Choose a register if you already know which equipment you need.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {registers.map((register) => {
              const Icon = register.icon;
              return (
                <Link key={register.code} href={register.href} className="group rounded-xl border border-[#26354a] bg-[#101827] p-4 transition hover:border-sky-500/60 hover:bg-[#131e30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#0b111d] text-slate-300 group-hover:text-sky-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-extrabold tracking-wider text-sky-300">{register.code}</span>
                      <span className="mt-0.5 block font-bold text-white">{register.name}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-sky-300" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-400">{register.detail}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Link href="/planning" className="flex items-center gap-3 rounded-xl border border-[#26354a] bg-[#0d1522] p-4 hover:border-sky-500/50">
            <ClipboardList className="h-5 w-5 shrink-0 text-slate-300" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">Maintenance planning</span>
              <span className="block text-sm text-slate-400">Coordinate upcoming maintenance work.</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </Link>
          <Link href="/reliability" className="flex items-center gap-3 rounded-xl border border-[#26354a] bg-[#0d1522] p-4 hover:border-sky-500/50">
            <CircleHelp className="h-5 w-5 shrink-0 text-slate-300" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">Reliability &amp; equipment history</span>
              <span className="block text-sm text-slate-400">Explore saved events and component records.</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </Link>
        </section>

        <footer className="mt-8 border-t border-[#1f2b3e] pt-4 text-xs leading-5 text-slate-500">
          Records reflect information entered into the system. If a date, serial number or life reading is missing, confirm it with the maintenance record before making a decision.
        </footer>
      </div>
    </main>
  );
}
