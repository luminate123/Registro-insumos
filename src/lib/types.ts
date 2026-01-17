export type TipoMovimiento = 'ENTRADA' | 'SALIDA';
export type UnidadMedida = 'UNIDAD' | 'ML' | 'LITRO' | 'GRAMO' | 'KILO' | 'CAJA' | 'PAQUETE';

export interface Insumo {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  cantidadActual: number;
  unidad: UnidadMedida;
  stockMinimo: number;
  lote?: string;
  fechaVencimiento?: string; // ISO date
  precioUnitario?: number;
}

export interface Movimiento {
  id: string;
  insumoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string; // ISO date
  usuario?: string;
  notas?: string;
}

export const CATEGORIAS = [
  "Inyectables",
  "Descartables",
  "Cremas y Geles",
  "Ropa de Cama",
  "Limpieza",
  "Equipamiento",
  "Otros"
];
