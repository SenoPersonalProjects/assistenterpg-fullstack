// components/configuracoes/ModalAlterarSenha.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (senhaAtual: string, novaSenha: string) => Promise<void>;
};

export function ModalAlterarSenha({ isOpen, onClose, onConfirm }: Props) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro('Preencha todos os campos');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(senhaAtual, novaSenha);
      
      // Limpar campos e fechar
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      onClose();
    } catch {
      // erros de request são exibidos globalmente (toast/banner) pela página
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setErro('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-app-surface border border-app-border rounded-lg p-6 max-w-md w-full shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-app-fg flex items-center gap-2">
              <Icon name="edit" className="w-5 h-5" />
              Alterar Senha
            </h2>
            <button
              onClick={handleClose}
              className="text-app-muted hover:text-app-fg transition-colors"
              disabled={loading}
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              label="Senha Atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={loading}
            />

            <Input
              type="password"
              label="Nova Senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha"
              disabled={loading}
            />

            <Input
              type="password"
              label="Confirmar Nova Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a nova senha"
              disabled={loading}
            />

            {erro && (
              <div className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 rounded-lg p-3 text-sm">
                {erro}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
