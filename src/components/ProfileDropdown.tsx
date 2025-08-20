import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileModal } from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProfileDropdown() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, updateProfile, signOut, loading } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleEditProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = async (updatedData: any) => {
    const success = await updateProfile(updatedData);
    if (success) {
      setIsProfileModalOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {loading ? 'Carregando...' : (profile?.nome || 'Usuário')}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {loading ? '' : (profile?.email || '')}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEditProfile}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        profileData={profile || { nome: '', email: '', telefone: '', empresa: '' }}
        onSave={handleProfileUpdate}
      />
    </>
  );
}