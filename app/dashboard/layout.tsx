import { DashboardSidebar } from "@/app/components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      {/* lg:pl-[220px] to clear the fixed sidebar; pb-[68px] clears mobile bottom nav */}
      <div className="lg:pl-[220px] pb-[68px] lg:pb-0">
        {children}
      </div>
    </div>
  );
}
