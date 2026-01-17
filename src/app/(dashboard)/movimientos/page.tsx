"use client";

import { useInsumos } from "@/context/InsumosContext";
import { ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MovimientosPage() {
  const { movimientos, insumos } = useInsumos();
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <ArrowRightLeft className="text-blue-600" />
        Historial de Movimientos
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Insumo</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.map((mov) => {
                const insumo = insumos.find(i => i.id === mov.insumoId);
                const isEntrada = mov.tipo === 'ENTRADA';
                
                return (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(mov.fecha).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit",
                        isEntrada ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                      )}>
                        {isEntrada ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {insumo?.nombre || 'Producto eliminado'}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {mov.cantidad} {insumo?.unidad}
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">
                      {mov.notas || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {movimientos.length === 0 && (
            <div className="p-8 text-center text-slate-500">No hay movimientos registrados.</div>
          )}
        </div>
      </div>
    </div>
  );
}
