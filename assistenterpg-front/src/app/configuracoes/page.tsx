// app/configuracoes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTheme, type ThemeMode, type ThemePalette } from '@/context/ThemeContext';
import { useConfirm } from '@/hooks/useConfirm';
import { Button } from '@/components/ui/Button';
import { ConfigSection } from '@/components/configuracoes/ConfigSection';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ModalAlterarSenha } from '@/components/configuracoes/ModalAlterarSenha';
import { ModalExcluirConta } from '@/components/configuracoes/ModalExcluirConta';
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

type PaletteOption = {
  value: ThemePalette;
  label: string;
  description: string;
  icon: IconName;
  swatches: string[];
};

const PALETTE_OPTIONS: PaletteOption[] = [
  {
    value: 'padrao',
    label: 'Padrão',
    description: 'Azul e neutro, bom para uso diário.',
    icon: 'settings',
    swatches: ['#2563eb', '#7c3aed', '#f9fafb', '#0b1020'],
  },
  {
    value: 'roxo',
    label: 'Roxo',
    description: 'Roxo com contraste mais marcado.',
    icon: 'sparkles',
    swatches: ['#7c5cfc', '#9b4de0', '#f8f5ff', '#151126'],
  },
  {
    value: 'vermelho',
    label: 'Vermelho',
    description: 'Vermelho como cor principal, com apoio azul.',
    icon: 'fire',
    swatches: ['#780000', '#c1121f', '#fdf0d5', '#003049', '#669bbc'],
  },
];

const MODE_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: IconName;
  description: string;
}> = [
  {
    value: 'light',
    label: 'Claro',
    icon: 'sun',
    description: 'Fundos claros e contraste suave.',
  },
  {
    value: 'dark',
    label: 'Escuro',
    icon: 'moon',
    description: 'Fundos escuros e menos brilho.',
  },
];

