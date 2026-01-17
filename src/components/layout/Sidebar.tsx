"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ArrowRightLeft, LayoutDashboard, PlusCircle, MinusCircle, LogOut, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { createClient } from '@/lib/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Package, label: 'Inventario de Insumos', href: '/insumos' },
  { icon: ArrowRightLeft, label: 'Historial Movimientos', href: '/movimientos' },
  { icon: PlusCircle, label: 'Registrar Entrada', href: '/entradas' },
  { icon: MinusCircle, label: 'Registrar Salida', href: '/salidas' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, role, loading } = useUserRole();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md text-slate-600 hover:text-slate-900"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r h-screen shadow-sm flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 pt-16 md:pt-6">
          <h1 className="text-xl font-bold text-slate-800">Clínica Estética</h1>
          <p className="text-xs text-slate-500">Gestión de Insumos</p>
        </div>
      
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.filter(item => {
            if (!role) return false;
            if (role === 'ADMIN') return true;
            return item.href === '/salidas'; 
          }).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>


      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate text-slate-900">{user?.user_metadata?.name || 'Usuario'}</p>
            <p className="text-xs text-slate-500 truncate">{loading ? '...' : role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
    </>
  );
}
