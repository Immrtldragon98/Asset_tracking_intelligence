import { redirect } from "next/navigation";

// Keep existing bookmarks; FMIR is the existing Digital Stand Register.
export default function DSIRPage() { redirect("/fmir"); }
