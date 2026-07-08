// src/app/homebrews/[id]/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiArquivarHomebrew,
  apiDeleteHomebrew,
  apiExportarHomebrew,
  apiGetHomebrew,
  apiPublicarHomebrew,
  HomebrewDetalhado,
  TipoHomebrewConteudo,
} from '@/lib/api/homebrews';
import { criarErroUsuario } from '@/lib/api/error-handler';
import { StatusPublicacao } from '@/lib/types/homebrew-enums';
import { useConfirm } from '@/hooks/useConfirm';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityActionsMenu } from '@/components/ui/EntityActionsMenu';
import { InfoTile } from '@/components/ui/InfoTile';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatsStrip } from '@/components/ui/StatsStrip';
import type { UserErrorState } from '@/lib/types';

type TecnicaHabilidadeDados = {
  nome?: string;
  codigo?: string;
  execucao?: string;
  descricao?: string;
  custoPE?: number | string;
  custoEA?: number | string;
  alcance?: string;
  area?: string;
  duracao?: string;
  resistencia?: string;
  efeito?: string;
  aprimoramentos?: unknown[];
};

type HomebrewDados = {
  [key: string]: unknown;
  tecnicaInataId?: number | string | null;
  caracteristicas?: unknown;
  requisitos?: unknown;
  pericias?: string[];
  habilidades?: unknown;
  classeId?: number | string | null;
  nivelRequisito?: number | string | null;
  categoria?: string;
  espacos?: number | string | null;
  descricao?: string | null;
  proficienciaArma?: string | null;
  empunhaduras?: string[];
  tipoArma?: string | null;
  alcance?: string | null;
  danos?: unknown;
  criticoValor?: number | string | null;
  criticoMultiplicador?: number | string | null;
  agil?: boolean | null;
  proficienciaProtecao?: string | null;
  tipoProtecao?: string | null;
  bonusDefesa?: number | string | null;
  penalidadeCarga?: number | string | null;
  reducoesDano?: unknown[];
  tipoAcessorio?: string | null;
  bonusPE?: number | string | null;
  bonusPV?: number | string | null;
  duracaoCenas?: number | string | null;
  recuperavel?: boolean | null;
  tipoExplosivo?: string | null;
  efeito?: string | null;
  tipoAmaldicoado?: string | null;
  armaAmaldicoada?: unknown;
  protecaoAmaldicoada?: unknown;
  artefatoAmaldicoado?: unknown;
  efeitos?: string | null;
  mecanicas?: unknown;
  tipo?: string | null;
};

function asHomebrewDados(value: unknown): HomebrewDados {
  return value && typeof value === 'object' ? (value as HomebrewDados) : {};
}

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== '';
}

const TIPO_LABELS: Record<TipoHomebrewConteudo, string> = {
  CLA: 'Clã',
  ORIGEM: 'Origem',
  TRILHA: 'Trilha',
  CAMINHO: 'Caminho',
  EQUIPAMENTO: 'Equipamento',
  PODER_GENERICO: 'Poder Genérico',
  TECNICA_AMALDICOADA: 'Técnica Amaldiçoada',
};

const TIPO_ICONS: Record<TipoHomebrewConteudo, string> = {
  CLA: 'clan',
  ORIGEM: 'story',
  TRILHA: 'school',
  CAMINHO: 'map',
  EQUIPAMENTO: 'item',
  PODER_GENERICO: 'sparkles',
  TECNICA_AMALDICOADA: 'technique',
};

const STATUS_COLOR: Record<string, 'green' | 'yellow' | 'gray'> = {
  PUBLICADO: 'green',
  RASCUNHO: 'yellow',
  ARQUIVADO: 'gray',
};

function formatarData(valor?: string) {
  if (!valor) return 'Não informado';
  return new Date(valor).toLocaleDateString('pt-BR');
}

