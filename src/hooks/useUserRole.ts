import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useUserRole() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUserAndRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Buscamos el rol en la tabla 'profiles' de la base de datos
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (error) {
            // Si hay error (ej. usuario antiguo sin perfil), logueamos y asignamos USER por defecto
            console.log("No se pudo obtener el perfil, asignando rol USER por defecto:", error.message);
            setRole('USER');
          } else if (data) {
            // Si encontramos el perfil, usamos el rol de la base de datos
            setRole(data.role);
          }
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole('USER');
      } finally {
        setLoading(false);
      }
    };

    getUserAndRole();
  }, [supabase]);

  return { user, role, loading };
}
