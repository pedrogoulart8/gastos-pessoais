import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isDemoMode = process.env.DEMO_MODE === "true";

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl bg-background">
      {isDemoMode && (
        <div className="sticky top-0 z-40 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-400">
          <strong>Modo demonstração</strong> — dados fictícios, somente leitura.
        </div>
      )}
      <main className="pb-24 md:pb-32">{children}</main>
      <BottomNav />
    </div>
  );
}
