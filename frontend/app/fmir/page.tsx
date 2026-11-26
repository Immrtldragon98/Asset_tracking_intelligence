import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FinishingMillStatus from "@/components/register/FinishingMillStatus";
import { groupsFor } from "@/lib/navigation";

export default function FMIRPage() {
  return <div className="dsr-page"><main className="dsr-main"><div className="full-bleed space-y-5">
    <header className="dsr-section-head">
      <div>
        <div className="dsr-kicker">Asset Tracking Intelligence / Finishing Mill</div>
        <h1 className="text-xl font-bold text-white md:text-2xl">FMIR · Finishing Mill Register</h1>
        <p className="dsr-subtitle">Your Digital Stand Register: stand preparation, changes, entry guides, maintenance, spare life and history.</p>
      </div>
      <Link href="/dashboard" className="dsr-btn">Plant overview</Link>
    </header>
    <FinishingMillStatus />
    <section aria-labelledby="fmir-workflows" className="space-y-3">
      <h2 id="fmir-workflows" className="dsr-title">Digital Stand Register workflows</h2>
      {groupsFor("FMIR").map(group => <section key={group.name} className="mechanical-panel overflow-hidden">
        <div className="dsr-panel-head"><h3 className="font-semibold text-white">{group.name}</h3></div>
        <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
          {group.items.filter(item => item.href !== "/fmir").map(item => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className="flex min-h-14 items-center gap-3 rounded-lg border border-[#2a3950] bg-[#101827] p-3 text-sm text-slate-200 hover:border-cyan-700 hover:bg-[#151F2E]">
              <Icon className="h-4 w-4 shrink-0 text-cyan-300" /><span className="flex-1">{item.name}</span><ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>;
          })}
        </div>
      </section>)}
    </section>
  </div></main></div>;
}
