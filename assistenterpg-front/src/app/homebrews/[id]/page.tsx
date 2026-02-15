// src/app/homebrews/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiGetHomebrew, HomebrewDetalhado, TipoHomebrewConteudo } from '@/lib/api/homebrews';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoTile } from '@/components/ui/InfoTile';

type Props = {
  params: {
    id: string;
  };
};

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

export default function HomebrewDetalhePage({ params }: Props) {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const homebrewId = Number(params.id);

  const [homebrew, setHomebrew] = useState<HomebrewDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      carregarHomebrew();
    }
  }, [authLoading, usuario, router, homebrewId]);

  async function carregarHomebrew() {
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
      <div className="min-h-screen bg-app-bg p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <ErrorAlert message={erro ?? 'Homebrew não encontrado'} />
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
              <Icon name={TIPO_ICONS[homebrew.tipo] as any} className="w-7 h-7 text-app-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-3xl font-bold text-app-fg">{homebrew.nome}</h1>
                <Badge color={STATUS_COLOR[homebrew.status]} size="sm">
                  {homebrew.status}
                </Badge>
              </div>
              <p className="text-sm text-app-muted">
                {TIPO_LABELS[homebrew.tipo]} • v{homebrew.versao}
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

        {/* Informações gerais */}
        <Card>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-app-fg mb-3">Informações gerais</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="Tipo" value={TIPO_LABELS[homebrew.tipo]} />
              <InfoTile label="Versão" value={homebrew.versao} />
              <InfoTile label="Criado por" value={homebrew.usuarioApelido ?? 'Desconhecido'} />
              <InfoTile
                label="Criado em"
                value={new Date(homebrew.criadoEm).toLocaleDateString('pt-BR')}
              />
            </div>
          </div>
        </Card>

        {/* Dados específicos */}
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
// COMPONENTE AUXILIAR: Renderizar dados específicos por tipo
// ============================================================================

type RenderProps = {
  tipo: TipoHomebrewConteudo;
  dados: any;
};

function RenderDadosEspecificos({ tipo, dados }: RenderProps) {
  if (!dados || Object.keys(dados).length === 0) {
    return (
      <Card>
        <p className="text-sm text-app-muted italic">Nenhum dado específico cadastrado.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-app-fg">Dados específicos</h2>

        {tipo === 'CLA' && <RenderCla dados={dados} />}
        {tipo === 'ORIGEM' && <RenderOrigem dados={dados} />}
        {tipo === 'TRILHA' && <RenderTrilha dados={dados} />}
        {tipo === 'CAMINHO' && <RenderCaminho dados={dados} />}
        {tipo === 'EQUIPAMENTO' && <RenderEquipamento dados={dados} />}
        {tipo === 'PODER_GENERICO' && <RenderPoderGenerico dados={dados} />}
        {tipo === 'TECNICA_AMALDICOADA' && <RenderTecnicaAmaldicoada dados={dados} />}
      </div>
    </Card>
  );
}

// ============================================================================
// RENDERIZADORES ESPECÍFICOS (BASEADOS NOS DTOS)
// ============================================================================

function RenderCla({ dados }: { dados: any }) {
  return (
    <div className="space-y-3 text-sm">
      {dados.tecnicaInataId && (
        <InfoTile label="ID da Técnica Inata" value={String(dados.tecnicaInataId)} />
      )}
      {dados.caracteristicas && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Características</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3 overflow-auto max-h-48">
            {JSON.stringify(dados.caracteristicas, null, 2)}
          </pre>
        </div>
      )}
      {dados.requisitos && (
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

function RenderOrigem({ dados }: { dados: any }) {
  return (
    <div className="space-y-3 text-sm">
      {dados.pericias && Array.isArray(dados.pericias) && (
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
      {dados.habilidades && (
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

function RenderTrilha({ dados }: { dados: any }) {
  return (
    <div className="space-y-3 text-sm">
      {dados.classeId && <InfoTile label="ID da Classe" value={String(dados.classeId)} />}
      {dados.nivelRequisito && (
        <InfoTile label="Nível de Requisito" value={String(dados.nivelRequisito)} />
      )}
      {dados.habilidades && (
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

function RenderCaminho({ dados }: { dados: any }) {
  return (
    <div className="space-y-3 text-sm">
      {dados.requisitos && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Requisitos</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3 overflow-auto max-h-32">
            {typeof dados.requisitos === 'string'
              ? dados.requisitos
              : JSON.stringify(dados.requisitos, null, 2)}
          </pre>
        </div>
      )}
      {dados.habilidades && (
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

function RenderEquipamento({ dados }: { dados: any }) {
  const { categoria } = dados;

  return (
    <div className="space-y-4 text-sm">
      {/* Campos base */}
      {categoria && <InfoTile label="Categoria" value={categoria} />}
      {dados.espacos != null && <InfoTile label="Espaços" value={String(dados.espacos)} />}
      {dados.descricao && <InfoTile label="Descrição" value={dados.descricao} />}

      {/* ARMA */}
      {categoria === 'ARMA' && dados.proficienciaArma && (
        <>
          <InfoTile label="Proficiência" value={dados.proficienciaArma} />
          {dados.empunhaduras && (
            <InfoTile label="Empunhaduras" value={dados.empunhaduras.join(', ')} />
          )}
          {dados.tipoArma && <InfoTile label="Tipo de Arma" value={dados.tipoArma} />}
          {dados.alcance && <InfoTile label="Alcance" value={dados.alcance} />}
          {dados.danos && (
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
      {categoria === 'PROTECAO' && dados.proficienciaProtecao && (
        <>
          <InfoTile label="Proficiência" value={dados.proficienciaProtecao} />
          {dados.tipoProtecao && <InfoTile label="Tipo" value={dados.tipoProtecao} />}
          {dados.bonusDefesa != null && <InfoTile label="Bônus Defesa" value={String(dados.bonusDefesa)} />}
          {dados.penalidadeCarga != null && (
            <InfoTile label="Penalidade de Carga" value={String(dados.penalidadeCarga)} />
          )}
          {dados.reducoesDano && dados.reducoesDano.length > 0 && (
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
      {categoria === 'ACESSORIO' && dados.tipoAcessorio && (
        <>
          <InfoTile label="Tipo de Acessório" value={dados.tipoAcessorio} />
          {dados.bonusPE != null && <InfoTile label="Bônus PE" value={String(dados.bonusPE)} />}
          {dados.bonusPV != null && <InfoTile label="Bônus PV" value={String(dados.bonusPV)} />}
        </>
      )}

      {/* MUNIÇÃO */}
      {categoria === 'MUNICAO' && (
        <>
          {dados.duracaoCenas && <InfoTile label="Duração (cenas)" value={dados.duracaoCenas} />}
          {dados.recuperavel != null && (
            <InfoTile label="Recuperável" value={dados.recuperavel ? 'Sim' : 'Não'} />
          )}
        </>
      )}

      {/* EXPLOSIVO */}
      {categoria === 'EXPLOSIVO' && (
        <>
          {dados.tipoExplosivo && <InfoTile label="Tipo" value={dados.tipoExplosivo} />}
          {dados.efeito && <InfoTile label="Efeito" value={dados.efeito} />}
        </>
      )}

      {/* FERRAMENTA AMALDIÇOADA */}
      {categoria === 'FERRAMENTA_AMALDICOADA' && dados.tipoAmaldicoado && (
        <>
          <InfoTile label="Tipo Amaldiçoado" value={dados.tipoAmaldicoado} />
          {dados.armaAmaldicoada && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Arma Amaldiçoada</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.armaAmaldicoada, null, 2)}
              </pre>
            </div>
          )}
          {dados.protecaoAmaldicoada && (
            <div>
              <p className="text-xs font-medium text-app-muted mb-2">Proteção Amaldiçoada</p>
              <pre className="text-xs bg-app-base border border-app-border rounded p-3">
                {JSON.stringify(dados.protecaoAmaldicoada, null, 2)}
              </pre>
            </div>
          )}
          {dados.artefatoAmaldicoado && (
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
      {categoria === 'ITEM_OPERACIONAL' && dados.efeito && (
        <InfoTile label="Efeito" value={dados.efeito} />
      )}

      {/* ITEM AMALDIÇOADO */}
      {categoria === 'ITEM_AMALDICOADO' && (
        <>
          {dados.tipoAmaldicoado && <InfoTile label="Tipo" value={dados.tipoAmaldicoado} />}
          {dados.efeito && <InfoTile label="Efeito" value={dados.efeito} />}
        </>
      )}
    </div>
  );
}

function RenderPoderGenerico({ dados }: { dados: any }) {
  return (
    <div className="space-y-3 text-sm">
      {dados.requisitos && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-2">Requisitos</p>
          <pre className="text-xs bg-app-base border border-app-border rounded p-3">
            {typeof dados.requisitos === 'string'
              ? dados.requisitos
              : JSON.stringify(dados.requisitos, null, 2)}
          </pre>
        </div>
      )}
      {dados.efeitos && <InfoTile label="Efeitos" value={dados.efeitos} />}
      {dados.mecanicas && (
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

function RenderTecnicaAmaldicoada({ dados }: { dados: any }) {
  return (
    <div className="space-y-4 text-sm">
      {/* Campos base */}
      {dados.tipo && <InfoTile label="Tipo" value={dados.tipo} />}
      {dados.descricao && <InfoTile label="Descrição" value={dados.descricao} />}

      {/* Habilidades */}
      {dados.habilidades && Array.isArray(dados.habilidades) && (
        <div>
          <p className="text-xs font-medium text-app-muted mb-3">Habilidades</p>
          <div className="space-y-4">
            {dados.habilidades.map((hab: any, idx: number) => (
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
