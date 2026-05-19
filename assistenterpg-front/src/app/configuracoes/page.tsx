// app/configuracoes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
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
import { Card } from '@/components/ui/Card';
import { ModalAlterarSenha } from '@/components/configuracoes/ModalAlterarSenha';
import { ModalExcluirConta } from '@/components/configuracoes/ModalExcluirConta';
import { AppearanceSelector } from '@/components/configuracoes/AppearanceSelector';
import { SettingsSidebar, type SettingsTabId } from '@/components/configuracoes/SettingsSidebar';
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
  const { palette, mode, setPalette, setMode } = useTheme();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [activeTab, setActiveTab] = useState<SettingsTabId>('perfil');
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
  const notificacaoItems: Array<{
    key: keyof typeof notificacoes;
    label: string;
    icon: IconName;
  }> = [
    { key: 'email', label: 'Notificações por email', icon: 'mail' },
    { key: 'push', label: 'Notificações push no navegador', icon: 'bell' },
    { key: 'convites', label: 'Convites para campanhas', icon: 'user' },
    { key: 'atualizacoes', label: 'Novidades do sistema', icon: 'sparkles' },
  ];

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
          <Icon name="spinner" className="mx-auto mb-4 h-12 w-12 text-app-primary animate-spin" />
          <p className="text-app-fg font-bold tracking-tight">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <>
      <main className="min-h-screen bg-app-bg px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-app-primary/10 text-app-primary shadow-inner">
                  <Icon name="settings" className="h-6 w-6" />
                </div>
                <h1 className="text-gradient text-3xl font-black tracking-tighter md:text-4xl">
                  Configurações
                </h1>
              </div>
              <p className="max-w-md text-sm font-medium text-app-muted">
                Ajuste preferências da conta, aparência e notificações.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSalvarPreferencias}
                disabled={salvando}
                className="font-black"
              >
                <Icon name="check" className="mr-2 h-4 w-4" />
                {salvando ? 'Salvando...' : 'Salvar preferências'}
              </Button>
              <Link href="/">
                <Button variant="secondary" size="sm" className="font-bold">
                  <Icon name="back" className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-6">
                <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

                <Card variant="flat" className="p-4 bg-app-danger/5 border border-app-danger/10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-app-danger mb-3">Zona de perigo</h4>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleLogout}
                      className="w-full justify-start text-app-fg hover:bg-app-danger/10"
                    >
                      <Icon name="back" className="mr-2 h-3.5 w-3.5" />
                      Sair da conta
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setModalExcluirOpen(true)}
                      className="w-full justify-start text-app-danger hover:bg-app-danger/10"
                    >
                      <Icon name="delete" className="mr-2 h-3.5 w-3.5" />
                      Excluir conta
                    </Button>
                  </div>
                </Card>
              </div>
            </aside>

            {/* Mobile Nav */}
            <nav className="flex gap-2 overflow-x-auto pb-4 lg:hidden scrollbar-none">
              {[
                { id: 'perfil', label: 'Perfil' },
                { id: 'aparencia', label: 'Aparência' },
                { id: 'notificacoes', label: 'Notificações' },
                { id: 'seguranca', label: 'Segurança' },
                { id: 'dados', label: 'Dados' },
                { id: 'sobre', label: 'Sobre' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTabId)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? 'bg-app-primary text-white shadow-lg'
                      : 'bg-app-surface text-app-muted border border-app-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Content Area */}
            <div className="min-h-[600px] space-y-6">
              {erroGlobal && <ErrorAlert message={erroGlobal} />}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  {activeTab === 'perfil' && (
                    <ConfigSection
                      title="Perfil"
                      icon="user"
                      description="Seus dados de conta."
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                        <Input
                          type="text"
                          label="Nome de usuário"
                          value={usuario?.apelido || ''}
                          disabled
                          className="bg-app-bg/50 font-bold"
                        />
                        <Input
                          type="email"
                          label="Email"
                          value={usuario?.email || ''}
                          disabled
                          className="bg-app-bg/50 font-bold"
                        />
                        <div className="md:col-span-2">
                          <Input
                            type="text"
                            label="ID do usuário"
                            value={usuario?.id || ''}
                            disabled
                            className="bg-app-bg/50 font-mono text-xs opacity-70"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Alert variant="info">
                            Para alterar seus dados de perfil, entre em contato com o suporte.
                          </Alert>
                        </div>
                      </div>
                    </ConfigSection>
                  )}

                  {activeTab === 'aparencia' && (
                    <ConfigSection
                      title="Aparência e Interface"
                      icon="paint"
                      description="Personalize a aparência do site."
                    >
                      <AppearanceSelector
                        palette={palette}
                        mode={mode}
                        onPaletteChange={setPalette}
                        onModeChange={setMode}
                      />

                      <div className="grid gap-6 pt-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Select
                            label="Idioma"
                            value={idioma}
                            onChange={(e) => setIdioma(e.target.value)}
                            className="font-bold"
                          >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                          </Select>
                          <p className="text-[11px] text-app-muted">
                            As traduções estão sendo expandidas gradualmente.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-app-border bg-app-surface/40 p-5">
                          <h4 className="text-xs font-black uppercase tracking-widest text-app-primary mb-3">Imersão</h4>
                          <Checkbox
                            label="Animação 3D de rolagem"
                            checked={animacaoRolagemAtiva}
                            onChange={(e) => handleToggleAnimacaoRolagem(e.target.checked)}
                          />
                          <p className="mt-2 text-[11px] leading-relaxed text-app-muted">
                            Ativa a renderização física dos dados nas sessões. Pode impactar performance em dispositivos antigos.
                          </p>
                        </div>
                      </div>
                    </ConfigSection>
                  )}

                  {activeTab === 'notificacoes' && (
                    <ConfigSection
                      title="Notificações"
                      icon="bell"
                      description="Controle quais avisos do sistema você quer receber."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        {notificacaoItems.map((item) => (
                          <div key={item.key} className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface/40 p-4 transition-all hover:bg-app-surface/60">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-app-primary/10 p-2 text-app-primary">
                                <Icon name={item.icon} className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-bold text-app-fg">{item.label}</span>
                            </div>
                            <Checkbox
                              checked={notificacoes[item.key]}
                              onChange={(e) =>
                                setNotificacoes({ ...notificacoes, [item.key]: e.target.checked })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </ConfigSection>
                  )}

                  {activeTab === 'seguranca' && (
                    <ConfigSection
                      title="Segurança"
                      icon="lock"
                      description="Gerencie o acesso à sua conta."
                    >
                      <div className="max-w-md space-y-4">
                        <Button
                          variant="secondary"
                          onClick={() => setModalSenhaOpen(true)}
                          className="w-full justify-between group"
                        >
                          <span className="flex items-center">
                            <Icon name="edit" className="mr-3 h-4 w-4 text-app-primary" />
                            Alterar senha de acesso
                          </span>
                          <Icon name="next" className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                        </Button>
                        <Alert>
                          Recomendamos trocar sua senha periodicamente para manter sua conta segura.
                        </Alert>
                      </div>
                    </ConfigSection>
                  )}

                  {activeTab === 'dados' && (
                    <ConfigSection
                      title="Arquivo e Exportação"
                      icon="archive"
                      description="Gerencie seus registros e dados acumulados."
                    >
                      <div className="max-w-md space-y-4">
                        <Button
                          variant="secondary"
                          onClick={handleExportarDados}
                          className="w-full justify-between group"
                        >
                          <span className="flex items-center">
                            <Icon name="copy" className="mr-3 h-4 w-4 text-app-primary" />
                            Exportar meus dados (JSON)
                          </span>
                          <Icon name="download" className="h-4 w-4 opacity-0 transition-all group-hover:translate-y-1 group-hover:opacity-100" />
                        </Button>
                        <Alert variant="info">
                          Seus dados serão compilados em um arquivo JSON universal para backup ou migração.
                        </Alert>
                      </div>
                    </ConfigSection>
                  )}

                  {activeTab === 'sobre' && (
                    <ConfigSection
                      title="Sobre o sistema"
                      icon="info"
                      description="Informações técnicas sobre o Assistente RPG."
                    >
                      <div className="grid gap-6 md:grid-cols-3">
                        <Card variant="flat" className="bg-app-surface/30 p-4 border border-app-border/50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-app-muted mb-1">Versão</p>
                          <p className="text-lg font-black text-app-fg">1.3.0 <span className="text-xs text-app-primary">Beta</span></p>
                        </Card>
                        <Card variant="flat" className="bg-app-surface/30 p-4 border border-app-border/50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-app-muted mb-1">Universo</p>
                          <p className="text-lg font-black text-app-fg">Era Jujutsu</p>
                        </Card>
                        <Card variant="flat" className="bg-app-surface/30 p-4 border border-app-border/50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-app-muted mb-1">Atualização</p>
                          <p className="text-lg font-black text-app-fg">Maio 2026</p>
                        </Card>
                      </div>

                      <div className="flex flex-col gap-3 pt-4">
                        <Link
                          href="/compendio"
                          className="group inline-flex items-center gap-2 text-sm font-black text-app-primary transition-all hover:translate-x-1"
                        >
                          <div className="rounded-lg bg-app-primary/10 p-2">
                            <Icon name="rules" className="h-4 w-4" />
                          </div>
                          Abrir compêndio
                        </Link>
                        <p className="max-w-xl text-xs leading-relaxed text-app-muted">
                          Este assistente ajuda mestres e jogadores a organizar campanhas, personagens, regras e sessões no Era Jujutsu RPG.
                        </p>
                      </div>
                    </ConfigSection>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
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
