"use client";
import Link from "next/link";
import { Suspense, useMemo } from "react";
import { ArrowLeft, ChevronRight, Search, RefreshCw } from "lucide-react";
import StandDetails from "@/components/stand/StandDetails";
import { useWorkspaceQuery } from "@/hooks/useWorkspaceQuery";
import { useWorkspaceResource } from "@/hooks/useWorkspaceResource";
import { assetAncestors, assetLine, CatalogAsset, conditionFlags, PlantLine } from "@/lib/equipment";
import { displayModule, storageModule } from "@/lib/navigation";

function EquipmentWorkspace() {
  const { params, update } = useWorkspaceQuery();
  const lines = useWorkspaceResource<PlantLine[]>("/dashboard/");
  const catalog = useWorkspaceResource<{ assets: CatalogAsset[] }>("/assets/catalog");
  const line = params.get("line") || "", query = params.get("q") || "", register = params.get("register") || "ALL";
  const assetId = Number(params.get("asset")), standId = Number(params.get("stand")), tab = params.get("tab") || "overview";
  const assets = catalog.data?.assets || [];
  const selectedAsset = assets.find(asset => asset.id === assetId);
  const selectedPlacement = lines.data?.flatMap(row => row.positions.map(position => ({ line: row.name, position }))).find(row => row.position.current_stand?.id === standId);
  const stand = useWorkspaceResource<any>(standId > 0 ? "/stands/" + standId : null);
  const code = selectedAsset?.asset_code || selectedPlacement?.position.current_stand?.code || stand.data?.code || "";
  const module = selectedAsset?.module_code || "DSIR";
  const history = useWorkspaceResource<{ events: any[] }>(tab === "history" && code ? "/reliability/events?module=" + storageModule(module) + "&limit=500" : null);
  const filteredHistory = (history.data?.events || []).filter(row => row.asset_code === code || row.stand_code === code);
  const ancestors = selectedAsset ? assetAncestors(selectedAsset, assets) : [];
  const children = selectedAsset ? assets.filter(asset => asset.parent_id === selectedAsset.id) : [];
  const placements = useMemo(() => (lines.data || []).flatMap(row => row.positions.map(position => ({ line: row.name, position }))).filter(row =>
    (!line || line === row.line) && (register === "ALL" || register === "FMIR") &&
    (!query || [row.line, String(row.position.position_number), row.position.current_stand?.code].join(" ").toLowerCase().includes(query.toLowerCase()))
  ), [lines.data, line, register, query]);
  const registered = assets.filter(asset => {
    const location = assetLine(asset, assets, lines.data || []);
    return (!line || (line === "__unassigned" ? !location : line === location)) &&
      (register === "ALL" || displayModule(asset.module_code) === register) &&
      (!query || [asset.asset_code, asset.name, asset.asset_type, asset.area, asset.location].join(" ").toLowerCase().includes(query.toLowerCase()));
  });
  const selected = standId > 0 || assetId > 0;
  const selectStand = (id: number, name: string) => update({ stand: String(id), asset: null, line: name, tab: null }, true);
  const selectAsset = (asset: CatalogAsset) => update({ asset: String(asset.id), stand: null, tab: null }, true);

  return <main className="enterprise-page">
    <header className="enterprise-heading"><div><div className="dsr-kicker">Plant → Line → Equipment</div><h1>Equipment explorer</h1><p>Find a physical position, then inspect its installed equipment and recorded relationships.</p></div><button className="dsr-btn" onClick={() => { void lines.reload(); void catalog.reload(); }}><RefreshCw size={15}/>Refresh</button></header>
    <div className="workspace-toolbar">
      <label><span>Line / location</span><select className="input-class" value={line} onChange={e => update({ line: e.target.value, stand: null, asset: null })}><option value="">Whole plant</option>{lines.data?.map(row => <option key={row.id} value={row.name}>{row.name}</option>)}<option value="__unassigned">Location not recorded</option></select></label>
      <label><span>Register view</span><select className="input-class" value={register} onChange={e => update({ register: e.target.value, stand: null, asset: null })}>{["ALL","FMIR","RMIR","MIR","DIR","SSIR"].map(code => <option key={code}>{code}</option>)}</select></label>
      <label className="workspace-search"><span>Search equipment</span><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500"/><input className="input-class !pl-9" value={query} onChange={e => update({ q: e.target.value })} placeholder="Tag, stand code, position or name"/></div></label>
    </div>
    {lines.error && <div className="workspace-notice" role="alert">Line records: {lines.error} <button className="dsr-btn" onClick={() => void lines.reload()}>Retry lines</button></div>}
    {catalog.error && <div className="workspace-notice" role="alert">Shared asset catalog: {catalog.error} <button className="dsr-btn" onClick={() => void catalog.reload()}>Retry catalog</button></div>}
    <div className={"workspace-master-detail " + (selected ? "workspace-has-selection" : "")}>
      <section className="workspace-master" aria-label="Equipment list">
        <header><h2>Positions & equipment</h2><small>{placements.length} positions · {registered.length} registry assets</small></header>
        {(lines.loading || catalog.loading) && <p role="status" className="workspace-empty">Loading available equipment records…</p>}
        <div className="equipment-list">
          {placements.map(row => { const current = row.position.current_stand; return <button type="button" key={"position-" + row.position.id} disabled={!current} aria-pressed={current?.id === standId} className="workspace-list-row" onClick={() => current && selectStand(current.id, row.line)}>
            <span className="equipment-position">P{row.position.position_number}</span><span><b>{current?.code || "Empty position"}</b><small>{row.line} · Finishing Mill</small></span><span className="equipment-row-state">{current && conditionFlags(current).length ? "Check" : current ? "Installed" : "Empty"}</span>
          </button>; })}
          {registered.length > 0 && <h3 className="workspace-list-label">Shared asset registry</h3>}
          {registered.map(asset => <button key={"asset-" + asset.id} type="button" className="workspace-list-row" aria-pressed={asset.id === assetId} onClick={() => selectAsset(asset)}>
            <span><b>{asset.asset_code}</b><small>{asset.name}</small><small>{assetLine(asset, assets, lines.data || []) || (lines.loading || lines.error ? "Line mapping unavailable" : "Location not recorded")} · {displayModule(asset.module_code)}</small></span><ChevronRight size={15}/>
          </button>)}
          {!lines.loading && !catalog.loading && !placements.length && !registered.length && <p className="workspace-empty">No matching records. Clear the filters or complete the asset location records.</p>}
        </div>
      </section>
      <section className="workspace-detail" aria-label="Equipment detail">
        {selected && <button type="button" className="workspace-detail-back dsr-btn" onClick={() => update({ stand: null, asset: null })}><ArrowLeft size={15}/>Back to equipment</button>}
        {!selected ? <div className="workspace-empty"><h2>Select equipment to inspect</h2><p>The list stays visible while you review identity, condition, components and history.</p></div> : <>
          <header className="equipment-detail-heading"><div><div className="dsr-kicker">{selectedPlacement?.line || (selectedAsset ? assetLine(selectedAsset, assets, lines.data || []) || "Location not recorded" : "Finishing Mill")}</div><h2>{code || "Loading equipment…"}</h2><p>{selectedAsset?.name || "Finishing Mill stand"}{selectedPlacement ? " · P" + selectedPlacement.position.position_number : ""}</p></div><span className="dsr-chip">{displayModule(module)}</span></header>
          <nav className="workspace-tabs" aria-label="Equipment details">{["overview","components","history"].map(value => <button type="button" key={value} aria-pressed={tab === value} onClick={() => update({ tab: value })}>{value.charAt(0).toUpperCase() + value.slice(1)}</button>)}</nav>
          <div className="equipment-detail-body">
            {tab === "overview" && <>
              {standId > 0 && <>{stand.loading && <p role="status">Loading stand history and components…</p>}{stand.error && <div role="alert" className="workspace-notice">{stand.error}<button className="dsr-btn" onClick={() => void stand.reload()}>Retry details</button></div>}{stand.data && <StandDetails stand={stand.data}/>}</>}
              {selectedAsset && <><dl className="equipment-facts">{Object.entries({ "Tag": selectedAsset.asset_code, "Type": selectedAsset.asset_type.replaceAll("_"," "), "Recorded status": selectedAsset.status, "Area": selectedAsset.area, "Location": selectedAsset.location, "Position": selectedAsset.position, "Manufacturer": selectedAsset.manufacturer, "Model": selectedAsset.model, "Installed": selectedAsset.installation_date, "Criticality": selectedAsset.criticality }).map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value || "Not recorded"}</dd></div>)}</dl>{selectedAsset.notes && <p className="whitespace-pre-wrap text-sm text-slate-300">{selectedAsset.notes}</p>}<p className="workspace-method-note">A registry status such as ACTIVE does not establish that this equipment is running.</p></>}
              {!selectedAsset && assetId > 0 && !catalog.loading && <p className="workspace-empty">This asset is not in the loaded registry. Check the link or retry the catalog.</p>}
            </>}
            {tab === "components" && (selectedAsset ? <><nav className="equipment-ancestors" aria-label="Assembly hierarchy">{ancestors.map(asset => <button className="dsr-btn" key={asset.id} onClick={() => selectAsset(asset)}>{asset.asset_code}<ChevronRight size={13}/></button>)}<b>{selectedAsset.asset_code}</b></nav><h3>Connected components</h3>{children.map(asset => <button key={asset.id} className="workspace-list-row" onClick={() => selectAsset(asset)}><span><b>{asset.asset_code}</b><small>{asset.name} · {asset.asset_type}</small></span><ChevronRight size={16}/></button>)}{!children.length && <p className="workspace-empty">No child components are recorded for this asset.</p>}</> : <><p className="workspace-method-note">Component preparation and assembly details remain in the original DSR record.</p>{stand.data && <StandDetails stand={stand.data}/>}</>)}
            {tab === "history" && <>{history.loading && <p role="status">Loading matching reliability records…</p>}{history.error && <p role="alert" className="workspace-notice">{history.error}</p>}<p className="workspace-method-note">Matching equipment-code records. Verify the line on entries with incomplete location; the most recent 500 module events are searched.</p>{filteredHistory.map(row => <article className="equipment-history-event" key={row.id}><b>{row.failure_mode || row.event_type}</b><small>{row.event_at || "Date not recorded"} · {row.line_name || "Line not recorded"}</small><p>{row.action_taken || row.symptoms || "No action note recorded"}</p></article>)}{!history.loading && !history.error && !filteredHistory.length && <p className="workspace-empty">No matching reliability events in the loaded records.</p>}<Link className="dsr-btn" href={"/reliability?module=" + storageModule(module)}>Open full reliability history</Link></>}
            <div className="equipment-detail-actions"><Link className="dsr-btn" href={"/maintenance?module=" + storageModule(module)}>Maintenance work</Link>{standId > 0 && <Link className="dsr-btn" href={"/operations" + (selectedPlacement ? "?position=" + selectedPlacement.position.id : "")}>Record stand change</Link>}</div>
          </div>
        </>}
      </section>
    </div>
  </main>;
}
export default function EquipmentPage() { return <Suspense fallback={<div className="dsr-empty">Opening equipment explorer…</div>}><EquipmentWorkspace/></Suspense>; }
