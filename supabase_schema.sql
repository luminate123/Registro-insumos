-- 1. Eliminar tablas antiguas de autenticación (no necesarias con Supabase Auth nativo)
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. Asegurarse de tener la extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Tabla de Insumos
-- Se recomienda usar UUID para claves primarias en Supabase
CREATE TABLE IF NOT EXISTS "Insumo" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "categoria" TEXT NOT NULL,
  "cantidadActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unidad" TEXT NOT NULL,
  "stockMinimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lote" TEXT,
  "fechaVencimiento" TIMESTAMP WITH TIME ZONE,
  "precioUnitario" DOUBLE PRECISION,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Movimientos
CREATE TABLE IF NOT EXISTS "Movimiento" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "insumoId" UUID NOT NULL REFERENCES "Insumo"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tipo" TEXT NOT NULL, -- 'ENTRADA' o 'SALIDA'
  "cantidad" DOUBLE PRECISION NOT NULL,
  "fecha" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "usuario" TEXT, -- Email o ID del usuario autenticado
  "notas" TEXT
);

-- 5. Índices para rendimiento
CREATE INDEX IF NOT EXISTS "idx_movimiento_insumo" ON "Movimiento"("insumoId");
CREATE INDEX IF NOT EXISTS "idx_insumo_nombre" ON "Insumo"("nombre");

-- 6. Tabla de Perfiles (Roles)
-- Esta tabla extiende la información de auth.users
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  "role" TEXT NOT NULL DEFAULT 'USER', -- 'ADMIN' o 'USER'
  "email" TEXT, 
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Trigger para crear perfil automáticamente al registrarse
-- Nota: Esto se ejecuta en el esquema de Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'USER'); -- Por defecto todos son USER
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Políticas de Seguridad (RLS)
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- 1. Política básica: Usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON "profiles";
CREATE POLICY "Usuarios pueden ver su propio perfil" ON "profiles"
  FOR SELECT USING (auth.uid() = id);

-- 2. Función auxiliar segura para verificar si es admin (Evita recursión infinita)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Política para admin: Puede ver todos los perfiles usando la función segura
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON "profiles";
CREATE POLICY "Admins pueden ver todos los perfiles" ON "profiles"
  FOR SELECT USING (public.is_admin());

--------------------------------------------------------------------------------
-- NUEVAS POLÍTICAS PARA INSUMO Y MOVIMIENTO (Restricción por Roles)
--------------------------------------------------------------------------------

-- Habilitar RLS en tablas principales
ALTER TABLE "Insumo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Movimiento" ENABLE ROW LEVEL SECURITY;

-- === POLÍTICAS PARA TABLA "Insumo" ===

-- 1. Lectura: Todos los usuarios registrados pueden ver los insumos
DROP POLICY IF EXISTS "Usuarios registrados pueden ver insumos" ON "Insumo";
CREATE POLICY "Usuarios registrados pueden ver insumos" ON "Insumo"
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Creación: Solo los ADMIN pueden crear nuevos insumos
DROP POLICY IF EXISTS "Solo admins pueden crear insumos" ON "Insumo";
CREATE POLICY "Solo admins pueden crear insumos" ON "Insumo"
  FOR INSERT WITH CHECK (public.is_admin());

-- 3. Actualización: Todos los usuarios registrados pueden actualizar (necesario para actualizar stock al hacer salidas)
-- Idealmente restringiríamos esto más, pero el sistema actual actualiza el stock directamente
DROP POLICY IF EXISTS "Usuarios registrados pueden actualizar stock" ON "Insumo";
CREATE POLICY "Usuarios registrados pueden actualizar stock" ON "Insumo"
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Eliminación: Solo los ADMIN pueden borrar insumos
DROP POLICY IF EXISTS "Solo admins pueden borrar insumos" ON "Insumo";
CREATE POLICY "Solo admins pueden borrar insumos" ON "Insumo"
  FOR DELETE USING (public.is_admin());


-- === POLÍTICAS PARA TABLA "Movimiento" ===

-- 1. Lectura: Solo ADMIN puede ver el historial completo de movimientos
-- (El USER solo registra salidas, no necesita ver el historial)
DROP POLICY IF EXISTS "Solo admins pueden ver movimientos" ON "Movimiento";
CREATE POLICY "Solo admins pueden ver movimientos" ON "Movimiento"
  FOR SELECT USING (public.is_admin());

-- 2. Creación: Todos los usuarios registrados pueden registrar movimientos (Entradas o Salidas)
DROP POLICY IF EXISTS "Usuarios registrados pueden crear movimientos" ON "Movimiento";
CREATE POLICY "Usuarios registrados pueden crear movimientos" ON "Movimiento"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Actualización/Eliminación: Solo ADMIN
DROP POLICY IF EXISTS "Solo admins pueden gestionar movimientos" ON "Movimiento";
CREATE POLICY "Solo admins pueden gestionar movimientos" ON "Movimiento"
  FOR ALL USING (public.is_admin());