function baixarJsonArquivo(conteudo: unknown, nomeArquivo: string) {
  const blob = new Blob([JSON.stringify(conteudo, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = nomeArquivo;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function HomebrewDetalhePage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();
  const homebrewIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const homebrewId = Number(homebrewIdParam);
  const homebrewIdValido = Number.isFinite(homebrewId);

  const [homebrew, setHomebrew] = useState<HomebrewDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [processando, setProcessando] = useState(false);

  const carregarHomebrew = useCallback(async () => {
    if (!homebrewIdValido) {
      setErro('ID de homebrew inválido.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      const data = await apiGetHomebrew(homebrewId);
      setHomebrew(data);
    } catch (error) {
      const mensagem = criarErroUsuario(error);
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }, [homebrewId, homebrewIdValido]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      carregarHomebrew();
    }
  }, [authLoading, usuario, router, carregarHomebrew]);

  const isOwner = homebrew?.usuarioId === usuario?.id;
  const podeEditar = Boolean(isOwner && homebrew?.status !== StatusPublicacao.ARQUIVADO);
  const podePublicar = Boolean(isOwner && homebrew?.status === StatusPublicacao.RASCUNHO);
  const podeArquivar = Boolean(isOwner && homebrew?.status === StatusPublicacao.PUBLICADO);

  const statsItems = useMemo(
    () =>
      homebrew
        ? [
            {
              id: 'tipo',
              label: 'Tipo',
              value: TIPO_LABELS[homebrew.tipo],
              icon: TIPO_ICONS[homebrew.tipo] as IconName,
              tone: 'primary' as const,
            },
            {
              id: 'status',
              label: 'Status',
              value: homebrew.status,
              icon: homebrew.status === StatusPublicacao.PUBLICADO ? ('check' as const) : ('archive' as const),
              tone:
                homebrew.status === StatusPublicacao.PUBLICADO
                  ? ('success' as const)
                  : homebrew.status === StatusPublicacao.RASCUNHO
                    ? ('warning' as const)
                    : ('default' as const),
            },
            {
              id: 'versao',
              label: 'Versão',
              value: homebrew.versao,
              icon: 'book' as const,
            },
            {
              id: 'autor',
              label: 'Criado por',
              value: homebrew.usuarioApelido ?? 'Desconhecido',
              helper: formatarData(homebrew.criadoEm),
              icon: 'user' as const,
            },
          ]
        : [],
    [homebrew],
  );

  async function handlePublicar() {
    if (!homebrew) return;

    try {
      setProcessando(true);
      await apiPublicarHomebrew(homebrew.id);
      setHomebrew((prev) => (prev ? { ...prev, status: StatusPublicacao.PUBLICADO } : prev));
      showToast(`Homebrew "${homebrew.nome}" publicado com sucesso!`, 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setProcessando(false);
    }
  }

  async function handleArquivar() {
    if (!homebrew) return;

    try {
      setProcessando(true);
      await apiArquivarHomebrew(homebrew.id);
      setHomebrew((prev) => (prev ? { ...prev, status: StatusPublicacao.ARQUIVADO } : prev));
      showToast(`Homebrew "${homebrew.nome}" arquivado.`, 'info');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setProcessando(false);
    }
  }

  async function handleExportar() {
    if (!homebrew) return;

    try {
      setProcessando(true);
      const payload = await apiExportarHomebrew(homebrew.id);
      baixarJsonArquivo(payload, `homebrew-${homebrew.codigo}.json`);
      showToast(`JSON de "${homebrew.nome}" exportado.`, 'success');
    } catch (error) {
      const userError = criarErroUsuario(error);
      showToast(userError.message, 'error', { support: userError });
    } finally {
      setProcessando(false);
    }
  }

  function handleExcluir() {
    if (!homebrew) return;

    confirm({
      title: `Excluir homebrew "${homebrew.nome}"?`,
      description: 'Esta ação é irreversível.',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setProcessando(true);
          await apiDeleteHomebrew(homebrew.id);
          showToast('Homebrew excluído com sucesso!', 'success');
          router.push('/homebrews');
        } catch (error) {
          const userError = criarErroUsuario(error);
          showToast(userError.message, 'error', { support: userError });
        } finally {
          setProcessando(false);
        }
      },
    });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando homebrew..." className="text-app-fg" />
      </div>
    );
  }

  if (erro || !homebrew) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
        <EmptyState
          variant="card"
          icon="sparkles"
          title="Homebrew não encontrado"
          description={
            typeof erro === 'string'
              ? erro
              : erro?.message ?? 'Não foi possível carregar o conteúdo solicitado.'
          }
          actionLabel="Voltar para homebrews"
          onAction={() => router.push('/homebrews')}
        />
      </main>
    );
  }

  const headerActions = (
    <>
      {podeEditar ? (
        <Button size="sm" onClick={() => router.push(`/homebrews/${homebrewId}/editar`)}>
          <Icon name="edit" className="mr-2 h-4 w-4" />
          Editar
        </Button>
      ) : null}
      {isOwner ? (
        <EntityActionsMenu
          ariaLabel="Ações do homebrew"
          items={[
            {
              id: 'publish',
              label: processando ? 'Publicando...' : 'Publicar',
              icon: processando ? 'loading' : 'check',
              onSelect: handlePublicar,
              disabled: processando,
              hidden: !podePublicar,
            },
            {
              id: 'archive',
              label: processando ? 'Arquivando...' : 'Arquivar',
              icon: processando ? 'loading' : 'archive',
              onSelect: handleArquivar,
              disabled: processando,
              hidden: !podeArquivar,
            },
            {
              id: 'export',
              label: processando ? 'Exportando...' : 'Exportar JSON',
              icon: processando ? 'loading' : 'download',
              onSelect: handleExportar,
              disabled: processando,
            },
            {
              id: 'delete',
              label: processando ? 'Excluindo...' : 'Excluir',
              icon: processando ? 'loading' : 'delete',
              onSelect: handleExcluir,
              disabled: processando,
              destructive: true,
            },
          ]}
        />
      ) : null}
    </>
  );

  return (
    <main className="min-h-screen bg-app-bg px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <PageHeader
          icon={TIPO_ICONS[homebrew.tipo] as IconName}
          eyebrow={TIPO_LABELS[homebrew.tipo]}
          title={homebrew.nome}
          description={homebrew.descricao ?? 'Conteúdo homebrew customizado para campanhas.'}
          backHref="/homebrews"
          backLabel="Homebrews"
          actions={headerActions}
        />

        <div className="flex flex-wrap gap-2">
          <Badge color={STATUS_COLOR[homebrew.status]} size="sm">
            {homebrew.status}
          </Badge>
          <Badge color="gray" size="sm">
            Código {homebrew.codigo}
          </Badge>
          <Badge color="gray" size="sm">
            Atualizado em {formatarData(homebrew.atualizadoEm)}
          </Badge>
        </div>

        {homebrew.tags && homebrew.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {homebrew.tags.map((tag, idx) => (
              <Badge key={idx} color="blue" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <StatsStrip items={statsItems} />

        <RenderDadosEspecificos tipo={homebrew.tipo} dados={homebrew.dados} />

        <section className="space-y-3">
          <SectionHeader
            title="Dados brutos"
            description="Referência técnica para conferência do payload JSON."
            icon="code"
          />
          <details className="rounded-xl border border-white/5 bg-app-surface/45 p-3">
            <summary className="cursor-pointer text-xs font-bold text-app-fg">
              Ver JSON completo
            </summary>
            <pre className="mt-3 max-h-96 overflow-auto text-[10px] text-app-muted">
              {JSON.stringify(homebrew.dados, null, 2)}
            </pre>
          </details>
        </section>
      </div>

      {options ? (
        <ConfirmDialog
          isOpen={isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={options.title}
          description={options.description}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          variant={options.variant}
        />
      ) : null}
    </main>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR: Renderizar dados específicos por tipo
// ============================================================================

type RenderProps = {
  tipo: TipoHomebrewConteudo;
  dados: unknown;
};

function RenderDadosEspecificos({ tipo, dados }: RenderProps) {
  const dadosNormalizados = asHomebrewDados(dados);
  if (Object.keys(dadosNormalizados).length === 0) {
    return (
      <EmptyState
        variant="session"
        size="sm"
        icon="info"
        title="Nenhum dado específico"
        description="Este homebrew ainda não possui dados específicos cadastrados."
      />
    );
  }

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Dados específicos"
        description="Informações estruturadas conforme o tipo deste homebrew."
        icon="rules"
      />
      <div className="rounded-xl border border-white/5 bg-app-surface/45 p-4">
        <div className="space-y-4">
        {tipo === 'CLA' && <RenderCla dados={dadosNormalizados} />}
        {tipo === 'ORIGEM' && <RenderOrigem dados={dadosNormalizados} />}
        {tipo === 'TRILHA' && <RenderTrilha dados={dadosNormalizados} />}
        {tipo === 'CAMINHO' && <RenderCaminho dados={dadosNormalizados} />}
        {tipo === 'EQUIPAMENTO' && <RenderEquipamento dados={dadosNormalizados} />}
        {tipo === 'PODER_GENERICO' && <RenderPoderGenerico dados={dadosNormalizados} />}
        {tipo === 'TECNICA_AMALDICOADA' && <RenderTecnicaAmaldicoada dados={dadosNormalizados} />}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// RENDERIZADORES ESPECÍFICOS (BASEADOS NOS DTOS)
// ============================================================================

function RenderCla({ dados }: { dados: HomebrewDados }) {
  return (
    <div className="space-y-3 text-sm">
      {hasValue(dados.tecnicaInataId) && (
        <InfoTile label="ID da Técnica Inata" value={String(dados.tecnicaInataId)} />
      )}
      {hasValue(dados.caracteristicas) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Características</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3 overflow-auto max-h-48">
            {JSON.stringify(dados.caracteristicas, null, 2)}
          </pre>
        </div>
      )}
      {hasValue(dados.requisitos) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Requisitos</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3 overflow-auto max-h-48">
            {typeof dados.requisitos === 'string'
              ? dados.requisitos
              : JSON.stringify(dados.requisitos, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function RenderOrigem({ dados }: { dados: HomebrewDados }) {
  return (
    <div className="space-y-3 text-sm">
      {hasValue(dados.pericias) && Array.isArray(dados.pericias) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Perícias</p>
          <div className="flex flex-wrap gap-2">
            {dados.pericias.map((p: string, idx: number) => (
              <Badge key={idx} color="blue" size="sm">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {hasValue(dados.habilidades) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Habilidades Iniciais</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3 overflow-auto max-h-48">
            {JSON.stringify(dados.habilidades, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function RenderTrilha({ dados }: { dados: HomebrewDados }) {
  return (
    <div className="space-y-3 text-sm">
      {hasValue(dados.classeId) && <InfoTile label="ID da Classe" value={String(dados.classeId)} />}
      {hasValue(dados.nivelRequisito) && (
        <InfoTile label="Nível de Requisito" value={String(dados.nivelRequisito)} />
      )}
      {hasValue(dados.habilidades) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Habilidades por Nível</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3 overflow-auto max-h-64">
            {JSON.stringify(dados.habilidades, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function RenderCaminho({ dados }: { dados: HomebrewDados }) {
  return (
    <div className="space-y-3 text-sm">
      {hasValue(dados.requisitos) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Requisitos</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3 overflow-auto max-h-32">
            {typeof dados.requisitos === 'string'
              ? dados.requisitos
              : JSON.stringify(dados.requisitos, null, 2)}
          </pre>
        </div>
      )}
      {hasValue(dados.habilidades) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Habilidades do Caminho</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3 overflow-auto max-h-64">
            {JSON.stringify(dados.habilidades, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function RenderEquipamento({ dados }: { dados: HomebrewDados }) {
  const { categoria } = dados;

  return (
    <div className="space-y-4 text-sm">
      {/* Campos base */}
      {categoria && <InfoTile label="Categoria" value={categoria} />}
      {dados.espacos != null && <InfoTile label="Espaços" value={String(dados.espacos)} />}
      {hasValue(dados.descricao) && <InfoTile label="Descrição" value={dados.descricao} />}

      {/* ARMA */}
      {categoria === 'ARMA' && hasValue(dados.proficienciaArma) && (
        <>
          <InfoTile label="Proficiência" value={dados.proficienciaArma} />
          {Array.isArray(dados.empunhaduras) && (
            <InfoTile label="Empunhaduras" value={dados.empunhaduras.join(', ')} />
          )}
          {hasValue(dados.tipoArma) && <InfoTile label="Tipo de Arma" value={dados.tipoArma} />}
          {hasValue(dados.alcance) && <InfoTile label="Alcance" value={dados.alcance} />}
          {hasValue(dados.danos) && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Danos</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.danos, null, 2)}
              </pre>
            </div>
          )}
          {dados.criticoValor != null && (
            <InfoTile label="Crítico" value={`${dados.criticoValor}x (${dados.criticoMultiplicador})`} />
          )}
          {dados.agil != null && <InfoTile label="Ágil" value={dados.agil ? 'Sim' : 'Não'} />}
        </>
      )}

      {/* PROTEÇÃO */}
      {categoria === 'PROTECAO' && hasValue(dados.proficienciaProtecao) && (
        <>
          <InfoTile label="Proficiência" value={dados.proficienciaProtecao} />
          {hasValue(dados.tipoProtecao) && <InfoTile label="Tipo" value={dados.tipoProtecao} />}
          {dados.bonusDefesa != null && <InfoTile label="Bônus Defesa" value={String(dados.bonusDefesa)} />}
          {dados.penalidadeCarga != null && (
            <InfoTile label="Penalidade de Carga" value={String(dados.penalidadeCarga)} />
          )}
          {Array.isArray(dados.reducoesDano) && dados.reducoesDano.length > 0 && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Reduções de Dano</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.reducoesDano, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {/* ACESSÓRIO */}
      {categoria === 'ACESSORIO' && hasValue(dados.tipoAcessorio) && (
        <>
          <InfoTile label="Tipo de Acessório" value={dados.tipoAcessorio} />
          {dados.bonusPE != null && <InfoTile label="Bônus PE" value={String(dados.bonusPE)} />}
          {dados.bonusPV != null && <InfoTile label="Bônus PV" value={String(dados.bonusPV)} />}
        </>
      )}

      {/* MUNIÇÃO */}
      {categoria === 'MUNICAO' && (
        <>
          {hasValue(dados.duracaoCenas) && <InfoTile label="Duração (cenas)" value={dados.duracaoCenas} />}
          {dados.recuperavel != null && (
            <InfoTile label="Recuperável" value={dados.recuperavel ? 'Sim' : 'Não'} />
          )}
        </>
      )}

      {/* EXPLOSIVO */}
      {categoria === 'EXPLOSIVO' && (
        <>
          {hasValue(dados.tipoExplosivo) && <InfoTile label="Tipo" value={dados.tipoExplosivo} />}
          {hasValue(dados.efeito) && <InfoTile label="Efeito" value={dados.efeito} />}
        </>
      )}

      {/* FERRAMENTA AMALDIÇOADA */}
      {categoria === 'FERRAMENTA_AMALDICOADA' && hasValue(dados.tipoAmaldicoado) && (
        <>
          <InfoTile label="Tipo Amaldiçoado" value={dados.tipoAmaldicoado} />
          {hasValue(dados.armaAmaldicoada) && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Arma Amaldiçoada</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.armaAmaldicoada, null, 2)}
              </pre>
            </div>
          )}
          {hasValue(dados.protecaoAmaldicoada) && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Proteção Amaldiçoada</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.protecaoAmaldicoada, null, 2)}
              </pre>
            </div>
          )}
          {hasValue(dados.artefatoAmaldicoado) && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Artefato Amaldiçoado</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.artefatoAmaldicoado, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {/* ITEM OPERACIONAL */}
      {categoria === 'ITEM_OPERACIONAL' && hasValue(dados.efeito) && (
        <InfoTile label="Efeito" value={dados.efeito} />
      )}

      {/* ITEM AMALDIÇOADO */}
      {categoria === 'ITEM_AMALDICOADO' && (
        <>
          {hasValue(dados.tipoAmaldicoado) && <InfoTile label="Tipo" value={dados.tipoAmaldicoado} />}
          {hasValue(dados.efeito) && <InfoTile label="Efeito" value={dados.efeito} />}
        </>
      )}
    </div>
  );
}

function RenderPoderGenerico({ dados }: { dados: HomebrewDados }) {
  return (
    <div className="space-y-3 text-sm">
      {hasValue(dados.requisitos) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Requisitos</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3">
            {typeof dados.requisitos === 'string'
              ? dados.requisitos
              : JSON.stringify(dados.requisitos, null, 2)}
          </pre>
        </div>
      )}
      {hasValue(dados.efeitos) && <InfoTile label="Efeitos" value={dados.efeitos} />}
      {hasValue(dados.mecanicas) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Mecânicas Especiais</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3">
            {typeof dados.mecanicas === 'string'
              ? dados.mecanicas
              : JSON.stringify(dados.mecanicas, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function RenderTecnicaAmaldicoada({ dados }: { dados: HomebrewDados }) {
  const habilidades: TecnicaHabilidadeDados[] = Array.isArray(dados.habilidades)
    ? dados.habilidades.filter(
        (habilidade): habilidade is TecnicaHabilidadeDados =>
          !!habilidade && typeof habilidade === 'object',
      )
    : [];

  return (
    <div className="space-y-4 text-sm">
      {/* Campos base */}
      {hasValue(dados.tipo) && <InfoTile label="Tipo" value={dados.tipo} />}
      {hasValue(dados.descricao) && <InfoTile label="Descrição" value={dados.descricao} />}

      {/* Habilidades */}
      {habilidades.length > 0 && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-3">Habilidades</p>
          <div className="space-y-4">
            {habilidades.map((hab, idx) => (
              <div key={idx} className="border border-app-border rounded-lg p-4 bg-app-base">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-app-fg">{hab.nome}</p>
                    <p className="text-xs text-app-muted">Código: {hab.codigo}</p>
                  </div>
                  <Badge color="purple" size="sm">
                    {hab.execucao}
                  </Badge>
                </div>

                <p className="text-xs text-app-muted mb-3">{hab.descricao}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <InfoTile label="Custo PE" value={String(hab.custoPE)} />
                  <InfoTile label="Custo EA" value={String(hab.custoEA)} />
                  {hab.alcance && <InfoTile label="Alcance" value={hab.alcance} />}
                  {hab.area && <InfoTile label="Área" value={hab.area} />}
                  {hab.duracao && <InfoTile label="Duração" value={hab.duracao} />}
                  {hab.resistencia && <InfoTile label="Resistência" value={hab.resistencia} />}
                </div>

                {hab.efeito && (
                  <div className="mt-3 pt-3 border-t border-app-border">
                    <p className="text-xs font-medium text-app-muted mb-1">Efeito</p>
                    <p className="text-xs text-app-fg">{hab.efeito}</p>
                  </div>
                )}

                {hab.aprimoramentos && hab.aprimoramentos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-app-border">
                    <p className="text-xs font-medium text-app-muted mb-2">Aprimoramentos</p>
                    <pre className="text-[10px] bg-app-muted-surface border border-app-border rounded p-2 overflow-auto max-h-32">
                      {JSON.stringify(hab.aprimoramentos, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

