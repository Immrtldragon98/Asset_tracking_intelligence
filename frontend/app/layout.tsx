import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = { title: "Asset Tracking Intelligence", description: "Plant-wide maintenance, asset lifecycle and reliability intelligence", viewport: "width=device-width, initial-scale=1, viewport-fit=cover" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className="dark"><body className="bg-industrial-dark text-slate-100 antialiased"><AppShell>{children}</AppShell></body></html>; }
