"use client";

import { useState } from "react";
import { useInsumos } from "@/context/InsumosContext";
import { MinusCircle, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SalidasPage() {
  const { insumos, registrarMovimiento } = useInsumos();
  const router = useRouter();
  
  const [selectedInsumo, setSelectedInsumo] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  const insumoSeleccionado = insumos.find(i => i.id === selectedInsumo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInsumo) return;
    
    if (insumoSeleccionado && cantidad > insumoSeleccionado.cantidadActual) {
      setError(`No hay suficiente stock. Disponible: ${insumoSeleccionado.cantidadActual}`);
      return;
    }

    try {
      await registrarMovimiento(selectedInsumo, "SALIDA", cantidad, notas);
      router.push("/movimientos");
    } catch (err) {
      setError("Error al registrar la salida.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <MinusCircle className="text-orange-600" />
        Registrar Salida / Uso
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Insumo</label>
            <select 
              value={selectedInsumo}
              onChange={e => {
                setSelectedInsumo(e.target.value);
                setError("");
              }}
              className="w-full border border-slate-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-slate-900"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad a Retirar</label>
              <input 
                type="number" 
                min="1"
                value={cantidad}
                onChange={e => {
                  setCantidad(Number(e.target.value));
                  setError("");
                }}
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900"
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
          
          {error && (
            <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Motivo / Paciente</label>
            <textarea 
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ej. Uso en Paciente X, Tratamiento Y"
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none text-slate-900"
              rows={3}
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors"
            >
              <ClipboardList size={20} />
              Registrar Uso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
