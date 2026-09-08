import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BiteID - Multimodal Insect & Bite Triage",
  description: "Multimodal AI bite triage combining photo vision, geo-seasonal endemic data, and red-flag safety interception.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} BiteID Medical Triage Prototype. Educational tool only.</p>
            <div className="flex gap-4 font-medium text-slate-600">
              <span>Emergency: Call 911</span>
              <span>Poison Control: 1-800-222-1222</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
