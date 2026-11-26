"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import Inspector from "@/components/workspace/Inspector";
import { useWorkspaceQuery } from "@/hooks/useWorkspaceQuery";
import { useWorkspaceResource } from "@/hooks/useWorkspaceResource";
import { useWorkspaceUser } from "@/hooks/useWorkspaceUser";

type Item={id:number;name:string;quantity:number|null;minimum_quantity:number;location:string;is_active:boolean;expected_life_hours?:number|null;observed_avg_life_hours?:number|null;reliability_pct?:number|null;availability_pct?:number|null;criticality?:string|null;used_at?:string|null};
type Form={name:string;used_at:string;quantity:string;minimum_quantity:string;expected_life_hours:string;observed_avg_life_hours:string;location:string};
const blank:Form={name:"",used_at:"",quantity:"",minimum_quantity:"0",expected_life_hours:"",observed_avg_life_hours:"",location:"Store"};
const hours=(value?:number|null)=>value == null ? "Not recorded" : value.toFixed(0)+" h";
const percent=(value?:number|null)=>value == null ? "—" : value.toFixed(0)+"%";
function InventoryWorkspace(){
  const {params,update}=useWorkspaceQuery(), {editable,user}=useWorkspaceUser();
  const records=useWorkspaceResource<Item[]>("/inventory/");
  const query=params.get("q")||"", sort=params.get("sort")||"AZ", id=Number(params.get("item")), adding=params.get("new")==="1";
  const selected=records.data?.find(item=>item.id===id);
  const [form,setForm]=useState<Form>(blank),[saving,setSaving]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const [quantity,setQuantity]=useState(""),[operator,setOperator]=useState(""),[reason,setReason]=useState("");
  useEffect(()=>{setError("");setForm(selected?{name:selected.name,used_at:selected.used_at||"",quantity:selected.quantity==null?"":String(selected.quantity),minimum_quantity:String(selected.minimum_quantity||0),expected_life_hours:selected.expected_life_hours?.toString()||"",observed_avg_life_hours:selected.observed_avg_life_hours?.toString()||"",location:selected.location||"Store"}:blank);setQuantity(selected?.quantity==null?"":String(selected.quantity));setOperator(user?.username||"");setReason("");},[id,adding,selected,user?.username]);
  const shown=(records.data||[]).filter(item=>[item.name,item.used_at,item.criticality,item.location].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="LOW_STOCK"?(a.quantity==null?Number.POSITIVE_INFINITY:a.quantity-a.minimum_quantity)-(b.quantity==null?Number.POSITIVE_INFINITY:b.quantity-b.minimum_quantity):sort==="CRITICAL"?criticalRank(a.criticality)-criticalRank(b.criticality)||a.name.localeCompare(b.name):a.name.localeCompare(b.name,undefined,{numeric:true}));
  const close=()=>update({item:null,new:null});
  const number=(value:string,integer=false)=>{const n=Number(value);if(!Number.isFinite(n)||n<0||(integer&&!Number.isInteger(n)))throw Error("Enter non-negative "+(integer?"whole numbers for quantities.":"numbers for service life."));return n;};
  async function save(event:React.FormEvent){
    event.preventDefault();if(!editable)return;
    setSaving(true);setError("");setNotice("");
    try{
      const payload={name:form.name.trim(),used_at:form.used_at.trim()||null,location:form.location.trim()||"Store",minimum_quantity:number(form.minimum_quantity,true),expected_life_hours:form.expected_life_hours===""?null:number(form.expected_life_hours),observed_avg_life_hours:form.observed_avg_life_hours===""?null:number(form.observed_avg_life_hours)};
      if(!payload.name)throw Error("Enter the spare name.");
      await fetchApi(selected?"/inventory/"+selected.id:"/inventory/",{method:selected?"PATCH":"POST",body:JSON.stringify(selected?payload:{...payload,quantity:form.quantity.trim()===""?null:number(form.quantity,true),remarks:null,reliability_pct:null,availability_pct:null,criticality:"UNASSESSED"})});
      setNotice("Spare details saved.");await records.reload();if(adding)close();
    }catch(e){setError(e instanceof Error?e.message:"Could not save spare details.");}finally{setSaving(false);}
  }
  async function saveQuantity(event:React.FormEvent){
    event.preventDefault();if(!editable||!selected)return;setSaving(true);setError("");setNotice("");
    try{if(!operator.trim()||!reason.trim())throw Error("Enter who updated the stock and a reason.");await fetchApi("/inventory/"+selected.id+"/set-quantity",{method:"POST",body:JSON.stringify({quantity:number(quantity,true),operator:operator.trim(),reason:reason.trim()})});await records.reload();setNotice("Stock movement saved to the transaction history.");}
    catch(e){setError(e instanceof Error?e.message:"Could not save stock movement.");}finally{setSaving(false);}
  }
  async function archive(){
    if(!selected||!editable||!window.confirm("Archive "+selected.name+" from the active spare list?"))return;
    setSaving(true);setError("");try{await fetchApi("/inventory/"+selected.id,{method:"DELETE"});await records.reload();close();}catch(e){setError(e instanceof Error?e.message:"Could not archive spare.");}finally{setSaving(false);}
  }
  return <main className="enterprise-page">
    <header className="enterprise-heading"><div><div className="dsr-kicker">Spares & service life</div><h1>Spare inventory</h1><p>Compare stock and service-life records. Open a spare in the inspector without losing the table.</p></div>{editable?<button className="dsr-btn-primary" onClick={()=>update({new:"1",item:null},true)}>Add spare</button>:<Link href="/login" className="dsr-btn">Sign in to record stock</Link>}</header>
    <section className="engineer-kpi-ribbon">
      <div className="engineer-kpi"><span>Active spare records</span><strong>{records.data?.length??"—"}</strong></div>
      <div className="engineer-kpi"><span>Known stock below requirement</span><strong>{records.data?.filter(item=>item.quantity!==null&&item.quantity<item.minimum_quantity).length??"—"}</strong></div>
      <div className="engineer-kpi"><span>Stock not recorded</span><strong>{records.data?.filter(item=>item.quantity==null).length??"—"}</strong></div>
      <div className="engineer-kpi"><span>High / critical</span><strong>{records.data?.filter(item=>["HIGH","CRITICAL"].includes(item.criticality||"")).length??"—"}</strong></div>
    </section>
    <div className="workspace-toolbar"><label className="workspace-search"><span>Search spares</span><input className="input-class" value={query} onChange={e=>update({q:e.target.value})} placeholder="Name, equipment, location or criticality"/></label><label><span>Sort</span><select className="input-class" value={sort} onChange={e=>update({sort:e.target.value})}><option value="AZ">Name A–Z</option><option value="CRITICAL">Critical first</option><option value="LOW_STOCK">Lowest stock coverage first</option></select></label><button className="dsr-btn" onClick={()=>void records.reload()}>Refresh</button></div>
    {records.error&&<p className="workspace-notice" role="alert">{records.error}</p>}
    <div className="dsr-table-wrap"><table className="dsr-table min-w-[950px]"><thead><tr>{["Spare","Used at","Stock / required","Availability","Expected life","Observed life","Reliability","Criticality"].map(label=><th key={label} className="dsr-th">{label}</th>)}</tr></thead><tbody>{shown.map(item=><tr key={item.id} className={selected?.id===item.id?"workspace-selected-row":""}><td className="dsr-td"><button className="workspace-record-link" onClick={()=>update({item:String(item.id),new:null},true)}>{item.name}</button></td><td className="dsr-td">{item.used_at||"—"}</td><td className="dsr-td">{item.quantity??"Not recorded"} / {item.minimum_quantity}</td><td className="dsr-td">{percent(item.availability_pct)}</td><td className="dsr-td">{hours(item.expected_life_hours)}</td><td className="dsr-td">{hours(item.observed_avg_life_hours)}</td><td className="dsr-td">{percent(item.reliability_pct)}</td><td className="dsr-td">{item.criticality||"UNASSESSED"}</td></tr>)}{!shown.length&&<tr><td className="dsr-empty" colSpan={8}>{records.loading?"Loading spare records…":records.error?"Records unavailable. Retry above.":"No matching spares."}</td></tr>}</tbody></table></div>
    {(adding||id>0)&&<Inspector title={adding?"Add spare":selected?.name||"Spare record"} onClose={close} busy={saving}>
      {error&&<p role="alert" className="workspace-notice">{error}</p>}{notice&&<p role="status" className="workspace-success">{notice}</p>}
      {id>0&&!selected?<p className="workspace-empty">{records.loading?"Loading spare…":"This spare is not in the loaded active inventory."}</p>:<>
        <form onSubmit={save} className="workspace-form"><fieldset disabled={!editable||saving}><legend>Spare details</legend>
          {(["name","used_at","location","minimum_quantity","expected_life_hours","observed_avg_life_hours"] as const).map(key=><label key={key}><span>{{name:"Spare name",used_at:"Used at",location:"Store location",minimum_quantity:"Required quantity",expected_life_hours:"Expected service life (h)",observed_avg_life_hours:"Observed average service life (h)"}[key]}</span><input className="input-class" required={key==="name"} type={["minimum_quantity","expected_life_hours","observed_avg_life_hours"].includes(key)?"number":"text"} min="0" step={key==="minimum_quantity"?"1":"any"} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
          {adding&&<label>Initial stock quantity<input className="input-class" type="number" min="0" step="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></label>}
          {editable&&<button className="dsr-btn-primary" disabled={saving}>{saving?"Saving…":"Save spare details"}</button>}
        </fieldset></form>
        {selected&&<section className="workspace-form"><h3>Stock movement</h3><p className="workspace-method-note">Current stock: {selected.quantity??"Not recorded"}. Changes create a separate inventory transaction. An unrecorded balance first requires a verified opening count.</p>{editable?<form onSubmit={saveQuantity}><fieldset disabled={saving}><label>New store quantity<input className="input-class" required type="number" min="0" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label><label>Updated by<input className="input-class" required value={operator} onChange={e=>setOperator(e.target.value)}/></label><label>Reason<input className="input-class" required value={reason} onChange={e=>setReason(e.target.value)}/></label><button className="dsr-btn-primary" disabled={saving}>{saving?"Saving…":"Confirm stock movement"}</button></fieldset></form>:<p className="workspace-method-note">Viewer mode · Sign in to record a stock movement.</p>}<Link className="dsr-btn" href="/transactions">View stock transaction history</Link>{editable&&<button type="button" disabled={saving} className="dsr-btn text-red-300" onClick={()=>void archive()}>Archive spare</button>}</section>}
      </>}
    </Inspector>}
  </main>;
}
function criticalRank(value?:string|null){return ({CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3} as Record<string,number>)[value||""]??4;}
export default function InventoryPage(){return <Suspense fallback={<div className="dsr-empty">Opening spare inventory…</div>}><InventoryWorkspace/></Suspense>;}
