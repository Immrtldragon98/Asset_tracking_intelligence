"use client";
import { useEffect, useRef, useState } from "react";
import { fetchApi } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Message = { role: string; text: string };
export default function PlantAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || busy) return;
    if (!getToken()) { setError("Sign in to use the AI assistant."); return; }
    setBusy(true); setError("");
    try {
      const result = await fetchApi("/assistant/chat", { method: "POST", body: JSON.stringify({ question: q }) });
      setMessages(m => [...m, { role: "You", text: q }, { role: "ATI", text: result.answer }]);
      setQuestion("");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not get an answer. Please retry."); }
    finally { setBusy(false); }
  }
  return <div className="fixed bottom-20 right-4 z-50 md:bottom-5">
    {open && <section role="dialog" aria-label="ATI AI assistant" onKeyDown={e => { if (e.key === "Escape") setOpen(false); }} className="mb-3 flex max-h-[70vh] w-[min(390px,calc(100vw-2rem))] flex-col rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl">
      <div className="flex items-center justify-between"><strong>ATI AI assistant</strong><button aria-label="Close assistant" onClick={() => setOpen(false)} className="p-2">✕</button></div>
      <p className="mb-3 text-sm text-slate-600">Ask about recorded installations, condition flags, or maintenance checks. Verify recommendations before acting.</p>
      <div aria-live="polite" className="min-h-20 space-y-3 overflow-y-auto text-sm">
        {!messages.length && <p>Try: Which installed stands need attention?</p>}
        {messages.map((m, i) => <div key={i} className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3"><strong>{m.role}</strong><p>{m.text}</p></div>)}
        {busy && <p>Checking recorded plant context…</p>}
      </div>
      {error && <p role="alert" className="my-2 text-sm text-red-700">{error}</p>}
      <form onSubmit={ask} className="mt-3 flex gap-2"><input ref={input} aria-label="Ask ATI" maxLength={2000} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a maintenance question" className="min-w-0 flex-1 rounded-lg border p-2"/><button disabled={busy || !question.trim()} className="rounded-lg bg-slate-900 px-3 text-white disabled:opacity-50">Send</button></form>
    </section>}
    <button aria-expanded={open} onClick={() => setOpen(!open)} className="float-right rounded-full bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg">{open ? "Close AI" : "Ask ATI"}</button>
  </div>;
}
