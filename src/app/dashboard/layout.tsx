import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Logo } from '@/components/icons/logo';
import Link from 'next/link';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full">
        <Sidebar>
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6 text-primary" />
              <span className="group-data-[collapsible=icon]:hidden">Budgee</span>
            </Link>
          </div>
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col pl-0 md:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]:md:pl-[var(--sidebar-width)] transition-[padding-left] duration-300 ease-in-out">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
