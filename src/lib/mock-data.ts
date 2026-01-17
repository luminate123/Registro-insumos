import { Insumo, Movimiento } from './types';

export const insumosIniciales: Insumo[] = [
  {
    id: '1',
    nombre: 'Botox Allergan 100ui',
    descripcion: 'Toxina botulínica tipo A',
    categoria: 'Inyectables',
    cantidadActual: 5,
    unidad: 'UNIDAD',
    stockMinimo: 3,
    lote: 'BX202401',
    fechaVencimiento: '2025-06-01',
    precioUnitario: 150
  },
  {
    id: '2',
    nombre: 'Jeringas 1ml',
    descripcion: 'Jeringas estériles sin aguja',
    categoria: 'Descartables',
    cantidadActual: 150,
    unidad: 'UNIDAD',
    stockMinimo: 50,
    lote: 'JG9988',
  },
  {
    id: '3',
    nombre: 'Ácido Hialurónico Voluma',
    descripcion: 'Relleno dérmico',
    categoria: 'Inyectables',
    cantidadActual: 8,
    unidad: 'UNIDAD',
    stockMinimo: 5,
    fechaVencimiento: '2025-12-12'
  },
  {
    id: '4',
    nombre: 'Guantes de Nitrilo M',
    descripcion: 'Caja x 100 unidades',
    categoria: 'Descartables',
    cantidadActual: 12,
    unidad: 'CAJA',
    stockMinimo: 5,
  }
];

export const movimientosIniciales: Movimiento[] = [
  {
    id: '1',
    insumoId: '1',
    tipo: 'ENTRADA',
    cantidad: 10,
    fecha: '2024-01-10T10:00:00Z',
    notas: 'Compra mensual'
  },
  {
    id: '2',
    insumoId: '1',
    tipo: 'SALIDA',
    cantidad: 2,
    fecha: '2024-01-12T14:30:00Z',
    notas: 'Paciente: Maria Gonzalez'
  },
  {
    id: '3',
    insumoId: '2',
    tipo: 'SALIDA',
    cantidad: 5,
    fecha: '2024-01-12T14:35:00Z',
    notas: 'Procedimiento Botox'
  }
];
