"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function useWorkspaceQuery() {
  const pathname = usePathname(), router = useRouter(), search = useSearchParams();
  const serialized = search.toString();
  const [value, setValue] = useState(serialized);
  const current = useRef(serialized);
  useEffect(() => { current.current = serialized; setValue(serialized); }, [serialized]);
  const update = useCallback((changes: Record<string, string | null>, push = false) => {
    const next = new URLSearchParams(current.current);
    Object.entries(changes).forEach(([key, val]) => { if (val === null || val === "") next.delete(key); else next.set(key, val); });
    current.current = next.toString(); setValue(current.current);
    const href = pathname + (current.current ? "?" + current.current : "");
    if (push) router.push(href, { scroll: false }); else router.replace(href, { scroll: false });
  }, [pathname, router]);
  return { params: new URLSearchParams(value), update };
}
