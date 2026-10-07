"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, BrainCircuit, CalendarDays, CheckCircle2, Cog, Factory, Gauge, History, Package, RefreshCw, Settings2, Wrench, Zap } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Feature={name:string;href:string;description:string;icon:any};
const dsirFeatures:Feature[]=[
  {name:"Stand Area",href:"/stand-area",description:"Live stand preparation and readiness workflow.",icon:Factory},
  {name:"Stand Change",href:"/operations",description:"Stand movement, installation and change history.",icon:Wrench},
  {name:"PM Activities",href:"/pm-schedule",description:"Record and review maintenance activities.",icon:CalendarDays},
  {name:"Spare Life",href:"/inventory",description:"Components, stock and expected life.",icon:Package},
  {name:"History",href:"/activity",description:"Stand activity and historical records.",icon:History},
  {name:"Entry Guides",href:"/entry-guides",description:"Entry-guide installation and life tracking.",icon:Settings2},
  {name:"Reports",href:"/reports",description:"Reliability and maintenance reports.",icon:Gauge},
  {name:"Intelligence",href:"/intelligence",description:"Investigation and maintenance intelligence.",icon:BrainCircuit},
];

const moduleInfo:any={
  RMIR:{name:"Roughing Mill Intelligent Register",area:"Roughing Mill",icon:Cog},
  MIR:{name:"Motor Intelligent Register",area:"Plant-wide",icon:Gauge},
  DIR:{name:"Drive Intelligent Register",area:"Plant-wide",icon:Zap},
  SSIR:{name:"Screw Shaft Intelligent Register",area:"Plant-wide",icon:Wrench},
};

