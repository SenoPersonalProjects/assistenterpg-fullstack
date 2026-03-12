'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiEncerrarSessaoCampanha,
  apiCriarSessaoCampanha,
  apiListarSessoesCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type { SessaoCampanhaResumo } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';

type Props = {
  campanhaId: number;
  usuarioEhMestre: boolean;
  onTotalSessoesChange?: (total: number) => void;
};

function formatarDataHora(valor: string): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString('pt-BR');
}

function labelCena(tipo: string): string {
  switch (tipo) {
    case 'LIVRE':
      return 'Cena livre';
    case 'INVESTIGACAO':
      return 'Investigacao';
    case 'FURTIVIDADE':
      return 'Furtividade';
    case 'COMBATE':
      return 'Combate';
    default:
      return 'Outra cena';
  }
}

function corStatusSessao(status: string): 'green' | 'yellow' | 'gray' {
  if (status === 'ENCERRADA') return 'gray';
  if (status === 'PAUSADA') return 'yellow';
  return 'green';
}

export function CampaignSessionsSection({
  campanhaId,
  usuarioEhMestre,
  onTotalSessoesChange,
}: Props) {
  const router = useRouter();
  const [sessoes, setSessoes] = useState<SessaoCampanhaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
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
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }, [campanhaId]);

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
      setErro(extrairMensagemErro(error));
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
      setErro(extrairMensagemErro(error));
    } finally {
      setEncerrandoSessaoId(null);
    }
  }

  return (
    <section className="space-y-4">
      {usuarioEhMestre && (
        <div className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
          <h3 className="text-sm font-semibold text-app-fg">
            Iniciar nova sessao
          </h3>
          <p className="text-sm text-app-muted">
            Crie uma sessao para abrir o lobby da campanha com chat e cards dos
            personagens.
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                label="Titulo da sessao (opcional)"
                placeholder="Ex.: Sessao 4 - Distrito de Shibuya"
                value={tituloNovaSessao}
                onChange={(event) => setTituloNovaSessao(event.target.value)}
                maxLength={120}
              />
            </div>
            <Button onClick={handleCriarSessao} disabled={criando || loading}>
              {criando ? 'Iniciando...' : 'Iniciar sessao'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-app-fg">Sessoes da campanha</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void carregarSessoes()}
          disabled={loading}
        >
          <Icon name="refresh" className="w-4 h-4 mr-1" />
          Atualizar
        </Button>
      </div>

      {erro && (
        <p className="rounded border border-app-danger/40 bg-app-danger/10 px-3 py-2 text-sm text-app-danger">
          {erro}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-app-muted flex items-center gap-2">
          <Icon name="spinner" className="w-4 h-4" />
          Carregando sessoes...
        </p>
      ) : sessoes.length === 0 ? (
        <EmptyState
          variant="card"
          icon="campaign"
          title="Nenhuma sessao iniciada"
          description="Quando uma sessao for iniciada, o lobby aparecera aqui."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sessoes.map((sessao) => (
            <Card key={sessao.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-app-fg">
                    {sessao.titulo}
                  </h4>
                  <p className="text-xs text-app-muted">
                    Iniciada em {formatarDataHora(sessao.iniciadoEm)}
                  </p>
                </div>
                <Badge color={corStatusSessao(sessao.status)}>{sessao.status}</Badge>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge color={sessao.cenaAtualTipo === 'COMBATE' ? 'red' : 'blue'}>
                  {labelCena(sessao.cenaAtualTipo)}
                </Badge>
                {sessao.cenaAtualNome && (
                  <span className="text-xs text-app-muted">
                    {sessao.cenaAtualNome}
                  </span>
                )}
              </div>

              {sessao.controleTurnosAtivo && sessao.rodadaAtual !== null ? (
                <p className="text-xs text-app-muted">
                  Rodada atual: {sessao.rodadaAtual}
                </p>
              ) : (
                <p className="text-xs text-app-muted">
                  Cena livre: sem contagem de rodada/turno.
                </p>
              )}

              <p className="text-xs text-app-muted">
                {sessao.totalPersonagens} personagem(ns) na sessao
              </p>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(`/campanhas/${campanhaId}/sessoes/${sessao.id}`)
                }
              >
                Entrar no lobby
              </Button>
              {usuarioEhMestre && sessao.status !== 'ENCERRADA' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleEncerrarSessao(sessao.id)}
                  disabled={encerrandoSessaoId === sessao.id}
                >
                  {encerrandoSessaoId === sessao.id
                    ? 'Encerrando...'
                    : 'Encerrar sessao'}
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
