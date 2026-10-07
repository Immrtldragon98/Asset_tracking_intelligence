"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Gauge, Wrench, Factory, Package, History, Users, LogIn, LogOut, ClipboardPaste, Database, BrainCircuit, ChevronDown, ChevronRight, FileText, Menu, X, Settings2, ServerCog, CalendarDays, Cpu, Zap, Cog } from "lucide-react";
import { AuthUser, clearSession, getUser, isAdmin } from "@/lib/auth";

export default function Sidebar(){
 const pathname=usePathname(); const router=useRouter(); const [user,setUser]=useState<AuthUser|null>(null); const [manageOpen,setManageOpen]=useState(false); const [mobileOpen,setMobileOpen]=useState(false);
 useEffect(()=>{const sync=()=>setUser(getUser());sync();window.addEventListener("dsr-auth-change",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("dsr-auth-change",sync);window.removeEventListener("storage",sync)}},[]);
 useEffect(()=>{setMobileOpen(false);if(["/entry-guides","/reports","/import-report","/historical-import","/users","/planning","/system-status"].includes(pathname))setManageOpen(true)},[pathname]);
 const primary=[{name:"Home",href:"/dashboard",icon:Home}];
 const dsir=[{name:"Running Stand",href:"/running-stands",icon:Gauge},{name:"Stand Area",href:"/stand-area",icon:Factory},{name:"Stand Change",href:"/operations",icon:Wrench},{name:"Entry Guide Change",href:"/entry-guides",icon:Settings2},{name:"Spare Life",href:"/inventory",icon:Package},{name:"Maintenance Data",href:"/pm-schedule",icon:CalendarDays},{name:"AI / Intelligence",href:"/intelligence",icon:BrainCircuit},{name:"Alerts",href:"/alerts",icon:Zap},{name:"History",href:"/activity",icon:History},{name:"Export History",href:"/reports",icon:FileText} ,{name:"Import Report",href:"/import-report",icon:ClipboardPaste},{name:"Historical Data",href:"/historical-import",icon:Database}];
 const rmir=[{name:"Running Stand",href:"/rmir",icon:Gauge},{name:"Stand Area",href:"/rmir/stand-area",icon:Factory},{name:"Stand Change",href:"/rmir/stand-change",icon:Wrench},{name:"Entry Guide Change",href:"/rmir/entry-guide-change",icon:Settings2},{name:"Spare Life",href:"/rmir/spare-life",icon:Package},{name:"Maintenance Data",href:"/rmir/maintenance",icon:CalendarDays},{name:"AI / Intelligence",href:"/rmir/intelligence",icon:BrainCircuit},{name:"History",href:"/rmir/history",icon:History}];
 const mir=[{name:"Running Status",href:"/mir",icon:Gauge},{name:"Issues",href:"/mir/issues",icon:Zap},{name:"Maintenance Data",href:"/mir/maintenance",icon:CalendarDays},{name:"AI / Intelligence",href:"/mir/intelligence",icon:BrainCircuit},{name:"History",href:"/mir/history",icon:History}];
 const dir=[{name:"Running Status",href:"/dir",icon:Gauge},{name:"Alerts",href:"/dir/alerts",icon:Zap},{name:"Maintenance Data",href:"/dir/maintenance",icon:CalendarDays},{name:"History",href:"/dir/history",icon:History}];
 const ssir=[{name:"Running Status",href:"/ssir",icon:Gauge},{name:"Alerts",href:"/ssir/alerts",icon:Zap},{name:"Maintenance Data",href:"/ssir/maintenance",icon:CalendarDays},{name:"AI / Intelligence",href:"/ssir/intelligence",icon:BrainCircuit},{name:"History",href:"/ssir/history",icon:History}];
 const module=pathname.startsWith("/rmir")?"RMIR":pathname.startsWith("/mir")?"MIR":pathname.startsWith("/dir")?"DIR":pathname.startsWith("/ssir")?"SSIR":"DSIR";
 const groups:any=module==="DSIR"?[
  {name:"Overview",items:[{name:"Stand Overview",href:"/stand-area",icon:Factory},{name:"Running Stands",href:"/running-stands",icon:Gauge},{name:"Alerts",href:"/alerts",icon:Zap}]},
  {name:"Operations",items:[{name:"Stand Change",href:"/operations",icon:Wrench},{name:"Entry Guide Change",href:"/entry-guides",icon:Settings2}]},
  {name:"Maintenance",items:[{name:"Maintenance Data",href:"/pm-schedule",icon:CalendarDays},{name:"Spare Life",href:"/inventory",icon:Package}]},
  {name:"Intelligence",items:[{name:"AI / Intelligence",href:"/intelligence",icon:BrainCircuit},{name:"Investigation",href:"/investigation",icon:Zap}]},
  {name:"History",items:[{name:"Activity History",href:"/activity",icon:History},{name:"Export History",href:"/reports",icon:FileText},{name:"Import Report",href:"/import-report",icon:ClipboardPaste},{name:"Historical Data",href:"/historical-import",icon:Database}]}
 ]:module==="RMIR"?[
  {name:"Overview",items:[{name:"Running Stands",href:"/rmir",icon:Gauge},{name:"Stand Area",href:"/rmir/stand-area",icon:Factory}]},
  {name:"Operations",items:[{name:"Stand Change",href:"/rmir/stand-change",icon:Wrench},{name:"Entry Guide Change",href:"/rmir/entry-guide-change",icon:Settings2}]},
  {name:"Maintenance",items:[{name:"Maintenance Data",href:"/rmir/maintenance",icon:CalendarDays},{name:"Spare Life",href:"/rmir/spare-life",icon:Package}]},
  {name:"Intelligence",items:[{name:"AI / Intelligence",href:"/rmir/intelligence",icon:BrainCircuit}]},
  {name:"History",items:[{name:"History",href:"/rmir/history",icon:History}]}
 ]:module==="MIR"?[
  {name:"Overview",items:[{name:"Running Status",href:"/mir",icon:Gauge}]},
  {name:"Issues",items:[{name:"Vibration / Temperature / Torque",href:"/mir/issues",icon:Zap}]},
  {name:"Maintenance",items:[{name:"Maintenance Data",href:"/mir/maintenance",icon:CalendarDays}]},
  {name:"Intelligence",items:[{name:"AI / Intelligence",href:"/mir/intelligence",icon:BrainCircuit}]},
  {name:"History",items:[{name:"History",href:"/mir/history",icon:History}]}
 ]:module==="DIR"?[
  {name:"Overview",items:[{name:"Running Status",href:"/dir",icon:Gauge}]},
  {name:"Alerts",items:[{name:"Alerts",href:"/dir/alerts",icon:Zap}]},
  {name:"Maintenance",items:[{name:"Maintenance Data",href:"/dir/maintenance",icon:CalendarDays}]},
  {name:"History",items:[{name:"History",href:"/dir/history",icon:History}]}
 ]:[
  {name:"Overview",items:[{name:"Running Status",href:"/ssir",icon:Gauge}]},
  {name:"Alerts",items:[{name:"Alerts",href:"/ssir/alerts",icon:Zap}]},
  {name:"Maintenance",items:[{name:"Maintenance Data",href:"/ssir/maintenance",icon:CalendarDays}]},
  {name:"Intelligence",items:[{name:"AI / Intelligence",href:"/ssir/intelligence",icon:BrainCircuit}]},
  {name:"History",items:[{name:"History",href:"/ssir/history",icon:History}]}
 ];
 const moduleLabel=module==="RMIR"?"Roughing Mill":module==="MIR"?"Motors":module==="DIR"?"Drives":module==="SSIR"?"Screw Shafts":"Finishing Mill";
 const [open,setOpen]=useState<string|null>(null);
 const active=(href:string)=>pathname===href||(href==="/intelligence"&&pathname==="/investigation");
 const logout=()=>{clearSession();setUser(null);router.push("/dashboard")};
 const panel=<><div><div className="brand-lockup"><div className="brand-mark"><span/></div><div><div className="brand-title">Asset Tracking Intelligence</div><div className="brand-subtitle">Plant-wide maintenance</div></div></div><div className="nav-panel">
  <div className="nav-panel-head"><div className="nav-label">{module} · {moduleLabel}</div><div className="nav-panel-hint">Select a workspace</div></div>
  <div className="nav-groups">{groups.map((g:any)=><div key={g.name} className="nav-group"><button className="nav-group-btn" onClick={()=>setOpen(open===g.name?null:g.name)}><span>{g.name}</span><ChevronDown className={`w-4 h-4 transition ${open===g.name?"rotate-180":""}`}/></button>{open===g.name&&<div className="nav-dropdown">{g.items.map((i:any)=>{const I=i.icon;return <Link key={i.href} href={i.href} className={`nav-dropdown-item ${active(i.href)?"nav-dropdown-active":""}`}><I className="w-4 h-4"/><span>{i.name}</span></Link>})}</div>}</div>)}</div>
 </div></div><div className="sidebar-account">{user?<button onClick={logout} className="account-action"><LogOut className="w-4 h-4"/>Sign out</button>:<Link href="/login" className="account-action text-sky-300"><LogIn className="w-4 h-4"/>Sign in</Link>}</div></> ;
 return <><header className="app-topnav"><div className="app-topnav-inner"><Link href="/dashboard" className="app-brand"><div className="brand-mark"><span/></div><div><div className="brand-title">Asset Tracking Intelligence</div><div className="brand-subtitle">Plant-wide maintenance</div></div></Link><div className="desktop-module"><ModulePicker/></div><Link href="/dashboard" className="home-nav"><Home className="w-4 h-4"/>Platform</Link><div className="desktop-groups"><GroupNav/></div><div className="nav-account">{user?<button onClick={logout} className="account-action"><LogOut className="w-4 h-4"/>Sign out</button>:<Link href="/login" className="account-action"><LogIn className="w-4 h-4"/>Sign in</Link>}</div><button className="mobile-menu-btn" onClick={()=>setMobile(true)}><Menu className="w-5 h-5"/></button></div></header>{mobile&&<div className="mobile-nav-overlay" onClick={()=>setMobile(false)}><aside className="mobile-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><b>Navigation</b><button onClick={()=>setMobile(false)} className="drawer-close"><X className="w-5 h-5"/></button></div><ModulePicker mobileMode/><Link href="/dashboard" onClick={()=>setMobile(false)} className="mobile-platform-link"><Home className="w-4 h-4"/>Platform Home</Link><GroupNav mobileMode/><div className="drawer-account">{user?<button onClick={logout} className="account-action"><LogOut className="w-4 h-4"/>Sign out</button>:<Link href="/login" onClick={()=>setMobile(false)} className="account-action"><LogIn className="w-4 h-4"/>Sign in</Link>}</div></aside></div>}</>; 
}