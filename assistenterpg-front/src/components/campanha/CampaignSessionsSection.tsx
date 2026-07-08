'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiEncerrarSessaoCampanha,
  apiCriarSessaoCampanha,
  apiListarSessoesCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type { SessaoCampanhaResumo , UserErrorState } from '@/lib/types';
import { labelCena } from '@/lib/campanha/sessao-formatters';
import { formatarDataHora } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { SectionHeader } from '@/components/ui/SectionHeader';

type Props = {
  campanhaId: number;
  usuarioEhMestre: boolean;
  onTotalSessoesChange?: (total: number) => void;
  onSessoesChange?: () => void;
};

function corStatusSessao(status: string): 'green' | 'yellow' | 'gray' {
  if (status === 'ENCERRADA') return 'gray';
  if (status === 'PAUSADA') return 'yellow';
  return 'green';
}

export function CampaignSessionsSection({
  campanhaId,
  usuarioEhMestre,
  onTotalSessoesChange,
  onSessoesChange,
}: Props) {
  const router = useRouter();
  const [sessoes, setSessoes] = useState<SessaoCampanhaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [criando, setCriando] = useState(false);
  const [encerrandoSessaoId, setEncerrandoSessaoId] = useState<number | null>(null);
  const [tituloNovaSessao, setTituloNovaSessao] = useState('');
  const onTotalSessoesChangeRef = useRef(onTotalSessoesChange);

  useEffect(() => {
    onTotalSessoesChangeRef.current = onTotalSessoesChange;
  }, [onTotalSessoesChange]);

  const carregarSessoes = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await apiListarSessoesCampanha(campanhaId);
      setSessoes(dados);
      onTotalSessoesChangeRef.current?.(dados.length);
      onSessoesChange?.();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setLoading(false);
    }
  }, [campanhaId, onSessoesChange]);

  useEffect(() => {
    void carregarSessoes();
  }, [carregarSessoes]);

  async function handleCriarSessao() {
    setCriando(true);
    setErro(null);
    try {
      const detalhe = await apiCriarSessaoCampanha(campanhaId, {
        titulo: tituloNovaSessao.trim() || undefined,
      });
      setTituloNovaSessao('');
      await carregarSessoes();
      router.push(`/campanhas/${campanhaId}/sessoes/${detalhe.id}`);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setCriando(false);
    }
  }

  async function handleEncerrarSessao(sessaoId: number) {
    setEncerrandoSessaoId(sessaoId);
    setErro(null);
    try {
      await apiEncerrarSessaoCampanha(campanhaId, sessaoId);
      await carregarSessoes();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setEncerrandoSessaoId(null);
    }
  }

  return (
    <section className="space-y-4">
      {usuarioEhMestre && (
        <PageToolbar>
          <div className="min-w-0 flex-1">
            <SectionHeader
              icon="scroll"
              title="Iniciar nova sessão"
              description="Abra o lobby da campanha com chat e cards dos personagens."
            />
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[28rem] md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                label="Título da sessão (opcional)"
                placeholder="Ex.: Sessão 4 - Distrito de Shibuya"
                value={tituloNovaSessao}
                onChange={(event) => setTituloNovaSessao(event.target.value)}
                maxLength={120}
              />
            </div>
            <Button onClick={handleCriarSessao} disabled={criando || loading}>
              {criando ? 'Iniciando...' : 'Iniciar sessão'}
            </Button>
          </div>
        </PageToolbar>
      )}

      <SectionHeader
        title="Sessões da campanha"
        count={sessoes.length}
        icon="play"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void carregarSessoes()}
            disabled={loading}
          >
            <Icon name="refresh" className="mr-1 h-4 w-4" />
            Atualizar
          </Button>
        }
      />

      {erro ? <ErrorAlert message={erro} /> : null}

      {loading ? (
        <p className="text-sm text-app-muted flex items-center gap-2">
          <Icon name="spinner" className="w-4 h-4" />
          Carregando sessões...
        </p>
      ) : sessoes.length === 0 ? (
        <EmptyState
          variant="session"
          icon="campaign"
          title="Nenhuma sessão iniciada"
          description="Quando uma sessão for iniciada, o lobby aparecerá aqui."
          size="sm"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sessoes.map((sessao) => (
            <article
              key={sessao.id}
              className="space-y-3 rounded-xl border border-white/5 bg-app-surface/45 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-app-fg">
                    {sessao.titulo}
                  </h4>
                  <p className="text-xs text-app-muted">
                    Iniciada em {formatarDataHora(sessao.iniciadoEm)}
                  </p>
                </div>
                <Badge color={corStatusSessao(sessao.status)} size="sm">
                  {sessao.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  color={sessao.cenaAtualTipo === 'COMBATE' ? 'red' : 'blue'}
                  size="sm"
                >
                  {labelCena(sessao.cenaAtualTipo)}
                </Badge>
                {sessao.cenaAtualNome && (
                  <span className="text-xs text-app-muted">
                    {sessao.cenaAtualNome}
                  </span>
                )}
                <Badge color="gray" size="sm">
                  {sessao.controleTurnosAtivo && sessao.rodadaAtual !== null
                    ? `Rodada ${sessao.rodadaAtual}`
                    : 'Cena livre'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-app-muted">
                <Icon name="character-gojo" className="h-4 w-4" />
                {sessao.totalPersonagens} personagem(ns) na sessão
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/campanhas/${campanhaId}/sessoes/${sessao.id}`)
                  }
                >
                  Entrar no lobby
                </Button>
                {usuarioEhMestre && sessao.status !== 'ENCERRADA' ? (
                  <EntityActionsMenu
                    ariaLabel={`Ações da sessão ${sessao.titulo}`}
                    items={[
                      {
                        id: 'encerrar',
                        label:
                          encerrandoSessaoId === sessao.id
                            ? 'Encerrando...'
                            : 'Encerrar sessão',
                        icon: 'stop',
                        destructive: true,
                        disabled: encerrandoSessaoId === sessao.id,
                        onSelect: () => void handleEncerrarSessao(sessao.id),
                      },
                    ]}
                  />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
