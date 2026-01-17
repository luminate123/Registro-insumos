"use client";

import { useInsumos } from "@/context/InsumosContext";
import { AlertTriangle, TrendingUp, TrendingDown, Package } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-slate-800">{value}</h3>
      </div>
      <div className={clsx("p-3 rounded-lg", color)}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { insumos, movimientos } = useInsumos();
  const { role, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== 'ADMIN') {
      router.push('/salidas');
    }
  }, [role, loading, router]);

  if (loading || role !== 'ADMIN') {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  const stockBajo = insumos.filter(i => i.cantidadActual <= i.stockMinimo);
  const ultimosMovimientos = movimientos.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Insumos" 
          value={insumos.length} 
          icon={Package} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Stock Bajo" 
          value={stockBajo.length} 
          icon={AlertTriangle} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Entradas (Mes)" 
          value={movimientos.filter(m => m.tipo === 'ENTRADA').length} 
          icon={TrendingUp} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Salidas (Mes)" 
          value={movimientos.filter(m => m.tipo === 'SALIDA').length} 
          icon={TrendingDown} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Alertas de Stock
            </h2>
            <Link href="/insumos" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stockBajo.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm">Todo en orden.</p>
            ) : (
              stockBajo.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{item.nombre}</div>
                    <div className="text-xs text-slate-500">Stock Min: {item.stockMinimo} {item.unidad}</div>
                  </div>
                  <div className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">
                    {item.cantidadActual} {item.unidad}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Movimientos Recientes</h2>
            <Link href="/movimientos" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {ultimosMovimientos.map(mov => {
              const insumo = insumos.find(i => i.id === mov.insumoId);
              const isEntrada = mov.tipo === 'ENTRADA';
              return (
                <div key={mov.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-full", isEntrada ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
                      {isEntrada ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{insumo?.nombre || 'Insumo desconocido'}</div>
                      <div className="text-xs text-slate-500">{new Date(mov.fecha).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-slate-700">
                    {isEntrada ? '+' : '-'}{mov.cantidad}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
