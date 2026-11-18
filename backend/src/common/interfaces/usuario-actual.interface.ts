/** Usuario autenticado (sale del JWT de Supabase). */
export interface UsuarioActual {
  id: string;
  email: string | null;
  /** Token original: se reenvía a Supabase para que RLS aplique con este usuario. */
  token: string;
}
