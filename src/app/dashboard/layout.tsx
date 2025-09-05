import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full">
        <Sidebar>
          <div className="flex h-14 items-center bg-background px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6 text-primary" />
              <span className="group-data-[collapsible=icon]:hidden">Budgee</span>
            </Link>
          </div>
          <SidebarNav />
        </Sidebar>
  <div className="flex flex-col pl-0 md:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:md:pl-[var(--sidebar-width)] transition-[padding-left] duration-300 ease-in-out pb-20 md:pb-0">
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </main>
      {/* Mobile bottom nav */}
      <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
