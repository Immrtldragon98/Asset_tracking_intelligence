"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import StandDetails from "@/components/stand/StandDetails";
import ComponentPreparationModal from "@/components/stand/ComponentPreparationModal";
import { fetchApi } from "@/lib/api";
import { AuthUser, canEdit, getUser, isAdmin } from "@/lib/auth";

const ORDER = ["READY", "HYDROTEST", "GAUGING", "PENDING"];
const LABEL: Record<string, string> = {
  READY: "Ready",
  HYDROTEST: "Hydrotest",
  GAUGING: "Gauging",
  PENDING: "Pending",
};
const STYLE: Record<string, { row: string; label: string; card: string; button: string; dot: string }> = {
  READY: {
    row: "border-slate-800 border-l-2 border-l-emerald-600 bg-[#101827]",
    label: "text-emerald-300",
    card: "border-slate-700 bg-[#0B111D] hover:bg-[#151F2E]",
    button: "border-slate-600 text-emerald-200 hover:bg-[#151F2E]",
    dot: "bg-emerald-400",
  },
  HYDROTEST: {
    row: "border-slate-800 border-l-2 border-l-blue-600 bg-[#101827]",
    label: "text-blue-300",
    card: "border-slate-700 bg-[#0B111D] hover:bg-[#151F2E]",
    button: "border-slate-600 text-blue-200 hover:bg-[#151F2E]",
    dot: "bg-blue-400",
  },
  GAUGING: {
    row: "border-slate-800 border-l-2 border-l-violet-600 bg-[#101827]",
    label: "text-violet-300",
    card: "border-slate-700 bg-[#0B111D] hover:bg-[#151F2E]",
    button: "border-slate-600 text-violet-200 hover:bg-[#151F2E]",
    dot: "bg-violet-400",
  },
  PENDING: {
    row: "border-slate-800 border-l-2 border-l-amber-600 bg-[#101827]",
    label: "text-amber-300",
    card: "border-slate-700 bg-[#0B111D] hover:bg-[#151F2E]",
    button: "border-slate-600 text-amber-200 hover:bg-[#151F2E]",
    dot: "bg-amber-400",
  },
};

const NEXT: Record<string, string | undefined> = {
  GAUGING: "HYDROTEST",
  HYDROTEST: "READY",
};

type Stand = {
  id: number;
  code: string;
  current_status: string;
  lifetime_hours: number;
  current_installed_at: string | null;
  is_running: boolean;
};

