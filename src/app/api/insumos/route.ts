import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: insumos, error } = await supabase
      .from('Insumo')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return NextResponse.json(insumos);
  } catch (error: any) {
    console.error('Error fetching insumos:', error);
    return NextResponse.json({ error: error.message || 'Error fetching insumos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const supabase = await createClient();
    
    const { data: insumo, error } = await supabase
      .from('Insumo')
      .insert({
        id: randomUUID(),
        nombre: data.nombre,
        categoria: data.categoria,
        unidad: data.unidad,
        cantidadActual: data.cantidadActual,
        stockMinimo: data.stockMinimo,
        descripcion: data.descripcion,
        lote: data.lote,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento).toISOString() : null,
        precioUnitario: data.precioUnitario,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(insumo);
  } catch (error: any) {
    console.error('Error creating insumo:', error);
    return NextResponse.json({ error: error.message || 'Error creating insumo' }, { status: 500 });
  }
}
