"use client";

import Link from "next/link";
import { Factory, Cog, Cpu, Zap, Wrench, ArrowRight } from "lucide-react";

const registers = [
  { code: "DSIR", title: "Digital Stand Intelligent Register", subtitle: "Finishing Mill · Stand Register", href: "/dsir", icon: Factory, state: "OPEN REGISTER" },
  { code: "RMIR", title: "Roughing Mill Intelligent Register", subtitle: "Roughing Mill · 5 Stands", href: "/rmir", icon: Cog, state: "OPEN REGISTER" },
  { code: "MIR", title: "Motor Intelligent Register", subtitle: "Motor register planned", href: "/mir", icon: Cpu, state: "REGISTER PLANNED" },
  { code: "DIR", title: "Drive Intelligent Register", subtitle: "Equipment mapping pending", href: "/dir", icon: Zap, state: "MAPPING PENDING" },
  { code: "SSIR", title: "Screw Shaft Intelligent Register", subtitle: "Screw-shaft register planned", href: "/ssir", icon: Wrench, state: "REGISTER PLANNED" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-[#080D16]">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.22em] text-slate-500 font-bold">Plant Maintenance Platform</div>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-white">Asset Tracking Intelligence</h1>
          <p className="mt-3 text-sm md:text-base text-slate-400">Select an intelligent register to enter its dedicated plant system.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {registers.map((register) => {
            const Icon = register.icon;
            const ready = register.state === "OPEN REGISTER";
            return (
              <Link key={register.code} href={register.href} className="group min-h-[190px] rounded-xl border border-[#26354a] bg-[#101827] p-5 flex flex-col justify-between hover:border-[#4EA1FF]/70 hover:bg-[#131e30] transition">
                <div>
                  <div className="w-11 h-11 rounded-xl border border-[#33445b] bg-[#0b111d] grid place-items-center">
                    <Icon className="w-5 h-5 text-slate-300 group-hover:text-[#4EA1FF]" />
                  </div>
                  <div className="mt-5 text-xl font-bold text-white">{register.code}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-200">{register.title}</div>
                  <div className="mt-2 text-xs text-slate-500">{register.subtitle}</div>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className={ready ? "text-emerald-400 font-semibold" : "text-slate-500 font-semibold"}>{register.state}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-[#4EA1FF]" />
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 text-center text-[11px] text-slate-600">One shared asset identity and intelligence core · Five plant registers</div>
      </div>
    </main>
  );
}
