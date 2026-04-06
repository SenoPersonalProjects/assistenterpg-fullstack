// components/configuracoes/ModalExcluirConta.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (senha: string) => Promise<void>;
};

export function ModalExcluirConta({ isOpen, onClose, onConfirm }: Props) {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!senha) {
      setErro('Digite sua senha para confirmar');
      return;
    }

    if (confirmacao !== 'EXCLUIR') {
      setErro('Digite "EXCLUIR" para confirmar');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(senha);
      // O redirect será feito pela página após logout
    } catch {
      // erros de request são exibidos globalmente (toast/banner) pela página
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSenha('');
    setConfirmacao('');
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
        <div className="bg-app-surface border border-red-500 dark:border-red-700 rounded-lg p-6 max-w-md w-full shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Icon name="delete" className="w-5 h-5" />
              Excluir Conta Permanentemente
            </h2>
            <button
              onClick={handleClose}
              className="text-app-muted hover:text-app-fg transition-colors"
              disabled={loading}
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">
              ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
            </p>
            <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
              <li>Todos os seus personagens serão excluídos</li>
              <li>Você será removido de todas as campanhas</li>
              <li>Todas as suas configurações serão perdidas</li>
              <li>Não será possível recuperar sua conta</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type={mostrarSenha ? 'text' : 'password'}
              label="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              disabled={loading}
              rightIcon={mostrarSenha ? 'eyeOff' : 'eye'}
              rightIconLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              onRightIconClick={() => setMostrarSenha((v) => !v)}
            />

            <Input
              type="text"
              label='Digite "EXCLUIR" para confirmar'
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="EXCLUIR"
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
                variant="secondary"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Excluindo...' : 'Excluir Conta'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