export default function ConfiguracoesPage() {
  const { usuario, token, logout } = useAuth();
  const { showToast } = useToast();
  const { palette, mode, themeLabel, setPalette, setMode } = useTheme();
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
      showToast('Preferências salvas com sucesso.', 'success');
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
      showToast('Senha alterada com sucesso.', 'success');
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
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <div className="text-center">
          <Icon name="spinner" className="mx-auto mb-4 h-12 w-12 text-app-primary" />
          <p className="text-app-fg">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-app-bg p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-app-fg">
                <Icon name="settings" className="h-8 w-8" />
                Configurações
              </h1>
              <p className="mt-1 text-app-muted">
                Ajuste preferências da conta, aparência e notificações.
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Icon name="back" className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            {erroGlobal && <ErrorAlert message={erroGlobal} />}

            <ConfigSection title="Perfil" icon="user">
              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="flex items-end">
                  <Alert>
                    Para alterar seus dados de perfil, entre em contato com o suporte.
                  </Alert>
                </div>
              </div>
            </ConfigSection>

            <ConfigSection title="Aparência" icon="paint">
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-app-fg">Paleta</p>
                      <p className="text-xs text-app-muted">
                        Escolha a família de cores do site.
                      </p>
                    </div>
                    <p className="text-xs text-app-muted">
                      Tema atual: <strong className="text-app-fg">{themeLabel}</strong>
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {PALETTE_OPTIONS.map((option) => {
                      const isActive = palette === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPalette(option.value)}
                          className={[
                            'rounded-xl border p-4 text-left transition-all',
                            'bg-app-surface hover:border-app-primary hover:bg-app-primary/5',
                            isActive
                              ? 'border-app-primary ring-2 ring-app-primary/25'
                              : 'border-app-border',
                          ].join(' ')}
                          aria-pressed={isActive}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Icon name={option.icon} className="h-5 w-5 text-app-primary" />
                              <span className="font-semibold text-app-fg">{option.label}</span>
                            </div>
                            {isActive && <Icon name="check" className="h-4 w-4 text-app-primary" />}
                          </div>
                          <p className="mt-2 text-sm text-app-muted">{option.description}</p>
                          <div className="mt-4 flex gap-1.5">
                            {option.swatches.map((color) => (
                              <span
                                key={color}
                                className="h-5 w-5 rounded-full border border-app-border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-app-fg">Modo</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {MODE_OPTIONS.map((option) => {
                      const isActive = mode === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMode(option.value)}
                          className={[
                            'flex items-center justify-between rounded-xl border p-4 text-left transition-all',
                            'bg-app-surface hover:border-app-primary hover:bg-app-primary/5',
                            isActive
                              ? 'border-app-primary ring-2 ring-app-primary/25'
                              : 'border-app-border',
                          ].join(' ')}
                          aria-pressed={isActive}
                        >
                          <span className="flex items-center gap-3">
                            <Icon name={option.icon} className="h-5 w-5 text-app-primary" />
                            <span>
                              <span className="block font-semibold text-app-fg">{option.label}</span>
                              <span className="block text-xs text-app-muted">{option.description}</span>
                            </span>
                          </span>
                          {isActive && <Icon name="check" className="h-4 w-4 text-app-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div>
                    <Select
                      label="Idioma"
                      value={idioma}
                      onChange={(e) => setIdioma(e.target.value)}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </Select>
                    <p className="mt-2 text-xs text-app-muted">
                      Idioma da interface do sistema. Mais traduções entram depois.
                    </p>
                  </div>

                  <div className="rounded-xl border border-app-border bg-app-surface p-4">
                    <p className="text-sm font-semibold text-app-fg">
                      Animação 3D de rolagem
                    </p>
                    <p className="mt-1 text-xs text-app-muted">
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
              </div>
            </ConfigSection>

            <ConfigSection title="Notificações" icon="bell">
              <div className="grid gap-3 md:grid-cols-2">
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

            <div className="grid gap-6 lg:grid-cols-2">
              <ConfigSection title="Privacidade e segurança" icon="lock">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setModalSenhaOpen(true)}
                >
                  <Icon name="edit" className="mr-2 h-4 w-4" />
                  Alterar senha
                </Button>
              </ConfigSection>

              <ConfigSection title="Dados e exportação" icon="archive">
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleExportarDados}
                  >
                    <Icon name="copy" className="mr-2 h-4 w-4" />
                    Exportar meus dados (JSON)
                  </Button>
                  <Alert>Seus dados serão baixados em formato JSON.</Alert>
                </div>
              </ConfigSection>
            </div>

            <ConfigSection title="Sobre o sistema" icon="info">
              <div className="grid gap-3 text-sm text-app-muted md:grid-cols-3">
                <p>
                  <strong className="text-app-fg">Versão:</strong> 1.3.0 (Beta)
                </p>
                <p>
                  <strong className="text-app-fg">Sistema:</strong> Jujutsu Kaisen RPG
                </p>
                <p>
                  <strong className="text-app-fg">Atualização:</strong> Janeiro 2026
                </p>
              </div>
              <Link
                href="/compendio"
                className="mt-4 inline-flex items-center gap-1 text-app-primary hover:underline"
              >
                <Icon name="rules" className="h-4 w-4" />
                Abrir compêndio
              </Link>
            </ConfigSection>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSalvarPreferencias}
                disabled={salvando}
              >
                <Icon name="check" className="mr-2 h-4 w-4" />
                {salvando ? 'Salvando...' : 'Salvar preferências'}
              </Button>
            </div>

            <ConfigSection title="Zona de perigo" icon="warning" danger>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <Icon name="back" className="mr-2 h-4 w-4" />
                  Sair da conta
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalExcluirOpen(true)}
                  className="w-full justify-start text-app-danger hover:bg-app-danger/10"
                >
                  <Icon name="delete" className="mr-2 h-4 w-4" />
                  Excluir conta permanentemente
                </Button>
                <Alert variant="error">
                  <strong>Atenção:</strong> esta ação não pode ser desfeita.
                </Alert>
              </div>
            </ConfigSection>
          </div>
        </div>
      </main>

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
