"use client";
import { useEffect, useState } from "react";
import { AuthUser, canEdit, getUser, isAdmin } from "@/lib/auth";
export function useWorkspaceUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    const sync = () => setUser(getUser());
    sync(); window.addEventListener("dsr-auth-change", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("dsr-auth-change", sync); window.removeEventListener("storage", sync); };
  }, []);
  return { user, editable: canEdit(user), admin: isAdmin(user) };
}
