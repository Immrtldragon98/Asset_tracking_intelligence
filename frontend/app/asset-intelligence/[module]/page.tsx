"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { fetchApi } from "@/lib/api";
import { ArrowLeft, BrainCircuit, CircleAlert, Cog, Cpu, Factory, Gauge, Wrench, Zap } from "lucide-react";

const icons:any={DSIR:Factory,RMIR:Cog,MIR:Cpu,DIR:Zap,SSIR:Wrench};

export default function AssetModulePage(){
 const params=useParams<{module:string}>(); const code=(params.module||"").toUpperCase(); const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{fetchApi(`/assets/${code}`).then(setData).finally(()=>setLoading(false))},[code]);
 const Icon=icons[code]||Gauge; const assets=data?.assets||[];
 return <div className="flex-1 min-h-screen"><Header title={data?.module?.name||code}/><main className="dsr-main full-bleed"><Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-4"><ArrowLeft className="w-4 h-4"/>All registers</Link>
  <div className="flex items-start gap-3 mb-5"><div className="w-11 h-11 rounded-lg border border-[#33445b] bg-[#101827] grid place-items-center"><Icon className="w-5 h-5 text-slate-300"/></div><div><div className="dsr-kicker">{code}</div><h1 className="text-2xl font-bold text-white">{data?.module?.name||"Asset Register"}</h1><p className="text-sm text-slate-400 mt-1">{data?.module?.description}</p></div></div>
  {loading?<div className="mechanical-panel p-5 text-sm text-slate-400">Loading registered assets…</div>:assets.length===0?<div className="mechanical-panel p-5 flex items-center gap-3 text-sm text-slate-400"><CircleAlert className="w-5 h-5"/>This register is ready for asset commissioning. The common asset model is active; plant-specific assets have not been entered yet.</div>:<div className="dsr-table-wrap"><table className="dsr-table"><thead><tr><th className="dsr-th">Asset</th><th className="dsr-th">Type</th><th className="dsr-th">Position</th><th className="dsr-th">Parent</th><th className="dsr-th">Status</th><th className="dsr-th">Criticality</th><th className="dsr-th">Life h</th></tr></thead><tbody>{assets.map((a:any)=><tr key={a.id}><td className="dsr-td font-semibold text-white">{a.asset_code}<div className="text-[10px] text-slate-500">{a.name}</div></td><td className="dsr-td">{a.asset_type.replaceAll("_"," ")}</td><td className="dsr-td">{a.position||"—"}</td><td className="dsr-td">{assets.find((p:any)=>p.id===a.parent_id)?.asset_code||"—"}</td><td className="dsr-td"><span className="status-ok">{a.status}</span></td><td className="dsr-td">{a.criticality}</td><td className="dsr-td">{a.lifetime_hours}</td></tr>)}</tbody></table></div>}
  {code==="RMIR"&&<div className="mechanical-panel p-4 mt-4"><div className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-[#4EA1FF]"/><span className="font-semibold text-white text-sm">RMIR relationship model</span></div><p className="text-xs text-slate-400 mt-2">Each Roughing Mill stand is the parent of its gearbox, floating shaft, coupler, motor, drive and screw shaft. This relationship becomes the foundation for cross-asset failure investigation.</p></div>}
 </main></div>;
}
