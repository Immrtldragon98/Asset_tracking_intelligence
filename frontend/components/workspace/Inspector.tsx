"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function Inspector({ title, onClose, children, busy = false }: {
  title: string; onClose: () => void; children: React.ReactNode; busy?: boolean;
}) {
  const label = useId(), panel = useRef<HTMLElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) { event.preventDefault(); close.current(); }
      if (event.key !== "Tab") return;
      const focusable = panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]');
      const nodes = Array.from(focusable || []).filter(node => node.getClientRects().length > 0);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) { event.preventDefault(); panel.current?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [busy]);
  return <div className="workspace-inspector-overlay" onMouseDown={event => { if (!busy && event.target === event.currentTarget) onClose(); }}>
    <aside className="workspace-inspector" role="dialog" aria-modal="true" aria-labelledby={label} tabIndex={-1} ref={panel}>
      <header><h2 id={label}>{title}</h2><button type="button" disabled={busy} onClick={onClose} aria-label="Close inspector" className="dsr-btn"><X size={18}/></button></header>
      <div className="workspace-inspector-body">{children}</div>
    </aside>
  </div>;
}
