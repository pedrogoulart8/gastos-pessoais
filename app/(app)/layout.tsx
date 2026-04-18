import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl bg-background">
      <main className="pb-24 md:pb-32">{children}</main>
      <BottomNav />
    </div>
  );
}
