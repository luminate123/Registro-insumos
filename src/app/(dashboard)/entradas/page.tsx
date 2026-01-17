"use client";

import { useState, useEffect } from "react";
import { useInsumos } from "@/context/InsumosContext";
import { PlusCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function EntradasPage() {
  const { insumos, registrarMovimiento } = useInsumos();
  const router = useRouter();
  const { role, loading } = useUserRole();

  useEffect(() => {
    if (!loading && role !== 'ADMIN') {
      router.push('/salidas');
    }
  }, [role, loading, router]);
  
  const [selectedInsumo, setSelectedInsumo] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");

  if (loading || role !== 'ADMIN') {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInsumo) return;

    await registrarMovimiento(selectedInsumo, "ENTRADA", cantidad, notas);
    router.push("/movimientos");
  };

  const insumoSeleccionado = insumos.find(i => i.id === selectedInsumo);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <PlusCircle className="text-green-600" />
        Registrar Entrada de Material
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Insumo</label>
            <select 
              value={selectedInsumo}
              onChange={e => setSelectedInsumo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-green-500 outline-none text-slate-900"
              required
            >
              <option value="">-- Seleccione un producto --</option>
              {insumos.map(insumo => (
                <option key={insumo.id} value={insumo.id}>
                  {insumo.nombre} (Stock actual: {insumo.cantidadActual} {insumo.unidad})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad a Ingresar</label>
              <input 
                type="number" 
                min="1"
                value={cantidad}
                onChange={e => setCantidad(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none text-slate-900"
                required
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Unidad</label>
               <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                 {insumoSeleccionado?.unidad || '-'}
               </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notas / Proveedor</label>
            <textarea 
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ej. Compra Factura #1234 - Proveedor X"
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none text-slate-900"
              rows={3}
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors"
            >
              <CheckCircle size={20} />
              Confirmar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
