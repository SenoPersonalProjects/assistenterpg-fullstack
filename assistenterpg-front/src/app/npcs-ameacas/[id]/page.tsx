'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  apiDeleteNpcAmeaca,
  apiExportarNpcAmeaca,
  apiGetNpcAmeaca,
} from '@/lib/api/npcs-ameacas';
import { criarErroUsuario } from '@/lib/api/error-handler';
import type { NpcAmeacaDetalhe, UserErrorState } from '@/lib/types';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/context/ToastContext';
import {
  corBadgeFichaTipo,
  labelFichaTipo,
  labelTamanhoNpc,
  labelTipoNpc,
} from '@/components/npc-ameaca/npcAmeacaUi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip, type StatsStripItem } from '@/components/ui/StatsStrip';

function formatarTestePericia(dados: number, bonus?: number): string {
  if (typeof bonus !== 'number') return `${dados}d20`;
  return `${dados}d20 ${bonus >= 0 ? `+${bonus}` : bonus}`;
}

function mensagemErroState(erro: UserErrorState | null | undefined): string {
  if (!erro) return '';
  return typeof erro === 'string' ? erro : erro.message;
}

function baixarJsonArquivo(conteudo: unknown, arquivo: string) {
  const blob = new Blob([JSON.stringify(conteudo, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = arquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function nomeArquivoExportacao(item: NpcAmeacaDetalhe): string {
  const base = item.nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `npc-ameaca-${base || item.id}.json`;
}

type CompactSectionProps = {
  title: string;
  icon?: Parameters<typeof SectionHeader>[0]['icon'];
  children: ReactNode;
  description?: ReactNode;
};

function CompactSection({ title, icon, description, children }: CompactSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-white/5 bg-app-surface/45 p-4 sm:p-5">
      <SectionHeader title={title} icon={icon} description={description} />
      {children}
    </section>
  );
}

export default function NpcAmeacaDetalhePage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idParam);
  const idValido = Number.isFinite(id);

  const [item, setItem] = useState<NpcAmeacaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (!idValido) {
      setErro('ID inválido.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErro(null);
        const dados = await apiGetNpcAmeaca(id);
        setItem(dados);
      } catch (error) {
        setErro(criarErroUsuario(error));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, idValido]);

  const valoresAtributos = useMemo(
    () =>
      item
        ? [
            ['AGI', item.agilidade],
            ['FOR', item.forca],
            ['INT', item.intelecto],
            ['PRE', item.presenca],
            ['VIG', item.vigor],
          ]
        : [],
    [item],
  );

  async function handleExportar() {
    if (!item) return;

    try {
      setProcessando(true);
      const payload = await apiExportarNpcAmeaca(item.id);
      baixarJsonArquivo(payload, nomeArquivoExportacao(item));
      showToast('JSON exportado com sucesso.', 'success');
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setProcessando(false);
    }
  }

  function handleExcluir() {
    if (!item) return;

    confirm({
      title: `Excluir "${item.nome}"?`,
      description: 'Esta ação é irreversível.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setProcessando(true);
          await apiDeleteNpcAmeaca(item.id);
          showToast('Ficha removida com sucesso.', 'success');
          router.push('/npcs-ameacas');
        } catch (error) {
          setErro(criarErroUsuario(error));
        } finally {
          setProcessando(false);
        }
      },
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
        <Loading message="Carregando ficha..." className="text-app-fg" />
      </main>
    );
  }

  if (erro || !item) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
        <EmptyState
          variant="card"
          icon="curse"
          title="Ficha não encontrada"
          description={mensagemErroState(erro) || 'A ficha não existe ou você não tem acesso a ela.'}
          action={
            <Button variant="primary" onClick={() => router.push('/npcs-ameacas')}>
              Voltar para NPCs e Ameaças
            </Button>
          }
        />
      </main>
    );
  }

  const statsItems: StatsStripItem[] = [
    { id: 'vd', label: 'VD', value: item.vd, icon: 'rank' as const, tone: 'primary' as const },
    {
      id: 'defesa',
      label: 'Defesa',
      value: item.defesa,
      icon: 'shield',
      tone: 'warning' as const,
    },
    {
      id: 'pv',
      label: 'PV',
      value: item.pontosVida,
      icon: 'heart',
      tone: 'danger' as const,
      helper: item.machucado !== null ? `Machucado em ${item.machucado}` : undefined,
    },
    {
      id: 'deslocamento',
      label: 'Deslocamento',
      value: `${item.deslocamentoMetros}m`,
      icon: 'target' as const,
    },
    {
      id: 'acoes',
      label: 'Ações',
      value: item.acoes.length,
      icon: 'sword',
      helper: `${item.passivas.length} passiva(s)`,
    },
  ];

  return (
    <>
      <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageHeader
            icon="curse"
            title={item.nome}
            description={item.descricao || `${labelTipoNpc(item.tipo)} • Tamanho ${labelTamanhoNpc(item.tamanho)}`}
            backHref="/npcs-ameacas"
            backLabel="NPCs e Ameaças"
            actions={
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(`/npcs-ameacas/${item.id}/editar`)}
                >
                  <Icon name="edit" className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <EntityActionsMenu
                  ariaLabel="Ações da ficha"
                  items={[
                    {
                      id: 'exportar',
                      label: processando ? 'Exportando...' : 'Exportar JSON',
                      icon: 'download',
                      onSelect: handleExportar,
                      disabled: processando,
                    },
                    {
                      id: 'excluir',
                      label: 'Excluir',
                      icon: 'delete',
                      onSelect: handleExcluir,
                      destructive: true,
                      disabled: processando,
                    },
                  ]}
                />
              </>
            }
          />

          <div className="flex flex-wrap gap-2">
            <Badge color={corBadgeFichaTipo(item.fichaTipo)} size="sm">
              {labelFichaTipo(item.fichaTipo)}
            </Badge>
            <Badge color="purple" size="sm">
              {labelTipoNpc(item.tipo)}
            </Badge>
            <Badge color="blue" size="sm">
              {labelTamanhoNpc(item.tamanho)}
            </Badge>
          </div>

          <StatsStrip items={statsItems} />

          {erro ? <ErrorAlert message={mensagemErroState(erro)} /> : null}

          {item.descricao ? (
            <CompactSection title="Descrição" icon="document">
              <p className="text-sm leading-relaxed text-app-fg">{item.descricao}</p>
            </CompactSection>
          ) : null}

          <CompactSection title="Atributos e perícias" icon="skills">
            <div className="grid gap-3 sm:grid-cols-5">
              {valoresAtributos.map(([label, valor]) => (
                <div key={label} className="rounded-lg border border-white/5 bg-app-bg/55 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
                    {label}
                  </p>
                  <p className="text-xl font-black text-app-fg">{valor}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-2 text-sm text-app-fg sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Percepção', formatarTestePericia(item.percepcaoDados, item.percepcao)],
                ['Iniciativa', formatarTestePericia(item.iniciativaDados, item.iniciativa)],
                ['Fortitude', formatarTestePericia(item.fortitudeDados, item.fortitude)],
                ['Reflexos', formatarTestePericia(item.reflexosDados, item.reflexos)],
                ['Vontade', formatarTestePericia(item.vontadeDados, item.vontade)],
                ['Luta', formatarTestePericia(item.lutaDados, item.luta)],
                ['Jujutsu', formatarTestePericia(item.jujutsuDados, item.jujutsu)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-app-bg/45 px-3 py-2">
                  <span className="text-app-muted">{label}:</span>{' '}
                  <span className="font-semibold text-app-fg">{value}</span>
                </div>
              ))}
            </div>

            {item.periciasEspeciais.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">
                  Perícias especiais
                </p>
                <div className="space-y-2">
                  {item.periciasEspeciais.map((pericia, index) => (
                    <div
                      key={`pericia-${index}`}
                      className="rounded-lg border border-white/5 bg-app-bg/45 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-app-fg">{pericia.nome}</span>
                        <Badge color="blue" size="sm">
                          {pericia.codigo}
                        </Badge>
                        <span className="text-xs font-semibold text-app-muted">
                          {formatarTestePericia(pericia.dados, pericia.bonus)}
                        </span>
                      </div>
                      {pericia.descricao ? (
                        <p className="mt-1 text-sm text-app-muted">{pericia.descricao}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CompactSection>

          <CompactSection title="Resistências e vulnerabilidades" icon="shield">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-app-muted">
                  Resistências
                </p>
                {item.resistencias.length === 0 ? (
                  <p className="text-sm text-app-muted">Nenhuma resistência cadastrada.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {item.resistencias.map((resistencia) => (
                      <Badge key={resistencia} color="blue" size="sm">
                        {resistencia}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-app-muted">
                  Vulnerabilidades
                </p>
                {item.vulnerabilidades.length === 0 ? (
                  <p className="text-sm text-app-muted">Nenhuma vulnerabilidade cadastrada.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {item.vulnerabilidades.map((vulnerabilidade) => (
                      <Badge key={vulnerabilidade} color="red" size="sm">
                        {vulnerabilidade}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CompactSection>

          <CompactSection title="Passivas" icon="sparkles">
            {item.passivas.length === 0 ? (
              <EmptyState
                size="sm"
                icon="sparkles"
                title="Sem passivas"
                description="Nenhuma passiva foi cadastrada para esta ficha."
              />
            ) : (
              <div className="space-y-2">
                {item.passivas.map((passiva, index) => (
                  <article
                    key={`passiva-${index}`}
                    className="rounded-lg border border-white/5 bg-app-bg/45 p-3"
                  >
                    <p className="text-sm font-bold text-app-fg">{passiva.nome}</p>
                    {[passiva.gatilho, passiva.alcance, passiva.alvo, passiva.duracao]
                      .filter(Boolean)
                      .length > 0 ? (
                      <p className="mt-1 text-xs text-app-muted">
                        {[passiva.gatilho, passiva.alcance, passiva.alvo, passiva.duracao]
                          .filter(Boolean)
                          .join(' | ')}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-app-muted">{passiva.descricao}</p>
                    {passiva.requisitos ? (
                      <p className="mt-1 text-xs text-app-muted">
                        Requisitos: {passiva.requisitos}
                      </p>
                    ) : null}
                    {passiva.efeitoGuia ? (
                      <p className="mt-1 text-xs text-app-muted">
                        Efeito guia: {passiva.efeitoGuia}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </CompactSection>

          <CompactSection title="Ações" icon="sword">
            {item.acoes.length === 0 ? (
              <EmptyState
                size="sm"
                icon="sword"
                title="Sem ações"
                description="Nenhuma ação foi cadastrada para esta ficha."
              />
            ) : (
              <div className="space-y-2">
                {item.acoes.map((acao, index) => (
                  <article
                    key={`acao-${index}`}
                    className="space-y-2 rounded-lg border border-white/5 bg-app-bg/45 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-app-fg">{acao.nome}</p>
                      {[acao.tipoExecucao, acao.alcance, acao.alvo, acao.duracao]
                        .filter(Boolean)
                        .map((meta) => (
                          <Badge key={meta} color="gray" size="sm">
                            {meta}
                          </Badge>
                        ))}
                    </div>
                    <p className="text-xs text-app-muted">
                      {[
                        acao.resistencia,
                        acao.dtResistencia ? `DT ${acao.dtResistencia}` : null,
                        typeof acao.custoPE === 'number' ? `PE ${acao.custoPE}` : null,
                        typeof acao.custoEA === 'number' ? `EA ${acao.custoEA}` : null,
                        acao.teste,
                        acao.dano,
                        acao.critico,
                      ]
                        .filter(Boolean)
                        .join(' | ')}
                    </p>
                    {acao.efeito ? <p className="text-sm text-app-muted">{acao.efeito}</p> : null}
                    {acao.requisitos ? (
                      <p className="text-xs text-app-muted">Requisitos: {acao.requisitos}</p>
                    ) : null}
                    {acao.descricao ? (
                      <p className="text-sm text-app-muted">{acao.descricao}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </CompactSection>

          {item.usoTatico ? (
            <CompactSection title="Uso tático" icon="target">
              <p className="text-sm leading-relaxed text-app-fg">{item.usoTatico}</p>
            </CompactSection>
          ) : null}
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
    </>
  );
}
