// app/configuracoes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { useConfirm } from '@/hooks/useConfirm';
import { Button } from '@/components/ui/Button';
import { ConfigSection } from '@/components/configuracoes/ConfigSection';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ModalAlterarSenha } from '@/components/configuracoes/ModalAlterarSenha';
import { ModalExcluirConta } from '@/components/configuracoes/ModalExcluirConta';
import Link from 'next/link';
import {
  apiObterPreferencias,
  apiAtualizarPreferencias,
  apiAlterarSenha,
  apiExportarDados,
  apiExcluirConta,
} from '@/lib/api';
import { extrairMensagemErro, traduzirErro } from '@/lib/api/error-handler';
import { STORAGE_ANIMACAO_ROLAGEM_KEY } from '@/lib/constants/rolagem';

type ErroApiBasico = {
  status?: number;
  response?: { status?: number };
  body?: { statusCode?: number; code?: string };
};

export default function ConfiguracoesPage() {
  const { usuario, token, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: false,
    convites: true,
    atualizacoes: true,
  });

  const [idioma, setIdioma] = useState('pt-BR');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erroGlobal, setErroGlobal] = useState<string | null>(null);
  const [animacaoRolagemAtiva, setAnimacaoRolagemAtiva] = useState(() => {
    if (typeof window === 'undefined') return true;
    const armazenado = window.localStorage.getItem(STORAGE_ANIMACAO_ROLAGEM_KEY);
    return armazenado !== 'off';
  });
  
  const [modalSenhaOpen, setModalSenhaOpen] = useState(false);
  const [modalExcluirOpen, setModalExcluirOpen] = useState(false);

  const extrairStatusErro = (error: unknown): number => {
    const err = error as ErroApiBasico;
    return Number(err.status || err.response?.status || err.body?.statusCode || 0);
  };

  const extrairCodigoErro = (error: unknown): string | undefined => {
    const err = error as ErroApiBasico;
    return err.body?.code;
  };

  const carregarPreferencias = useCallback(async () => {
    try {
      setCarregando(true);
      setErroGlobal(null);
      const prefs = await apiObterPreferencias();
      setNotificacoes({
        email: prefs.notificacoesEmail,
        push: prefs.notificacoesPush,
        convites: prefs.notificacoesConvites,
        atualizacoes: prefs.notificacoesAtualizacoes,
      });
      setIdioma(prefs.idioma);
    } catch (error: unknown) {
      const status = extrairStatusErro(error);
      const mensagem = traduzirErro(extrairCodigoErro(error), extrairMensagemErro(error), status);
      setErroGlobal(mensagem);
      showToast(mensagem, 'error');
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setCarregando(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (token) {
      carregarPreferencias();
    }
  }, [token, carregarPreferencias]);

  const handleSalvarPreferencias = async () => {
    try {
      setSalvando(true);
      setErroGlobal(null);
      await apiAtualizarPreferencias({
        notificacoesEmail: notificacoes.email,
        notificacoesPush: notificacoes.push,
        notificacoesConvites: notificacoes.convites,
        notificacoesAtualizacoes: notificacoes.atualizacoes,
        idioma,
      });
      showToast('Preferências salvas com sucesso!', 'success');
    } catch (error: unknown) {
      const status = extrairStatusErro(error);
      const mensagem = traduzirErro(extrairCodigoErro(error), extrairMensagemErro(error), status);
      setErroGlobal(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarSenha = async (senhaAtual: string, novaSenha: string) => {
    try {
      setErroGlobal(null);
      await apiAlterarSenha(senhaAtual, novaSenha);
      showToast('Senha alterada com sucesso!', 'success');
    } catch (error: unknown) {
      const status = extrairStatusErro(error);
      const mensagem = traduzirErro(extrairCodigoErro(error), extrairMensagemErro(error), status);
      setErroGlobal(mensagem);
      showToast(mensagem, 'error');
    }
  };

  const handleExportarDados = async () => {
    try {
      setErroGlobal(null);
      await apiExportarDados();
      showToast('Exportação iniciada com sucesso.', 'success');
    } catch (error: unknown) {
      const status = extrairStatusErro(error);
      const mensagem = traduzirErro(extrairCodigoErro(error), extrairMensagemErro(error), status);
      setErroGlobal(mensagem);
      showToast(mensagem, 'error');
    }
  };

  const handleToggleAnimacaoRolagem = (checked: boolean) => {
    setAnimacaoRolagemAtiva(checked);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STORAGE_ANIMACAO_ROLAGEM_KEY,
      checked ? 'on' : 'off',
    );
  };

  const handleExcluirConta = async (senha: string) => {
    try {
      setErroGlobal(null);
      await apiExcluirConta(senha);
      showToast('Conta excluída com sucesso.', 'success');
      logout();
    } catch (error: unknown) {
      const status = extrairStatusErro(error);
      const mensagem = traduzirErro(extrairCodigoErro(error), extrairMensagemErro(error), status);
      setErroGlobal(mensagem);
      showToast(mensagem, 'error');
    }
  };

  // âœ… Logout com ConfirmDialog
  const handleLogout = () => {
    confirm({
      title: 'Tem certeza que deseja sair?',
      description: 'Você será desconectado e precisará fazer login novamente.',
      confirmLabel: 'Sim, sair',
      cancelLabel: 'Cancelar',
      variant: 'warning',
      onConfirm: () => {
        logout();
      },
    });
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4"></div>
          <p className="text-app-fg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-app-fg flex items-center gap-2">
                <Icon name="settings" className="w-8 h-8" />
                Configurações
              </h1>
              <p className="text-app-muted mt-1">Gerencie suas preferências e conta</p>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Icon name="back" className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>

          <div className="space-y-6">

          {erroGlobal && <ErrorAlert message={erroGlobal} />}

            {/* Seção: Perfil */}
            <ConfigSection title="Perfil" icon="user">
              <div className="space-y-4">
                <Input
                  type="text"
                  label="Nome de usuário"
                  value={usuario?.apelido || ''}
                  disabled
                  className="bg-app-bg"
                />
                <Input
                  type="email"
                  label="Email"
                  value={usuario?.email || ''}
                  disabled
                  className="bg-app-bg"
                />
                <Input
                  type="text"
                  label="ID do usuário"
                  value={usuario?.id || ''}
                  disabled
                  className="bg-app-bg font-mono text-sm"
                />
                <Alert>
                  Para alterar seus dados, entre em contato com o suporte.
                </Alert>
              </div>
            </ConfigSection>

            {/* Seção: Aparência */}
            <ConfigSection title="Aparência" icon="paint">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-app-fg mb-2">
                    Tema
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={theme === 'light' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className="flex-1"
                    >
                      <Icon name="sun" className="w-4 h-4 mr-2" />
                      Claro
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => theme === 'light' && toggleTheme()}
                      className="flex-1"
                    >
                      <Icon name="moon" className="w-4 h-4 mr-2" />
                      Escuro
                    </Button>
                  </div>
                  <p className="text-xs text-app-muted mt-2">
                    Tema atual: <strong>{theme === 'dark' ? 'Escuro' : 'Claro'}</strong>
                  </p>
                </div>

                <Select
                  label="Idioma"
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                >
                  <option value="pt-BR">ðŸ‡§ðŸ‡· PortuguÃªs (Brasil)</option>
                  <option value="en-US">ðŸ‡ºðŸ‡¸ English (US)</option>
                  <option value="es-ES">ðŸ‡ªðŸ‡¸ EspaÃ±ol</option>
                </Select>
                <p className="text-xs text-app-muted">
                  Idioma da interface do sistema (em breve)
                </p>

                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-sm font-medium text-app-fg">
                    Animação 3D de rolagem
                  </p>
                  <p className="text-xs text-app-muted mt-1">
                    Controla a animação 3D no modal de rolagens da sessão.
                  </p>
                  <div className="mt-3">
                    <Checkbox
                      label="Ativar animação 3D"
                      checked={animacaoRolagemAtiva}
                      onChange={(e) => handleToggleAnimacaoRolagem(e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </ConfigSection>

            {/* Seção: Notificações */}
            <ConfigSection title="Notificações" icon="bell">
              <div className="space-y-3">
                <Checkbox
                  label="Notificações por email"
                  checked={notificacoes.email}
                  onChange={(e) =>
                    setNotificacoes({ ...notificacoes, email: e.target.checked })
                  }
                />
                <Checkbox
                  label="Notificações push no navegador"
                  checked={notificacoes.push}
                  onChange={(e) =>
                    setNotificacoes({ ...notificacoes, push: e.target.checked })
                  }
                />
                <Checkbox
                  label="Alertas de convites para campanhas"
                  checked={notificacoes.convites}
                  onChange={(e) =>
                    setNotificacoes({ ...notificacoes, convites: e.target.checked })
                  }
                />
                <Checkbox
                  label="Avisos sobre atualizações do sistema"
                  checked={notificacoes.atualizacoes}
                  onChange={(e) =>
                    setNotificacoes({ ...notificacoes, atualizacoes: e.target.checked })
                  }
                />
              </div>
            </ConfigSection>

            {/* Seção: Privacidade e Segurança */}
            <ConfigSection title="Privacidade e Segurança" icon="lock">
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setModalSenhaOpen(true)}
                >
                  <Icon name="edit" className="w-4 h-4 mr-2" />
                  Alterar senha
                </Button>
              </div>
            </ConfigSection>

            {/* Seção: Dados e Exportação */}
            <ConfigSection title="Dados e Exportação" icon="archive">
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleExportarDados}
                >
                  <Icon name="copy" className="w-4 h-4 mr-2" />
                  Exportar meus dados (JSON)
                </Button>
                <Alert>
                  Seus dados serão baixados em formato JSON
                </Alert>
              </div>
            </ConfigSection>

            {/* Seção: Sobre */}
            <ConfigSection title="Sobre o Sistema" icon="info">
              <div className="space-y-2 text-sm text-app-muted">
                <p>
                  <strong className="text-app-fg">Versão:</strong> 1.3.0 (Beta)
                </p>
                <p>
                  <strong className="text-app-fg">Sistema:</strong> Jujutsu Kaisen RPG - Assistente Digital
                </p>
                <p>
                  <strong className="text-app-fg">Última atualização:</strong> Janeiro 2026
                </p>
                <div className="flex gap-3 mt-4">
                  <Link
                    href="/compendio"
                    className="text-app-primary hover:underline flex items-center gap-1"
                  >
                    <Icon name="rules" className="w-4 h-4" />
                    Compêndio
                  </Link>
                </div>
              </div>
            </ConfigSection>

            {/* Botão de Salvar */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSalvarPreferencias}
                disabled={salvando}
              >
                <Icon name="check" className="w-4 h-4 mr-2" />
                {salvando ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </div>

            {/* Zona de Perigo */}
            <ConfigSection title="Zona de Perigo" icon="warning" danger>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <Icon name="back" className="w-4 h-4 mr-2" />
                  Sair da conta
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalExcluirOpen(true)}
                  className="w-full justify-start text-app-danger hover:bg-app-danger/10"
                >
                  <Icon name="delete" className="w-4 h-4 mr-2" />
                  Excluir conta permanentemente
                </Button>
                <Alert variant="error">
                  <strong>Atenção:</strong> Esta ação não pode ser desfeita.
                </Alert>
              </div>
            </ConfigSection>
          </div>
        </div>
      </main>

      {/* âœ… Modal de confirmaÃ§Ã£o reutilizÃ¡vel */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options?.title ?? ''}
        description={options?.description ?? ''}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        variant={options?.variant}
      />

      {/* Modais específicos (mantidos porque precisam de input) */}
      <ModalAlterarSenha
        isOpen={modalSenhaOpen}
        onClose={() => setModalSenhaOpen(false)}
        onConfirm={handleAlterarSenha}
      />

      <ModalExcluirConta
        isOpen={modalExcluirOpen}
        onClose={() => setModalExcluirOpen(false)}
        onConfirm={handleExcluirConta}
      />
    </>
  );
}

