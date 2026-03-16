'use client';

import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Calendar,
  AlertTriangle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove('payfig_token');
    router.push('/login');
  };

  const menuItems = [
    { title: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
    { title: 'Agenda', icon: Calendar, href: '/dashboard/agenda' },
    { title: 'Créditos', icon: Wallet, href: '/dashboard/loans' },
    { title: 'Clientes', icon: Users, href: '/dashboard/customers' },
    { title: 'Mora', icon: AlertTriangle, href: '/dashboard/overdue' },
  ];


  return (
    <div className="min-h-screen min-h-[100dvh] bg-army-950 text-army-accent flex flex-col md:flex-row">

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-48 bg-army-900 border-r border-army-800 flex-col sticky top-0 h-screen shadow-xl">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="bg-army-primary w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-army-primary/20">
              <Wallet className="text-white w-4.5 h-4.5" />
            </div>
            <span className="text-lg font-black text-white italic uppercase tracking-tighter">PayFig</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-army-primary text-white shadow-lg shadow-army-primary/20'
                    : 'text-army-accent/60 hover:bg-army-800 hover:text-white'
                  }`}
              >
                <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-army-accent/40 group-hover:text-army-accent'}`} />
                <span className="font-bold text-[10px] uppercase tracking-widest flex-1">{item.title}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-army-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 group-hover:animate-pulse" />
            <span className="font-bold text-[10px] uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* HEADER (Mobile Only) */}
      <header className="md:hidden flex items-center justify-between p-5 bg-army-900 border-b border-army-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-army-primary w-8 h-8 rounded-lg flex items-center justify-center">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white">PayFig</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-white hover:text-white/80"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-10">
        <section className="animate-in fade-in slide-in-from-bottom-1 duration-400">
          {children}
        </section>
      </main>

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-army-900/95 backdrop-blur-lg border-t border-army-800 px-2 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] flex items-center justify-around z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] transform-gpu">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all ${isActive ? 'text-white' : 'text-army-accent/40'
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.title}</span>
              {isActive && <div className="w-1 h-1 bg-white rounded-full mt-0.5" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
