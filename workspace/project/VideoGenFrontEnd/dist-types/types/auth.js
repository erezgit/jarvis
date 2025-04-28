// Type adapter for legacy Supabase user
export const adaptSupabaseUser = (supabaseUser) => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.username || null,
});
