import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: movimientos, error } = await supabase
      .from('Movimiento')
      .select('*, insumo:Insumo(nombre, unidad)')
      .order('fecha', { ascending: false });

    if (error) throw error;

    return NextResponse.json(movimientos);
  } catch (error: any) {
    console.error('Error fetching movimientos:', error);
    return NextResponse.json({ error: error.message || 'Error fetching movimientos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { insumoId, tipo, cantidad, notas } = data;
    const supabase = await createClient();

    // 1. Create Movimiento
    const { data: movimiento, error: movError } = await supabase
      .from('Movimiento')
      .insert({
        id: randomUUID(),
        insumoId,
        tipo,
        cantidad,
        notas,
        fecha: new Date().toISOString()
      })
      .select()
      .single();

    if (movError) throw movError;

    // 2. Update Insumo Stock
    const { data: currentInsumo, error: fetchError } = await supabase
      .from('Insumo')
      .select('cantidadActual')
      .eq('id', insumoId)
      .single();

    if (fetchError) throw fetchError;

    const newQuantity = tipo === 'ENTRADA' 
      ? currentInsumo.cantidadActual + cantidad 
      : currentInsumo.cantidadActual - cantidad;

    if (newQuantity < 0) {
      throw new Error('Stock insuficiente');
    }

    const { error: updateError } = await supabase
      .from('Insumo')
      .update({ cantidadActual: newQuantity, updatedAt: new Date().toISOString() })
      .eq('id', insumoId);

    if (updateError) throw updateError;

    return NextResponse.json(movimiento);

  } catch (error: any) {
    console.error('Error processing movimiento:', error);
    return NextResponse.json({ error: error.message || 'Error processing movimiento' }, { status: 500 });
  }
}
