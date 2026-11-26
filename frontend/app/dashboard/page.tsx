"use client";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import FinishingMillStatus from "@/components/register/FinishingMillStatus";
import { useWorkspaceQuery } from "@/hooks/useWorkspaceQuery";
import { useWorkspaceResource } from "@/hooks/useWorkspaceResource";
import { conditionFlags, normalizeLine, PlantLine } from "@/lib/equipment";
import { MODULES } from "@/lib/navigation";

function EngineerDashboard() {
  const { params, update } = useWorkspaceQuery();
  const line = params.get("line") || "";
  const lines = useWorkspaceResource<PlantLine[]>("/dashboard/");
  const stands = useWorkspaceResource<{ id:number; current_status:string }[]>("/stands/");
  const maintenance = useWorkspaceResource<{ schedules: { id:number;title:string;status:string;start_at:string;line_name?:string;assigned_to?:string }[] }>("/maintenance-schedules?module=ALL");
  const visibleLines = lines.data?.filter(row => !line || row.name === line);
  const positions = visibleLines?.flatMap(row => row.positions.map(position => ({ line: row.name, position })));
  const flagged = positions?.filter(row => row.position.current_stand && conditionFlags(row.position.current_stand).length);
  const missingDates = positions?.filter(row => row.position.current_stand && !row.position.current_stand.installed_at);
  const installed = positions?.filter(row => row.position.current_stand).length;
  const ready = stands.data?.filter(row => row.current_status === "READY").length;
  const jobs = maintenance.data?.schedules.filter(row => !["COMPLETED","CANCELLED"].includes(row.status) && (!line || (row.line_name && normalizeLine(row.line_name) === normalizeLine(line)))) || [];
  const nextJobs = [...jobs].sort((a,b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()).slice(0,5);
  const refresh = () => { void lines.reload(); void stands.reload(); void maintenance.reload(); };
  return <main className="enterprise-page">
    <header className="enterprise-heading"><div><div className="dsr-kicker">Maintenance engineer workspace</div><h1>Shift equipment overview</h1><p>Inspect the current lineup, recorded condition flags, spare readiness and next maintenance work.</p></div><div className="flex flex-wrap gap-2"><Link href="/equipment" className="dsr-btn-primary">Find equipment<ArrowRight size={15}/></Link><button className="dsr-btn" onClick={refresh}><RefreshCw size={15}/>Refresh summaries</button></div></header>
    <div className="workspace-toolbar"><label><span>Physical location</span><select className="input-class" value={line} onChange={e => update({ line:e.target.value })}><option value="">Whole plant · all recorded lines</option>{lines.data?.map(row => <option key={row.id} value={row.name}>{row.name}</option>)}</select></label><p className="workspace-method-note">Line filters follow recorded locations. Ready spares remain a shared pool.</p></div>
    <section className="engineer-kpi-ribbon" aria-label="Shift summary">
      <Metric label="Installed stands" value={installed} note={lines.error ? "Line records unavailable" : "Recorded lineup; operating state separate"} href={"/equipment" + (line ? "?line="+encodeURIComponent(line) : "")}/>
      <Metric label="Condition flags" value={flagged?.length} note="Leakage, vibration or abnormal sound" href="#condition-attention"/>
      <Metric label="Ready spare stands" value={ready} note={stands.error ? "Readiness records unavailable" : "Shared Finishing Mill preparation pool"} href="/stand-area?status=READY"/>
      <Metric label="Open maintenance work" value={maintenance.data ? jobs.length : undefined} note={maintenance.error ? "Schedule unavailable" : "Planned, approved, active or deferred"} href="/maintenance"/>
    </section>
    {lines.error && <p role="alert" className="workspace-notice">Line summary: {lines.error}</p>}
    {stands.error && <p role="alert" className="workspace-notice">Spare readiness: {stands.error}<button className="dsr-btn" onClick={() => void stands.reload()}>Retry readiness</button></p>}
    <div className="engineer-bento">
      <section className="engineer-line-overview"><FinishingMillStatus compact lineName={line}/></section>
      <div className="engineer-attention-column">
        <section id="condition-attention" className="workspace-panel">
          <header><h2>Needs attention</h2><small>Recorded condition and data gaps</small></header>
          {lines.loading && !lines.data && <p role="status" className="workspace-empty">Loading condition records…</p>}
          {flagged?.slice(0,6).map(row => { const stand = row.position.current_stand!; return <Link key={row.position.id} href={"/equipment?line="+encodeURIComponent(row.line)+"&stand="+stand.id} className="attention-record"><b>{row.line} · P{row.position.position_number} · {stand.code}</b><span>{conditionFlags(stand).join(" · ")}</span></Link>; })}
          {missingDates?.slice(0,3).map(row => <Link key={"date-"+row.position.id} href={"/equipment?stand="+row.position.current_stand!.id} className="attention-record"><b>{row.position.current_stand!.code} · installation date missing</b><span>{row.line} · P{row.position.position_number}</span></Link>)}
          {lines.data && !flagged?.length && !missingDates?.length && <p className="workspace-empty">No condition flags or missing installation dates in these records. This does not replace a physical inspection.</p>}
        </section>
        <section className="workspace-panel">
          <header><h2>Next maintenance work</h2><Link href="/maintenance">Open workspace →</Link></header>
          {maintenance.loading && !maintenance.data && <p className="workspace-empty" role="status">Loading scheduled work…</p>}
          {maintenance.error && <p role="alert" className="workspace-notice">{maintenance.error}<button className="dsr-btn" onClick={() => void maintenance.reload()}>Retry work</button></p>}
          {nextJobs.map(job => <Link key={job.id} href={"/maintenance?job="+job.id} className="attention-record"><b>{job.title}</b><span>{job.start_at ? new Date(job.start_at).toLocaleString("en-IN") : "Time not recorded"} · {job.line_name || "Area not specified"}</span><small>{job.status.replaceAll("_"," ")} · {job.assigned_to || "Owner not assigned"}</small></Link>)}
          {maintenance.data && !jobs.length && <p className="workspace-empty">No open maintenance work for this location.</p>}
        </section>
        <section className="workspace-panel engineer-actions"><header><h2>Record work</h2></header><Link href="/operations">Stand change<ArrowRight size={15}/></Link><Link href="/stand-area">Stand preparation<ArrowRight size={15}/></Link><Link href="/maintenance?new=1">Plan maintenance<ArrowRight size={15}/></Link></section>
      </div>
    </div>
    <section className="workspace-panel register-shortcuts"><header><h2>Equipment register views</h2><small>Alternate views over equipment records</small></header><div>{MODULES.filter(item=>item.code!=="PLANT").map(item=><Link key={item.code} href={item.href}><b>{item.code}</b><span>{item.label}</span><ArrowRight size={15}/></Link>)}</div></section>
  </main>;
}
function Metric({label,value,note,href}:{label:string;value:number|undefined;note:string;href:string}) { return <Link className="engineer-kpi" href={href}><span>{label}</span><strong>{value === undefined ? "—" : value}</strong><small>{note}</small></Link>; }
export default function DashboardPage(){return <Suspense fallback={<div className="dsr-empty">Opening shift overview…</div>}><EngineerDashboard/></Suspense>;}
