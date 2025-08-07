import { Button } from "@/components/ui/button";

interface InstallPwaPopupProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallPwaPopup = ({ onInstall, onDismiss }: InstallPwaPopupProps) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <p className="text-sm mb-2">Instale nosso app para uma melhor experiência!</p>
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" size="sm" onClick={onDismiss}>Agora não</Button>
        <Button size="sm" onClick={onInstall}>Instalar</Button>
      </div>
    </div>
  );
};