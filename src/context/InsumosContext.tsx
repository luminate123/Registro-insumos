"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Insumo, Movimiento, TipoMovimiento } from '@/lib/types';

interface InsumosContextType {
  insumos: Insumo[];
  movimientos: Movimiento[];
  isLoading: boolean;
  agregarInsumo: (insumo: Omit<Insumo, 'id'>) => Promise<void>;
  registrarMovimiento: (insumoId: string, tipo: TipoMovimiento, cantidad: number, notas?: string) => Promise<void>;
  getInsumo: (id: string) => Insumo | undefined;
  refreshData: () => Promise<void>;
}

const InsumosContext = createContext<InsumosContextType | undefined>(undefined);

export function InsumosProvider({ children }: { children: React.ReactNode }) {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [resInsumos, resMovs] = await Promise.all([
        fetch('/api/insumos'),
        fetch('/api/movimientos')
      ]);
      
      if (resInsumos.ok) {
        setInsumos(await resInsumos.json());
      }
      if (resMovs.ok) {
        setMovimientos(await resMovs.json());
      }
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const agregarInsumo = async (insumoData: Omit<Insumo, 'id'>) => {
    try {
      const res = await fetch('/api/insumos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insumoData),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error creating insumo", error);
      throw error;
    }
  };

  const registrarMovimiento = async (insumoId: string, tipo: TipoMovimiento, cantidad: number, notas?: string) => {
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insumoId, tipo, cantidad, notas }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error registrando movimiento');
      }
      
      await refreshData();
    } catch (error) {
      console.error("Error registering movement", error);
      throw error;
    }
  };

  const getInsumo = (id: string) => insumos.find(i => i.id === id);

  return (
    <InsumosContext.Provider value={{ insumos, movimientos, isLoading, agregarInsumo, registrarMovimiento, getInsumo, refreshData }}>
      {children}
    </InsumosContext.Provider>
  );
}

export function useInsumos() {
  const context = useContext(InsumosContext);
  if (context === undefined) {
    throw new Error('useInsumos must be used within a InsumosProvider');
  }
  return context;
}
