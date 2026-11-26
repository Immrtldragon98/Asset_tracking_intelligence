"use client";
import Link from "next/link";
import { useWorkspaceResource } from "@/hooks/useWorkspaceResource";
type Movement={id:number;item_name:string;quantity_before:number|null;quantity_change:number|null;quantity_after:number;transaction_type:string;operator:string;reason:string;created_at:string};
export default function TransactionsPage(){
 const records=useWorkspaceResource<Movement[]>("/inventory/transactions");
 return <main className="enterprise-page"><header className="enterprise-heading"><div><div className="dsr-kicker">Stock audit trail</div><h1>Inventory transaction history</h1><p>Opening counts and later movements remain separate, traceable records.</p></div><Link href="/inventory" className="dsr-btn">Back to spares</Link></header>
 {records.error&&<p role="alert" className="workspace-notice">{records.error}</p>}<button className="dsr-btn mb-4" onClick={()=>void records.reload()}>Refresh</button>
 <div className="dsr-table-wrap"><table className="dsr-table min-w-[900px]"><thead><tr>{["Date","Spare","Type","Before","Change","After","Recorded by","Reason"].map(label=><th key={label} className="dsr-th">{label}</th>)}</tr></thead><tbody>{records.data?.map(row=><tr key={row.id}><td className="dsr-td">{new Date(row.created_at).toLocaleString("en-IN")}</td><td className="dsr-td">{row.item_name}</td><td className="dsr-td">{row.transaction_type.replaceAll("_"," ")}</td><td className="dsr-td">{row.quantity_before??"Not recorded"}</td><td className="dsr-td">{row.quantity_change==null?"Initial count":row.quantity_change>0?"+"+row.quantity_change:row.quantity_change}</td><td className="dsr-td">{row.quantity_after}</td><td className="dsr-td">{row.operator}</td><td className="dsr-td">{row.reason}</td></tr>)}{!records.data?.length&&<tr><td colSpan={8} className="dsr-empty">{records.loading?"Loading stock history…":records.error?"History unavailable. Retry above.":"No stock transactions recorded yet."}</td></tr>}</tbody></table></div></main>;
}