function fmtDate(value:any){if(!value)return "Date not entered";const d=new Date(value);return Number.isNaN(d.getTime())?"Date not entered":d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
function hours(value:any){return Number(value||0).toFixed(1);}

export default function RegisterHome({module}:{module:"DSIR"|"RMIR"|"MIR"|"DIR"|"SSIR"}){
  const [data,setData]=useState<any>(null); const [stands,setStands]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const load=async()=>{setLoading(true);setError("");try{if(module==="DSIR"){setStands(await fetchApi("/stands/"));}else{setData(await fetchApi("/assets/"+module));}}catch(e){setError(e instanceof Error?e.message:"Could not load register")}finally{setLoading(false)}};
  useEffect(()=>{load()},[module]);
  const info=module==="DSIR"?{name:"Digital Stand Intelligent Register",area:"Finishing Mill",icon:Factory}:moduleInfo[module];
  const Icon=info.icon;
  const runningDSIR=useMemo(()=>stands.filter(s=>s.current_location==="WRM_LINE"||s.current_status==="INSTALLED").sort((a,b)=>String(a.code).localeCompare(String(b.code),undefined,{numeric:true})),[stands]);
  const rmStands=useMemo(()=>module==="RMIR"?(data?.assets||[]).filter((a:any)=>a.asset_type==="stand").sort((a:any,b:any)=>String(a.position).localeCompare(String(b.position),undefined,{numeric:true})):[],[module,data]);
  const features=module==="DSIR"?dsirFeatures:[
    {name:"Running Status",href:"#running",description:"Live status of assets currently in this register.",icon:Activity},
    {name:"Asset Hierarchy",href:"#hierarchy",description:"Parent-child equipment relationships for this register.",icon:Cog},
    {name:"Asset Intelligence",href:"#intelligence",description:"Shared lifecycle, maintenance, life and reliability foundation.",icon:BrainCircuit},
  ];

  return <div className="flex-1 min-h-screen">
    <header className="hidden md:flex h-14 items-center justify-between border-b border-[#26354a] bg-[#0d1422]/95 px-5"><div><div className="text-[11px] text-slate-400">{info.area}</div><h1 className="text-base font-semibold text-white">{info.name}</h1></div><div className="text-xs text-slate-500">Asset Tracking Intelligence</div></header>
    <main className="dsr-main full-bleed">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
        <div><div className="dsr-kicker">{module} · {info.area}</div><div className="flex items-center gap-3 mt-1"><div className="w-11 h-11 rounded-lg border border-[#33445b] bg-[#101827] grid place-items-center"><Icon className="w-5 h-5 text-slate-300"/></div><div><h1 className="text-2xl md:text-3xl font-bold text-white">{info.name}</h1><p className="text-sm text-slate-400 mt-1">Register home · live status first · full register features below</p></div></div></div>
        <button onClick={load} className="dsr-btn self-start"><RefreshCw className="w-4 h-4"/>Refresh</button>
      </div>
      {error&&<div className="mb-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}
      {loading?<div className="mechanical-panel p-5 text-sm text-slate-400">Loading {module}…</div>:<>
        <section id="running" className="mb-5">
          <div className="dsr-panel-head rounded-t-lg"><div><div className="dsr-kicker">Live register home</div><div className="dsr-title">Running {module==="DSIR"?"stand":"equipment"} status</div><div className="dsr-subtitle">{module==="DSIR"?"Current finishing-mill stands with installation date and live running hours.":"Current register assets. Dates are shown when commissioned data has been entered."}</div></div><div className="text-xs text-slate-400">{module==="DSIR"?runningDSIR.length:module==="RMIR"?rmStands.length:(data?.assets?.length||0)} assets</div></div>
          {module==="DSIR"?<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 p-3 bg-[#0f1725] border border-t-0 border-[#253247] rounded-b-lg">
            {runningDSIR.length===0?<div className="col-span-full p-5 text-center text-sm text-slate-500">No stands are currently marked as running.</div>:runningDSIR.map(s=><Link key={s.id} href={"/stand-area?stand="+s.id} className="rounded-lg border border-[#2a3950] bg-[#111a2a] p-3 hover:border-emerald-600/60 transition"><div className="flex items-center justify-between"><span className="text-lg font-bold text-white">{s.code}</span><CheckCircle2 className="w-4 h-4 text-emerald-400"/></div><div className="text-xs text-emerald-300 mt-1">RUNNING</div><div className="mt-3 text-xs text-slate-400">Installed</div><div className="text-sm text-slate-200">{fmtDate(s.current_installed_at)}</div><div className="mt-2 text-xs text-slate-400">Running time</div><div className="text-sm font-semibold text-white">{hours(s.current_campaign_hours)} h</div>{(s.leakage||s.vibration||s.abnormal_sound)&&<div className="mt-2 text-[11px] text-amber-300">Condition flag active</div>}</Link>)}
          </div>:module==="RMIR"?<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 p-3 bg-[#0f1725] border border-t-0 border-[#253247] rounded-b-lg">
            {rmStands.map((s:any)=><div key={s.id} className="rounded-lg border border-[#2a3950] bg-[#111a2a] p-3"><div className="flex items-center justify-between"><span className="text-lg font-bold text-white">{s.asset_code}</span><span className="text-[10px] rounded-full border border-slate-700 px-2 py-1 text-slate-300">{s.status}</span></div><div className="text-xs text-slate-400 mt-2">Installation date</div><div className="text-sm text-slate-200">{fmtDate(s.installation_date)}</div><div className="text-xs text-slate-400 mt-2">Operating hours</div><div className="text-sm font-semibold text-white">{hours(s.operating_hours)} h</div></div>)}
          </div>:<div className="mechanical-panel p-5 text-sm text-slate-400">No {module} equipment has been commissioned yet. The register is ready to receive the plant equipment list without inventing asset dates or history.</div>}
        </section>
        <section id="hierarchy" className="mb-5"><div className="dsr-panel-head rounded-t-lg"><div><div className="dsr-kicker">Register navigation</div><div className="dsr-title">All {module} features</div><div className="dsr-subtitle">This is the register home; selecting a feature opens the existing workflow rather than a separate disconnected app.</div></div></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 p-3 bg-[#0f1725] border border-t-0 border-[#253247] rounded-b-lg">{features.map(f=>{const F=f.icon;return <Link key={f.href} href={f.href} className="group rounded-lg border border-[#2a3950] bg-[#111a2a] p-4 hover:border-[#4EA1FF]/60 hover:bg-[#151f30] transition"><div className="flex items-center justify-between"><div className="w-9 h-9 rounded-lg border border-[#33445b] bg-[#0b111d] grid place-items-center"><F className="w-4 h-4 text-slate-300"/></div><ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-[#4EA1FF]"/></div><div className="mt-3 text-sm font-semibold text-white">{f.name}</div><p className="mt-1 text-xs leading-5 text-slate-400">{f.description}</p></Link>})}</div></section>
        <section id="intelligence" className="mechanical-panel p-4"><div className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-[#4EA1FF]"/><div><div className="font-semibold text-white">Shared Asset Intelligence Core</div><div className="text-xs text-slate-400">Track · Dates · History · Life · Maintenance · Failure · Intelligence</div></div></div></section>
      </>}
    </main>
  </div>;
}
