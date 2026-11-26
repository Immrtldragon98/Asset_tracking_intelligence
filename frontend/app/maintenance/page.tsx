"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Inspector from "@/components/workspace/Inspector";
import { fetchApi } from "@/lib/api";
import { displayModule, storageModule } from "@/lib/navigation";
import { useWorkspaceQuery } from "@/hooks/useWorkspaceQuery";
import { useWorkspaceResource } from "@/hooks/useWorkspaceResource";
import { useWorkspaceUser } from "@/hooks/useWorkspaceUser";

type Schedule={id:number;title:string;module_code:string;schedule_type:string;line_name?:string;equipment?:string;start_at:string;end_at?:string;status:string;assigned_to?:string;impact?:string;work_scope?:string;remarks?:string};
const modules=["ALL","DSIR","RMIR","MIR","DIR","SSIR"];
const statuses=["PLANNED","APPROVED","IN_PROGRESS","COMPLETED","DEFERRED","CANCELLED"];
const empty={title:"",module_code:"ALL",schedule_type:"PM_OFFLINE",line_name:"",equipment:"",start_at:"",end_at:"",status:"PLANNED",assigned_to:"",impact:"",work_scope:"",remarks:""};
const when=(value?:string)=>value&&!Number.isNaN(new Date(value).getTime())?new Date(value).toLocaleString("en-IN"):"Not recorded";
function MaintenanceWorkspace(){
  const {params,update}=useWorkspaceQuery(),{editable}=useWorkspaceUser();
  const requested=storageModule(params.get("module")||"ALL"), module=modules.includes(requested)?requested:"ALL";
  const status=params.get("status")||"ALL", query=params.get("q")||"", id=Number(params.get("job")), adding=params.get("new")==="1";
  const records=useWorkspaceResource<{schedules:Schedule[]}>("/maintenance-schedules?module="+module);
  const [form,setForm]=useState({...empty}),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  useEffect(()=>{setForm({...empty,module_code:module,line_name:params.get("line")||""});setError("");},[adding,module]);
  const rows=records.data?.schedules||[];
  const selected=rows.find(row=>row.id===id);
  const shown=rows.filter(row=>(status==="ALL"||row.status===status)&&(!query||[row.title,row.line_name,row.equipment,row.assigned_to,row.work_scope,displayModule(row.module_code)].join(" ").toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>new Date(a.start_at).getTime()-new Date(b.start_at).getTime());
  const field=(key:keyof typeof empty,value:string)=>setForm(previous=>({...previous,[key]:value}));
  async function save(event:React.FormEvent){
    event.preventDefault();if(!editable)return;setError("");setNotice("");
    if(form.end_at&&new Date(form.end_at)<new Date(form.start_at)){setError("Expected finish must be at or after the start time.");return;}
    setBusy(true);
    try{await fetchApi("/maintenance-schedules",{method:"POST",body:JSON.stringify({...form,title:form.title.trim(),end_at:form.end_at||null,line_name:form.line_name||null,equipment:form.equipment||null,assigned_to:form.assigned_to||null,impact:form.impact||null,work_scope:form.work_scope||null,remarks:form.remarks||null})});await records.reload();update({new:null});setNotice("Maintenance plan saved.");}
    catch(e){setError(e instanceof Error?e.message:"Could not save maintenance plan.");}finally{setBusy(false);}
  }
  async function changeStatus(next:string){
    if(!selected||!editable)return;setBusy(true);setError("");setNotice("");
    try{await fetchApi("/maintenance-schedules/"+selected.id+"/status?status="+encodeURIComponent(next),{method:"PATCH"});await records.reload();setNotice("Work status saved as "+next.replaceAll("_"," ")+".");}
    catch(e){setError(e instanceof Error?e.message:"Could not update work status.");}finally{setBusy(false);}
  }
  async function remove(){
    if(!selected||!editable||!window.confirm("Delete this scheduled maintenance window?"))return;
    setBusy(true);setError("");try{await fetchApi("/maintenance-schedules/"+selected.id,{method:"DELETE"});await records.reload();update({job:null});setNotice("Maintenance window deleted.");}catch(e){setError(e instanceof Error?e.message:"Could not delete window.");}finally{setBusy(false);}
  }
  return <main className="enterprise-page">
    <header className="enterprise-heading"><div><div className="dsr-kicker">Maintenance work</div><h1>Plan & coordinate maintenance</h1><p>Select work to inspect scope, timing, ownership and equipment while retaining the job list.</p></div>{editable?<button className="dsr-btn-primary" onClick={()=>update({new:"1"},true)}>Plan maintenance</button>:<Link className="dsr-btn" href="/login">Sign in to record work</Link>}</header>
    <section className="engineer-kpi-ribbon">{[["Planned / approved",rows.filter(row=>["PLANNED","APPROVED"].includes(row.status)).length],["In progress",rows.filter(row=>row.status==="IN_PROGRESS").length],["Deferred",rows.filter(row=>row.status==="DEFERRED").length],["Completed",rows.filter(row=>row.status==="COMPLETED").length]].map(([label,count])=><div key={String(label)} className="engineer-kpi"><span>{label}</span><strong>{records.data?count:"—"}</strong></div>)}</section>
    <div className="workspace-toolbar"><label><span>Register</span><select className="input-class" value={module} onChange={e=>update({module:e.target.value,job:null})}>{modules.map(code=><option value={code} key={code}>{displayModule(code)}</option>)}</select></label><label><span>Work status</span><select className="input-class" value={status} onChange={e=>update({status:e.target.value})}>{["ALL",...statuses].map(value=><option key={value} value={value}>{value.replaceAll("_"," ")}</option>)}</select></label><label className="workspace-search"><span>Search work</span><input className="input-class" value={query} onChange={e=>update({q:e.target.value})} placeholder="Equipment, scope, owner or line"/></label><button className="dsr-btn" onClick={()=>void records.reload()}>Refresh</button></div>
    {(records.error||error)&&<p role="alert" className="workspace-notice">{error||records.error}</p>}{notice&&<p role="status" className="workspace-success">{notice}</p>}
    <div className={"workspace-master-detail "+(id>0?"workspace-has-selection":"")}>
      <section className="workspace-master" aria-label="Maintenance work list"><header><h2>Maintenance work</h2><small>{shown.length} matching windows · earliest start first</small></header>
        {shown.map(row=><button key={row.id} className="workspace-list-row" aria-pressed={row.id===id} onClick={()=>update({job:String(row.id)},true)}><span><b>{row.title}</b><small>{row.line_name||"Area not specified"} · {row.assigned_to||"Owner not assigned"}</small><small>{when(row.start_at)}</small><span className={"maintenance-status maintenance-status-"+row.status.toLowerCase()}>{row.status.replaceAll("_"," ")}</span></span></button>)}
        {!shown.length&&<p className="workspace-empty">{records.loading?"Loading maintenance work…":records.error?"Schedule unavailable. Retry above.":"No work matches these filters."}</p>}
      </section>
      <section className="workspace-detail" aria-label="Maintenance work details">
        {id>0&&<button className="workspace-detail-back dsr-btn" onClick={()=>update({job:null})}><ArrowLeft size={15}/>Back to work list</button>}
        {!selected?<div className="workspace-empty"><h2>{id>0?"Work not in the loaded register":"Select a maintenance window"}</h2><p>{id>0?"Change the register filter or retry the schedule.":"Review the equipment, time window, responsible team and work scope."}</p></div>:<>
          <header className="equipment-detail-heading"><div><div className="dsr-kicker">{displayModule(selected.module_code)} · {selected.schedule_type.replaceAll("_"," ")}</div><h2>{selected.title}</h2><p>{selected.line_name||"Area not specified"} · {selected.equipment||"Equipment not specified"}</p></div><span className="dsr-chip">{selected.status.replaceAll("_"," ")}</span></header>
          <div className="equipment-detail-body">
            <dl className="equipment-facts"><div><dt>Start</dt><dd>{when(selected.start_at)}</dd></div><div><dt>Expected finish</dt><dd>{when(selected.end_at)}</dd></div><div><dt>Responsible person / team</dt><dd>{selected.assigned_to||"Not assigned"}</dd></div></dl>
            {[["Work scope",selected.work_scope],["Production / safety impact",selected.impact],["Remarks",selected.remarks]].map(([label,value])=><section key={label} className="maintenance-detail-section"><h3>{label}</h3><p>{value||"Not recorded"}</p></section>)}
            <Link className="dsr-btn" href={"/equipment"+(selected.line_name?"?line="+encodeURIComponent(selected.line_name):"")}>Inspect equipment at this location</Link>
            {editable&&<div className="equipment-detail-actions">{selected.status!=="IN_PROGRESS"&&selected.status!=="COMPLETED"&&<button disabled={busy} className="dsr-btn" onClick={()=>void changeStatus("IN_PROGRESS")}>{busy?"Saving…":"Mark started"}</button>}{selected.status!=="COMPLETED"&&<button disabled={busy} className="dsr-btn-primary" onClick={()=>void changeStatus("COMPLETED")}>{busy?"Saving…":"Mark completed"}</button>}{selected.status!=="DEFERRED"&&<button disabled={busy} className="dsr-btn" onClick={()=>void changeStatus("DEFERRED")}>Defer</button>}<button disabled={busy} className="dsr-btn text-red-300" onClick={()=>void remove()}>Delete window</button></div>}
          </div>
        </>}
      </section>
    </div>
    {adding&&<Inspector title="Plan maintenance window" onClose={()=>update({new:null})} busy={busy}>
      {error&&<p className="workspace-notice" role="alert">{error}</p>}
      {editable?<form className="workspace-form" onSubmit={save}><fieldset disabled={busy}>
        <label>Work title<input className="input-class" required minLength={2} value={form.title} onChange={e=>field("title",e.target.value)}/></label>
        <label>Register<select className="input-class" value={form.module_code} onChange={e=>field("module_code",e.target.value)}>{modules.map(code=><option key={code} value={code}>{displayModule(code)}</option>)}</select></label>
        <label>Maintenance type<select className="input-class" value={form.schedule_type} onChange={e=>field("schedule_type",e.target.value)}>{["PM_OFFLINE","BELT_CHANGE","SHUTDOWN","INSPECTION","OVERHAUL","OTHER"].map(value=><option key={value} value={value}>{value.replaceAll("_"," ")}</option>)}</select></label>
        {(["line_name","equipment","assigned_to"] as const).map(key=><label key={key}>{{line_name:"Line / area",equipment:"Equipment / assets",assigned_to:"Responsible person / team"}[key]}<input className="input-class" value={form[key]} onChange={e=>field(key,e.target.value)}/></label>)}
        <label>Start date & time<input className="input-class" type="datetime-local" required value={form.start_at} onChange={e=>field("start_at",e.target.value)}/></label>
        <label>Expected finish<input className="input-class" type="datetime-local" value={form.end_at} onChange={e=>field("end_at",e.target.value)}/></label>
        <label>Initial status<select className="input-class" value={form.status} onChange={e=>field("status",e.target.value)}>{statuses.map(value=><option key={value}>{value}</option>)}</select></label>
        {(["work_scope","impact","remarks"] as const).map(key=><label key={key}>{{work_scope:"Work scope / job list",impact:"Expected production / safety impact",remarks:"Remarks"}[key]}<textarea className="input-class" rows={3} value={form[key]} onChange={e=>field(key,e.target.value)}/></label>)}
        <button className="dsr-btn-primary" disabled={busy}>{busy?"Saving…":"Save maintenance plan"}</button>
      </fieldset></form>:<p className="workspace-notice">Sign in as Admin or Operator to plan work.</p>}
    </Inspector>}
  </main>;
}
export default function MaintenancePage(){return <Suspense fallback={<div className="dsr-empty">Opening maintenance workspace…</div>}><MaintenanceWorkspace/></Suspense>;}
