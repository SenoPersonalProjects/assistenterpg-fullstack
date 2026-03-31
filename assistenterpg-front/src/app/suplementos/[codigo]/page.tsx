'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  apiGetCatalogosBasicos,
  apiGetSuplementoByCodigo,
  apiGetTodasModificacoes,
  SuplementoCatalogo,
  OrigemCatalogo,
  TrilhaCatalogo,
  TecnicaAmaldicoadaCatalogo,
  HabilidadeCatalogo,
  ModificacaoCatalogo,
  EquipamentoResumoDto,
} from '@/lib/api';
import {
  apiAdminGetTrilhas,
  apiAdminGetTecnicasAmaldicoadas,
  apiAdminGetHabilidades,
  apiAdminGetEquipamentos,
} from '@/lib/api/suplemento-conteudos';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';

type AbaSuplemento =
  | 'RESUMO'
  | 'ORIGENS'
  | 'PODERES'
  | 'TRILHAS'
  | 'EQUIPAMENTOS'
  | 'TECNICAS'
  | 'MODIFICACOES';

export default function SuplementoDetalhePage() {
  const router = useRouter();
  const params = useParams<{ codigo: string }>();
  const { usuario, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const codigo = typeof params?.codigo === 'string' ? params.codigo : '';

  const [suplemento, setSuplemento] = useState<SuplementoCatalogo | null>(null);
  const [origens, setOrigens] = useState<OrigemCatalogo[]>([]);
  const [poderes, setPoderes] = useState<HabilidadeCatalogo[]>([]);
  const [trilhas, setTrilhas] = useState<TrilhaCatalogo[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoResumoDto[]>([]);
  const [tecnicas, setTecnicas] = useState<TecnicaAmaldicoadaCatalogo[]>([]);
  const [modificacoes, setModificacoes] = useState<ModificacaoCatalogo[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaSuplemento>('RESUMO');

  const carregarConteudo = useCallback(async () => {
    if (!codigo) return;

    try {
      setLoading(true);
      setErro(null);

      const suplementoDados = await apiGetSuplementoByCodigo(codigo);
      const suplementoId = suplementoDados.id;

      const [
        catalogosBasicos,
        trilhasData,
        poderesData,
        equipamentosData,
        tecnicasData,
        modificacoesData,
      ] = await Promise.all([
        apiGetCatalogosBasicos(),
        apiAdminGetTrilhas(),
        apiAdminGetHabilidades({ tipo: 'PODER_GENERICO', suplementoId, pagina: 1, limite: 200 }),
        apiAdminGetEquipamentos({ suplementoId, pagina: 1, limite: 200 }),
        apiAdminGetTecnicasAmaldicoadas({ suplementoId }),
        apiGetTodasModificacoes({ suplementoId, limitePorPagina: 100 }),
      ]);

      setSuplemento(suplementoDados);
      setOrigens(
        (catalogosBasicos.origens ?? []).filter((item) => item.suplementoId === suplementoId),
      );
      setTrilhas((trilhasData ?? []).filter((item) => item.suplementoId === suplementoId));
      setPoderes(poderesData?.items ?? []);
      setEquipamentos(equipamentosData?.items ?? []);
      setTecnicas(
        (Array.isArray(tecnicasData) ? tecnicasData : []).filter(
          (item) => item.suplementoId === suplementoId,
        ),
      );
      setModificacoes(modificacoesData ?? []);
    } catch (error) {
      const mensagem = extrairMensagemErro(error);
      setErro(mensagem);
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  }, [codigo, showToast]);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      carregarConteudo();
    }
  }, [authLoading, usuario, router, carregarConteudo]);

  const resumoCards = useMemo(
    () => [
      { label: 'Origens', total: origens.length },
      { label: 'Poderes', total: poderes.length },
      { label: 'Trilhas', total: trilhas.length },
      { label: 'Equipamentos', total: equipamentos.length },
      { label: 'Tecnicas', total: tecnicas.length },
      { label: 'Modificacoes', total: modificacoes.length },
    ],
    [origens.length, poderes.length, trilhas.length, equipamentos.length, tecnicas.length, modificacoes.length],
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando suplemento..." className="text-app-fg" />
      </div>
    );
  }

  if (!suplemento) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <EmptyState
          variant="card"
          icon="book"
          title="Suplemento nao encontrado"
          description="Nao foi possivel carregar os dados solicitados."
          actionLabel="Voltar"
          onAction={() => router.push('/suplementos')}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="book" className="w-6 h-6 text-app-primary" />
            </div>
            <div>
              <p className="text-xs text-app-muted">Suplemento oficial</p>
              <h1 className="text-3xl font-bold text-app-fg">{suplemento.nome}</h1>
            </div>
          </div>
          <Button variant="secondary" onClick={() => router.push('/suplementos')}>
            <Icon name="back" className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </header>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={suplemento.status === 'PUBLICADO' ? 'green' : 'gray'} size="sm">
              {suplemento.status}
            </Badge>
            <Badge color="gray" size="sm">
              v{suplemento.versao}
            </Badge>
            {suplemento.ativo ? (
              <Badge color="green" size="sm">
                Ativo
              </Badge>
            ) : null}
          </div>
          {suplemento.descricao ? (
            <p className="text-sm text-app-muted">{suplemento.descricao}</p>
          ) : null}
          {suplemento.tags && suplemento.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suplemento.tags.map((tag) => (
                <Badge key={tag} color="blue" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </Card>

        {erro ? (
          <Card className="border-app-danger/40 bg-app-danger/10 text-app-danger">
            {erro}
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {(['RESUMO', 'ORIGENS', 'PODERES', 'TRILHAS', 'EQUIPAMENTOS', 'TECNICAS', 'MODIFICACOES'] as AbaSuplemento[]).map(
            (aba) => (
              <Button
                key={aba}
                size="sm"
                variant={abaAtiva === aba ? 'primary' : 'secondary'}
                onClick={() => setAbaAtiva(aba)}
              >
                {aba === 'RESUMO' ? 'Resumo' : aba.toLowerCase()}
              </Button>
            ),
          )}
        </div>

        {abaAtiva === 'RESUMO' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resumoCards.map((card) => (
              <Card key={card.label} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-app-muted">{card.label}</p>
                  <p className="text-lg font-semibold text-app-fg">{card.total}</p>
                </div>
                <Icon name="check" className="w-5 h-5 text-app-primary/60" />
              </Card>
            ))}
          </div>
        ) : null}

        {abaAtiva === 'ORIGENS' ? (
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-app-fg">Origens</h2>
            {origens.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem origens"
                description="Nao ha origens associadas a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {origens.map((origem) => (
                  <div key={origem.id} className="rounded-md border border-app-border p-3">
                    <p className="text-sm font-semibold text-app-fg">{origem.nome}</p>
                    {origem.descricao ? (
                      <p className="text-xs text-app-muted">{origem.descricao}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {abaAtiva === 'PODERES' ? (
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-app-fg">Poderes genericos</h2>
            {poderes.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem poderes"
                description="Nao ha poderes genericos associados a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {poderes.map((poder) => (
                  <div key={poder.id} className="rounded-md border border-app-border p-3">
                    <p className="text-sm font-semibold text-app-fg">{poder.nome}</p>
                    {poder.descricao ? (
                      <p className="text-xs text-app-muted">{poder.descricao}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {abaAtiva === 'TRILHAS' ? (
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-app-fg">Trilhas</h2>
            {trilhas.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem trilhas"
                description="Nao ha trilhas associadas a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {trilhas.map((trilha) => (
                  <div key={trilha.id} className="rounded-md border border-app-border p-3">
                    <p className="text-sm font-semibold text-app-fg">{trilha.nome}</p>
                    {trilha.descricao ? (
                      <p className="text-xs text-app-muted">{trilha.descricao}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {abaAtiva === 'EQUIPAMENTOS' ? (
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-app-fg">Equipamentos</h2>
            {equipamentos.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem equipamentos"
                description="Nao ha equipamentos associados a este suplemento."
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {equipamentos.map((equipamento) => (
                  <div key={equipamento.id} className="rounded-md border border-app-border p-3">
                    <p className="text-sm font-semibold text-app-fg">{equipamento.nome}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge color="gray" size="sm">
                        {equipamento.tipo}
                      </Badge>
                      {equipamento.categoria ? (
                        <Badge color="blue" size="sm">
                          Cat. {equipamento.categoria}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {abaAtiva === 'TECNICAS' ? (
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-app-fg">Tecnicas</h2>
            {tecnicas.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem tecnicas"
                description="Nao ha tecnicas associadas a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {tecnicas.map((tecnica) => (
                  <div key={tecnica.id} className="rounded-md border border-app-border p-3">
                    <p className="text-sm font-semibold text-app-fg">{tecnica.nome}</p>
                    {tecnica.descricao ? (
                      <p className="text-xs text-app-muted">{tecnica.descricao}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {abaAtiva === 'MODIFICACOES' ? (
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-app-fg">Modificacoes</h2>
            {modificacoes.length === 0 ? (
              <EmptyState
                variant="session"
                size="sm"
                icon="info"
                title="Sem modificacoes"
                description="Nao ha modificacoes associadas a este suplemento."
              />
            ) : (
              <div className="grid gap-2">
                {modificacoes.map((mod) => (
                  <div key={mod.id} className="rounded-md border border-app-border p-3">
                    <p className="text-sm font-semibold text-app-fg">{mod.nome}</p>
                    {mod.descricao ? (
                      <p className="text-xs text-app-muted">{mod.descricao}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}
      </div>
    </main>
  );
}
