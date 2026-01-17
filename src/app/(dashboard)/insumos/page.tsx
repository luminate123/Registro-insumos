"use client";

import { useState, useEffect } from "react";
import { useInsumos } from "@/context/InsumosContext";
import { Plus, Search, Archive } from "lucide-react";
import { CATEGORIAS, UnidadMedida, Insumo } from "@/lib/types";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function InsumosPage() {
  const { insumos, agregarInsumo } = useInsumos();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const { role, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== 'ADMIN') {
      router.push('/salidas');
    }
  }, [role, loading, router]);

  // Form State
  const [formData, setFormData] = useState<Partial<Insumo>>({
    nombre: "",
    categoria: CATEGORIAS[0],
    unidad: "UNIDAD",
    stockMinimo: 0,
    cantidadActual: 0,
    descripcion: ""
  });

  const filteredInsumos = insumos.filter(i => 
    i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) return;

    try {
      await agregarInsumo({
        nombre: formData.nombre,
        categoria: formData.categoria || "Otros",
        unidad: (formData.unidad as UnidadMedida) || "UNIDAD",
        stockMinimo: Number(formData.stockMinimo) || 0,
        cantidadActual: Number(formData.cantidadActual) || 0,
        descripcion: formData.descripcion || "",
      } as Insumo);

      toast.success("Insumo registrado correctamente");
      setShowForm(false);
      setFormData({
        nombre: "",
        categoria: CATEGORIAS[0],
        unidad: "UNIDAD",
        stockMinimo: 0,
        cantidadActual: 0,
        descripcion: ""
      });
    } catch (error) {
      toast.error("Error al registrar insumo");
    }
  };

  if (loading || role !== 'ADMIN') {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Archive className="text-blue-600" />
          Inventario
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={18} />
          Nuevo Insumo
        </button>
      </div>

      {showForm && (
        <div className=" bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold mb-4 text-lg">Registrar Nuevo Insumo</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input 
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" 
                placeholder="Ej. Gasas Estériles"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select 
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
                className="w-full border rounded-lg p-2 bg-white text-slate-900"
              >
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Inicial</label>
              <input 
                type="number"
                value={formData.cantidadActual}
                onChange={e => setFormData({...formData, cantidadActual: Number(e.target.value)})}
                className="w-full border rounded-lg p-2 text-slate-900" 
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
              <input 
                type="number"
                value={formData.stockMinimo}
                onChange={e => setFormData({...formData, stockMinimo: Number(e.target.value)})}
                className="w-full border rounded-lg p-2 text-slate-900" 
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
              <select 
                value={formData.unidad}
                onChange={e => setFormData({...formData, unidad: e.target.value as UnidadMedida})}
                className="w-full border rounded-lg p-2 bg-white text-slate-900"
              >
                {['UNIDAD', 'ML', 'CAJA', 'LITRO', 'GRAMO', 'PAQUETE'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea 
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
                className="w-full border rounded-lg p-2 text-slate-900" 
                rows={2}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar insumos..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-slate-900"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Unidad</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInsumos.map((item) => {
                const isLowStock = item.cantidadActual <= item.stockMinimo;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{item.nombre}</div>
                      <div className="text-xs text-slate-500">{item.descripcion}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 text-xs rounded-full">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-900">{item.cantidadActual}</td>
                    <td className="p-4 text-slate-500 lowercase">{item.unidad}</td>
                    <td className="p-4">
                      {isLowStock ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full w-fit">
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInsumos.length === 0 && (
            <div className="p-8 text-center text-slate-500">No se encontraron insumos.</div>
          )}
        </div>
      </div>
    </div>
  );
}
