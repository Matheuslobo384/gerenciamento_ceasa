import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  created_at?: string;
  updated_at?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilesTableExists, setProfilesTableExists] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfilesTable = async () => {
    if (profilesTableExists !== null) return profilesTableExists;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const exists = !error || error.code !== '42P01';
      setProfilesTableExists(exists);
      return exists;
    } catch {
      setProfilesTableExists(false);
      return false;
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Verificar se a tabela profiles existe
      const tableExists = await checkProfilesTable();
      
      if (tableExists) {
        // Tentar carregar da tabela profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileData && !profileError) {
          setProfile(profileData);
          return;
        }
      }
      
      // Fallback: usar dados do auth.users
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user && !userError) {
        const fallbackProfile: UserProfile = {
          id: user.id,
          nome: user.user_metadata?.nome || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          telefone: user.user_metadata?.telefone || user.user_metadata?.phone || '',
          empresa: user.user_metadata?.empresa || user.user_metadata?.company || ''
        };
        setProfile(fallbackProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Não mostrar toast de erro aqui para evitar spam
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      // Verificar se a tabela profiles existe
      const tableExists = await checkProfilesTable();
      
      if (tableExists) {
        // Tentar atualizar na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            nome: updatedData.nome || profile?.nome || '',
            email: updatedData.email || profile?.email || user.email || '',
            telefone: updatedData.telefone || profile?.telefone || '',
            empresa: updatedData.empresa || profile?.empresa || '',
            updated_at: new Date().toISOString(),
          });

        if (!profileError) {
          await loadUserProfile(user.id);
          toast({
            title: "Perfil atualizado",
            description: "Suas informações foram salvas com sucesso.",
          });
          return true;
        }
      }
      
      // Fallback: atualizar user_metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          nome: updatedData.nome || profile?.nome,
          telefone: updatedData.telefone || profile?.telefone,
          empresa: updatedData.empresa || profile?.empresa
        }
      });

      if (!metadataError) {
        await loadUserProfile(user.id);
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        });
        return true;
      } else {
        throw metadataError;
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Verifique se a tabela profiles foi criada no banco.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      toast({
        title: "Logout realizado",
        description: "Logout realizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    profile,
    loading,
    updateProfile,
    signOut,
    isAuthenticated: !!user,
    profilesTableExists,
  };
}