"use client";
import { useRouter } from "next/navigation";
export default function LineStatusGrid({lines}:{lines:any[]}) {
  const router = useRouter();
  if (!lines.length) return <p className="workspace-empty">No line installations recorded.</p>;
  const date = (value: string | null) => value ? new Date(value).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"2-digit" }) : "Not recorded";
  const age = (value: unknown) => value == null || !Number.isFinite(Number(value)) ? "Not recorded" : Math.floor(Number(value)/24) + "d " + Math.floor(Number(value)%24) + "h";
  return <div className="grid gap-4">{lines.map(line => <section key={line.id} className="mechanical-panel overflow-hidden">
    <header className="dsr-panel-head"><div><h3 className="font-bold text-white">{line.name}</h3><small className="text-slate-400">Installed lineup</small></div><span className="dsr-chip">{line.positions?.filter((p:any)=>p.current_stand).length || 0}/{line.positions?.length || 0} installed</span></header>
    <div className="fmir-line-positions">{line.positions?.map((position:any) => {
      const stand = position.current_stand;
      const flags = stand ? [stand.leakage ? "LEAK" : "", stand.vibration ? "VIB" : "", stand.abnormal_sound ? "SOUND" : ""].filter(Boolean) : [];
      return <button key={position.id} disabled={!stand} type="button" onClick={() => router.push("/equipment?line="+encodeURIComponent(line.name)+"&stand="+stand.id)} className={"line-equipment-tile " + (flags.length ? "line-equipment-attention" : "")} aria-label={line.name+" position "+position.position_number+", stand "+(stand?.code || "empty")}>
        <span className="text-xs text-slate-400">P{position.position_number}</span><strong>{stand?.code || "Empty"}</strong>
        <span>{stand ? "Installed" : "No stand installed"}</span><small>Installed: {stand ? date(stand.installed_at) : "—"}</small><small>Calendar age: {stand ? age(stand.campaign_hours) : "—"}</small>
        {flags.length > 0 && <span className="text-amber-300">{flags.join(" · ")}</span>}
      </button>;
    })}</div>
  </section>)}</div>;
}
