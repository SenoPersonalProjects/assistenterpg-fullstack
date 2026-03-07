// src/app/homebrews/[id]/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiGetHomebrew, HomebrewDetalhado, TipoHomebrewConteudo } from '@/lib/api/homebrews';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoTile } from '@/components/ui/InfoTile';

type Props = {
  params: {
    id: string;
  };
};

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
  CLA: 'ClÃ£',
  ORIGEM: 'Origem',
  TRILHA: 'Trilha',
  CAMINHO: 'Caminho',
  EQUIPAMENTO: 'Equipamento',
  PODER_GENERICO: 'Poder GenÃ©rico',
  TECNICA_AMALDICOADA: 'TÃ©cnica AmaldiÃ§oada',
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

export default function HomebrewDetalhePage({ params }: Props) {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const homebrewId = Number(params.id);

  const [homebrew, setHomebrew] = useState<HomebrewDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarHomebrew = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await apiGetHomebrew(homebrewId);
      setHomebrew(data);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }, [homebrewId]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      carregarHomebrew();
    }
  }, [authLoading, usuario, router, carregarHomebrew]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando homebrew..." className="text-app-fg" />
      </div>
    );
  }

  if (erro || !homebrew) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <ErrorAlert message={erro ?? 'Homebrew nÃ£o encontrado'} />
          <Button variant="secondary" onClick={() => router.push('/homebrews')}>
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar para homebrews
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = homebrew.usuarioId === usuario?.id;

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name={TIPO_ICONS[homebrew.tipo] as IconName} className="w-7 h-7 text-app-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-3xl font-bold text-app-fg">{homebrew.nome}</h1>
                <Badge color={STATUS_COLOR[homebrew.status]} size="sm">
                  {homebrew.status}
                </Badge>
              </div>
              <p className="text-sm text-app-muted">
                {TIPO_LABELS[homebrew.tipo]} â€¢ v{homebrew.versao}
              </p>
              {homebrew.descricao && (
                <p className="text-sm text-app-muted mt-2 leading-relaxed">{homebrew.descricao}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {isOwner && (
              <Button size="sm" onClick={() => router.push(`/homebrews/${homebrewId}/editar`)}>
                <Icon name="edit" className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => router.push('/homebrews')}>
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>

        {/* Tags */}
        {homebrew.tags && homebrew.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {homebrew.tags.map((tag, idx) => (
              <Badge key={idx} color="blue" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* InformaÃ§Ãµes gerais */}
        <Card>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-app-fg mb-3">InformaÃ§Ãµes gerais</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="Tipo" value={TIPO_LABELS[homebrew.tipo]} />
              <InfoTile label="VersÃ£o" value={homebrew.versao} />
              <InfoTile label="Criado por" value={homebrew.usuarioApelido ?? 'Desconhecido'} />
              <InfoTile
                label="Criado em"
                value={new Date(homebrew.criadoEm).toLocaleDateString('pt-BR')}
              />
            </div>
          </div>
        </Card>

        {/* Dados especÃ­ficos */}
        <RenderDadosEspecificos tipo={homebrew.tipo} dados={homebrew.dados} />

        {/* JSON Debug */}
        <SectionCard
          title="Dados brutos (Debug)"
          right={<Icon name="code" className="w-5 h-5 text-app-muted" />}
          contentClassName="space-y-2"
        >
          <details className="rounded border border-app-border bg-app-base p-3">
            <summary className="cursor-pointer text-xs font-medium text-app-fg">
              Ver JSON completo
            </summary>
            <pre className="mt-3 max-h-96 overflow-auto text-[10px] text-app-muted">
              {JSON.stringify(homebrew.dados, null, 2)}
            </pre>
          </details>
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR: Renderizar dados especÃ­ficos por tipo
// ============================================================================

type RenderProps = {
  tipo: TipoHomebrewConteudo;
  dados: unknown;
};

function RenderDadosEspecificos({ tipo, dados }: RenderProps) {
  const dadosNormalizados = asHomebrewDados(dados);
  if (Object.keys(dadosNormalizados).length === 0) {
    return (
      <Card>
        <p className="text-sm text-app-muted italic">Nenhum dado especÃ­fico cadastrado.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-app-fg">Dados especÃ­ficos</h2>

        {tipo === 'CLA' && <RenderCla dados={dadosNormalizados} />}
        {tipo === 'ORIGEM' && <RenderOrigem dados={dadosNormalizados} />}
        {tipo === 'TRILHA' && <RenderTrilha dados={dadosNormalizados} />}
        {tipo === 'CAMINHO' && <RenderCaminho dados={dadosNormalizados} />}
        {tipo === 'EQUIPAMENTO' && <RenderEquipamento dados={dadosNormalizados} />}
        {tipo === 'PODER_GENERICO' && <RenderPoderGenerico dados={dadosNormalizados} />}
        {tipo === 'TECNICA_AMALDICOADA' && <RenderTecnicaAmaldicoada dados={dadosNormalizados} />}
      </div>
    </Card>
  );
}

// ============================================================================
// RENDERIZADORES ESPECÃFICOS (BASEADOS NOS DTOS)
// ============================================================================

function RenderCla({ dados }: { dados: HomebrewDados }) {
  return (
    <div className="space-y-3 text-sm">
      {hasValue(dados.tecnicaInataId) && (
        <InfoTile label="ID da TÃ©cnica Inata" value={String(dados.tecnicaInataId)} />
      )}
      {hasValue(dados.caracteristicas) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">CaracterÃ­sticas</p>
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
          <p className="text-xs font-medium text-app-muted mb-2">PerÃ­cias</p>
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
        <InfoTile label="NÃ­vel de Requisito" value={String(dados.nivelRequisito)} />
      )}
      {hasValue(dados.habilidades) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Habilidades por NÃ­vel</p>
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
      {dados.espacos != null && <InfoTile label="EspaÃ§os" value={String(dados.espacos)} />}
      {hasValue(dados.descricao) && <InfoTile label="DescriÃ§Ã£o" value={dados.descricao} />}

      {/* ARMA */}
      {categoria === 'ARMA' && hasValue(dados.proficienciaArma) && (
        <>
          <InfoTile label="ProficiÃªncia" value={dados.proficienciaArma} />
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
            <InfoTile label="CrÃ­tico" value={`${dados.criticoValor}x (${dados.criticoMultiplicador})`} />
          )}
          {dados.agil != null && <InfoTile label="Ãgil" value={dados.agil ? 'Sim' : 'NÃ£o'} />}
        </>
      )}

      {/* PROTEÃ‡ÃƒO */}
      {categoria === 'PROTECAO' && hasValue(dados.proficienciaProtecao) && (
        <>
          <InfoTile label="ProficiÃªncia" value={dados.proficienciaProtecao} />
          {hasValue(dados.tipoProtecao) && <InfoTile label="Tipo" value={dados.tipoProtecao} />}
          {dados.bonusDefesa != null && <InfoTile label="BÃ´nus Defesa" value={String(dados.bonusDefesa)} />}
          {dados.penalidadeCarga != null && (
            <InfoTile label="Penalidade de Carga" value={String(dados.penalidadeCarga)} />
          )}
          {Array.isArray(dados.reducoesDano) && dados.reducoesDano.length > 0 && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">ReduÃ§Ãµes de Dano</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.reducoesDano, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {/* ACESSÃ“RIO */}
      {categoria === 'ACESSORIO' && hasValue(dados.tipoAcessorio) && (
        <>
          <InfoTile label="Tipo de AcessÃ³rio" value={dados.tipoAcessorio} />
          {dados.bonusPE != null && <InfoTile label="BÃ´nus PE" value={String(dados.bonusPE)} />}
          {dados.bonusPV != null && <InfoTile label="BÃ´nus PV" value={String(dados.bonusPV)} />}
        </>
      )}

      {/* MUNIÃ‡ÃƒO */}
      {categoria === 'MUNICAO' && (
        <>
          {hasValue(dados.duracaoCenas) && <InfoTile label="DuraÃ§Ã£o (cenas)" value={dados.duracaoCenas} />}
          {dados.recuperavel != null && (
            <InfoTile label="RecuperÃ¡vel" value={dados.recuperavel ? 'Sim' : 'NÃ£o'} />
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

      {/* FERRAMENTA AMALDIÃ‡OADA */}
      {categoria === 'FERRAMENTA_AMALDICOADA' && hasValue(dados.tipoAmaldicoado) && (
        <>
          <InfoTile label="Tipo AmaldiÃ§oado" value={dados.tipoAmaldicoado} />
          {hasValue(dados.armaAmaldicoada) && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Arma AmaldiÃ§oada</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.armaAmaldicoada, null, 2)}
              </pre>
            </div>
          )}
          {hasValue(dados.protecaoAmaldicoada) && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">ProteÃ§Ã£o AmaldiÃ§oada</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.protecaoAmaldicoada, null, 2)}
              </pre>
            </div>
          )}
          {hasValue(dados.artefatoAmaldicoado) && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Artefato AmaldiÃ§oado</p>
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

      {/* ITEM AMALDIÃ‡OADO */}
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
          <p className="text-xs font-medium text-app-muted mb-2">MecÃ¢nicas Especiais</p>
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
      {hasValue(dados.descricao) && <InfoTile label="DescriÃ§Ã£o" value={dados.descricao} />}

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
                    <p className="text-xs text-app-muted">CÃ³digo: {hab.codigo}</p>
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
                  {hab.area && <InfoTile label="Ãrea" value={hab.area} />}
                  {hab.duracao && <InfoTile label="DuraÃ§Ã£o" value={hab.duracao} />}
                  {hab.resistencia && <InfoTile label="ResistÃªncia" value={hab.resistencia} />}
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