export default function StandAreaPage() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [componentStand, setComponentStand] = useState<Stand | null>(null);
  const [transitionStand, setTransitionStand] = useState<Stand | null>(null);
  const [transitionBy, setTransitionBy] = useState("");
  const [transitionRemarks, setTransitionRemarks] = useState("");
  const [newStandOpen, setNewStandOpen] = useState(false);
  const [newStandCode, setNewStandCode] = useState("");
  const [newStandLife, setNewStandLife] = useState("0");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    HYDROTEST: true,
    GAUGING: true,
  });

  const load = async () => {
    try {
      setError("");
      setStands(await fetchApi("/stands/"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load stands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(getUser());
    load();
  }, []);

  const groups = useMemo(
    () =>
      Object.fromEntries(
        ORDER.map((status) => [
          status,
          stands
            .filter((x) => x.current_status === status)
            .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })),
        ])
      ),
    [stands]
  );

  const runningCount = stands.filter((x) => x.is_running).length;

  async function advance(stand: Stand) {
    if (!canEdit(user)) {
      setError("Sign in as Admin or Operator to update stand readiness.");
      return;
    }

    if (stand.current_status === "PENDING") {
      setComponentStand(stand);
      return;
    }

    const target = NEXT[stand.current_status];
    if (!target) return;

    setTransitionStand(stand);
    setTransitionBy(user?.username || "");
    setTransitionRemarks("");
  }

  async function addStand() {
    if (!isAdmin(user)) {
      setError("Admin access is required to add a new stand.");
      return;
    }

    setNewStandCode("");
    setNewStandLife("0");
    setNewStandOpen(true);
  }

  async function openStand(stand: Stand) {
    try {
      setSelected(await fetchApi(`/stands/${stand.id}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load stand");
    }
  }

  return (
    <div className="dsr-page">
      <Header title="Stand Area" />
      <main className="dsr-main">
        <div className="full-bleed space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Stand Preparation</h1>
              <p className="text-sm text-slate-300 mt-1">
                Pending → Gauging → Hydrotest → Ready
              </p>
              <p className="text-xs text-slate-500 mt-1">
                A stand enters Ready only after both Gauging and Hydrotest are completed.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 mr-auto sm:mr-0">
                <span className="text-[11px] uppercase tracking-wider text-slate-500">Running</span>
                <span className="text-lg font-bold text-emerald-300">{runningCount}</span>
              </div>
              {isAdmin(user) && (
                <button onClick={addStand} className="dsr-btn-primary">
                  + New Stand
                </button>
              )}
              <button onClick={load} className="dsr-btn">
                Refresh
              </button>
            </div>
          </div>

          <section className="mechanical-panel overflow-hidden">
            <div className="dsr-panel-head">
              <div>
                <div className="dsr-kicker">Clean preparation board</div>
                <div className="font-bold text-white">Current Stand Readiness</div>
                <p className="dsr-subtitle">
                  Old shift-report/sample entries are not used here. The board is driven only by the stand status in the database.
                </p>
              </div>
              <span className="dsr-chip">LIVE DATA</span>
            </div>
            <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {ORDER.map((status) => (
                <div key={status} className="rounded-lg border border-slate-800 bg-[#0b111d] p-3">
                  <div className={`text-xs font-bold ${STYLE[status].label}`}>{LABEL[status]}</div>
                  <div className="mt-1 text-2xl font-bold text-white">{groups[status]?.length || 0}</div>
                </div>
              ))}
            </div>
          </section>

          {!user && (
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-300">
              Viewer mode · Sign in to update stands.
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/25 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="dsr-empty">Loading stand preparation...</div>
          ) : (
            <div className="space-y-2">
              {ORDER.map((status) => {
                const style = STYLE[status];
                const count = groups[status].length;
                const isCollapsed = collapsed[status] ?? false;

                return (
                  <section key={status} className={`rounded-xl border ${style.row} overflow-hidden`}>
                    <button
                      onClick={() => setCollapsed((v) => ({ ...v, [status]: !isCollapsed }))}
                      className="w-full px-3 py-3 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">{isCollapsed ? "▶" : "▼"}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                        <span className={`text-sm font-bold ${style.label}`}>{LABEL[status]}</span>
                        <span className="rounded-full border border-slate-700/50 px-2 py-0.5 text-[10px] text-slate-300">
                          {count}
                        </span>
                      </div>
                      {count === 0 && <span className="text-xs text-slate-500">Empty stage</span>}
                    </button>

                    {!isCollapsed && (
                      <div className="border-t border-white/5 p-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2">
                          {groups[status].map((stand: Stand) => (
                            <div
                              key={stand.id}
                              className={`rounded-lg border ${style.card} p-2.5 min-w-0 transition-colors`}
                            >
                              <button onClick={() => openStand(stand)} className="w-full text-left">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-lg font-bold text-white truncate">{stand.code}</div>
                                  <span
                                    className={`text-[9px] font-bold ${
                                      stand.is_running ? "text-emerald-300" : "text-slate-500"
                                    }`}
                                  >
                                    {stand.is_running ? "RUNNING" : "NOT RUNNING"}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-300 mt-1">
                                  Life {Number(stand.lifetime_hours || 0).toFixed(0)} h
                                </div>
                              </button>

                              {canEdit(user) && status === "PENDING" && (
                                <button
                                  disabled={saving}
                                  onClick={() => advance(stand)}
                                  className={`mt-2 w-full min-h-[40px] rounded-md border px-2 py-1.5 text-xs font-medium ${style.button}`}
                                >
                                  Components → Gauging
                                </button>
                              )}

                              {canEdit(user) && status !== "PENDING" && NEXT[status] && (
                                <button
                                  disabled={saving}
                                  onClick={() => advance(stand)}
                                  className={`mt-2 w-full min-h-[40px] rounded-md border px-2 py-1.5 text-xs font-medium ${style.button}`}
                                >
                                  → {LABEL[NEXT[status]!]}
                                </button>
                              )}
                            </div>
                          ))}

                          {count === 0 && (
                            <div className="col-span-full rounded-lg border border-dashed border-slate-700/60 px-3 py-4 text-center text-sm text-slate-500">
                              No stands in this stage
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {transitionStand && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={() => setTransitionStand(null)}>
          <form className="w-full max-w-lg space-y-4 rounded-t-2xl border border-slate-700 bg-[#0d131b] p-5 sm:rounded-xl" onClick={(e) => e.stopPropagation()} onSubmit={async (e) => {
            e.preventDefault();
            if (!transitionBy.trim()) return;
            const target = NEXT[transitionStand.current_status];
            if (!target) return;
            setSaving(true); setError("");
            try {
              await fetchApi("/operations/stands/status", { method: "POST", body: JSON.stringify({ stand_code: transitionStand.code, status: target, updated_by: transitionBy.trim(), remarks: transitionRemarks.trim() || null }) });
              setTransitionStand(null); await load();
            } catch (e) { setError(e instanceof Error ? e.message : "Update failed"); }
            finally { setSaving(false); }
          }}>
            <div><div className="dsr-kicker">Update readiness</div><h2 className="text-lg font-bold text-white">{transitionStand.code}: {LABEL[NEXT[transitionStand.current_status] || ""] || "Next stage"}</h2><p className="mt-1 text-sm text-slate-300">Enter who completed this step. Add a note only if needed.</p></div>
            <label className="block text-sm text-slate-200">Completed by <input autoFocus required className="input-class mt-1" value={transitionBy} onChange={(e) => setTransitionBy(e.target.value)} placeholder="Operator / technician name" /></label>
            <label className="block text-sm text-slate-200">Remarks (optional) <textarea className="input-class mt-1" rows={3} value={transitionRemarks} onChange={(e) => setTransitionRemarks(e.target.value)} placeholder="Inspection note or observation" /></label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" className="dsr-btn" onClick={() => setTransitionStand(null)}>Cancel</button><button disabled={saving} className="dsr-btn-primary">{saving ? "Saving…" : "Confirm update"}</button></div>
          </form>
        </div>
      )}

      {newStandOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={() => setNewStandOpen(false)}>
          <form className="w-full max-w-lg space-y-4 rounded-t-2xl border border-slate-700 bg-[#0d131b] p-5 sm:rounded-xl" onClick={(e) => e.stopPropagation()} onSubmit={async (e) => {
            e.preventDefault(); const life = Number(newStandLife);
            if (!newStandCode.trim() || !Number.isFinite(life) || life < 0) { setError("Enter a stand code and valid life hours (0 or more)."); return; }
            setSaving(true); setError("");
            try {
              await fetchApi("/stands/", { method: "POST", body: JSON.stringify({ code: newStandCode.trim(), initial_life_hours: life }) });
              setNewStandOpen(false); await load();
            } catch (e) { setError(e instanceof Error ? e.message : "Could not add stand"); }
            finally { setSaving(false); }
          }}>
            <div><div className="dsr-kicker">Register equipment</div><h2 className="text-lg font-bold text-white">Add a stand</h2><p className="mt-1 text-sm text-slate-300">Use the stand code exactly as it appears in the register.</p></div>
            <label className="block text-sm text-slate-200">Stand code <input autoFocus required className="input-class mt-1" value={newStandCode} onChange={(e) => setNewStandCode(e.target.value)} placeholder="e.g. 4E" /></label>
            <label className="block text-sm text-slate-200">Existing life (hours) <input required min="0" step="1" type="number" className="input-class mt-1" value={newStandLife} onChange={(e) => setNewStandLife(e.target.value)} /></label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" className="dsr-btn" onClick={() => setNewStandOpen(false)}>Cancel</button><button disabled={saving} className="dsr-btn-primary">{saving ? "Saving…" : "Add stand"}</button></div>
          </form>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center md:p-5"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full md:max-w-4xl max-h-[92vh] overflow-auto rounded-t-2xl md:rounded-xl bg-[#0d131b] border border-slate-700 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button onClick={() => setSelected(null)} className="dsr-btn">
                Close
              </button>
            </div>
            <StandDetails stand={selected} />
          </div>
        </div>
      )}

      {componentStand && (
        <ComponentPreparationModal
          stand={componentStand}
          onClose={() => setComponentStand(null)}
          onComplete={load}
        />
      )}
    </div>
  );
}
