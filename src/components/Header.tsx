import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function Header() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">LECULGO</h1>
          <p className="text-sm text-muted-foreground">Gerenciamento de Mercadorias</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </header>
  );
}