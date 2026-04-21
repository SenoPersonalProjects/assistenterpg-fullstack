// app/personagens-base/novo/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiGetCatalogosBasicos,
  apiGetTrilhasDaClasse,
  apiGetCaminhosDaTrilha,
  apiCreatePersonagemBase,
  apiGetTodosEquipamentos,
  apiGetTodasModificacoes,
  apiGetSuplementos,
  extrairMensagemErro,
  traduzirErro,
  ClasseCatalogo,
  ClaCatalogo,
  OrigemCatalogo,
  ProficienciaCatalogo,
  TipoGrauCatalogo,
  TecnicaInataCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
  CreatePersonagemBasePayload,
  AlinhamentoCatalogo,
  PericiaCatalogo,
  EquipamentoCatalogo,
  ModificacaoCatalogo,
  SuplementoCatalogo,
} from '@/lib/api';
import { apiGetMeusHomebrews, type HomebrewResumo } from '@/lib/api/homebrews';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { PersonagemBaseWizard } from '@/components/personagem-base/create/wizard/PersonagemBaseWizard';
import { FontesConteudoModal } from '@/components/personagem-base/create/modal/FontesConteudoModal';
import {
  FONTES_CONTEUDO_INICIAIS,
  type FontesConteudoSelecionadas,
  carregarFontesConteudoSalvas,
  criarChaveFontesConteudo,
  filtrarListaPorFontes,
  normalizarFontesConteudoSelecionadas,
  salvarFontesConteudo,
} from '@/lib/utils/fontes-conteudo';

function mensagemErroNovoPersonagem(error: unknown, contexto: 'catalogos' | 'criar'): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const code = (error as { body?: { code?: string } })?.body?.code;
  const base = traduzirErro(code, extrairMensagemErro(error), status);

  if (status === 404) {
    return contexto === 'catalogos'
      ? 'Algum catalogo necessario nao foi encontrado.'
      : 'Nao foi possivel criar o personagem porque uma referencia nao foi encontrada.';
  }

  if (status === 400 || status === 422) {
    return contexto === 'catalogos'
      ? `Nao foi possivel carregar os catalogos para criacao. ${base}`
      : `Nao foi possivel criar o personagem. ${base}`;
  }

  if (status === 403) {
    return 'Voce nao tem permissao para executar esta acao.';
  }

  return base;
}

async function carregarHomebrewsAcessiveis(): Promise<HomebrewResumo[]> {
  async function carregarTodasPaginas(
    callback: (pagina: number) => Promise<{ items: HomebrewResumo[]; totalPages: number }>,
  ): Promise<HomebrewResumo[]> {
    const primeiraPagina = await callback(1);
    const itens = [...(primeiraPagina.items ?? [])];
    const totalPaginas = Math.max(1, primeiraPagina.totalPages || 1);

    if (totalPaginas <= 1) {
      return itens;
    }

    const promessasPaginas: Array<Promise<{ items: HomebrewResumo[] }>> = [];
    for (let pagina = 2; pagina <= totalPaginas; pagina += 1) {
      promessasPaginas.push(callback(pagina));
    }

    const paginasRestantes = await Promise.all(promessasPaginas);
    for (const pagina of paginasRestantes) {
      if (Array.isArray(pagina.items) && pagina.items.length > 0) {
        itens.push(...pagina.items);
      }
    }

    return itens;
  }

  const minhasHomebrewsPublicadas = await carregarTodasPaginas((pagina) =>
    apiGetMeusHomebrews({
      status: 'PUBLICADO' as HomebrewResumo['status'],
      pagina,
      limite: 100,
    }),
  );

  const porId = new Map<number, HomebrewResumo>();
  for (const homebrew of minhasHomebrewsPublicadas) {
    if (homebrew.status !== 'PUBLICADO') continue;
    porId.set(homebrew.id, homebrew);
  }

  return [...porId.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function sanitizarSelecaoComAcesso(
  selecao: FontesConteudoSelecionadas,
  suplementosAcessiveis: SuplementoCatalogo[],
  homebrewsAcessiveis: HomebrewResumo[],
): FontesConteudoSelecionadas {
  const normalizada = normalizarFontesConteudoSelecionadas(selecao);
  const suplementoIdsValidos = new Set(suplementosAcessiveis.map((item) => item.id));
  const homebrewIdsValidos = new Set(homebrewsAcessiveis.map((item) => item.id));

  return {
    suplementoIds: normalizada.suplementoIds.filter((id) => suplementoIdsValidos.has(id)),
    homebrewIds: normalizada.homebrewIds.filter((id) => homebrewIdsValidos.has(id)),
  };
}

export default function NovoPersonagemBasePage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();

  const [classes, setClasses] = useState<ClasseCatalogo[]>([]);
  const [clas, setClas] = useState<ClaCatalogo[]>([]);
  const [origens, setOrigens] = useState<OrigemCatalogo[]>([]);
  const [proficiencias, setProficiencias] = useState<ProficienciaCatalogo[]>([]);
  const [tiposGrau, setTiposGrau] = useState<TipoGrauCatalogo[]>([]);
  const [tecnicasInatas, setTecnicasInatas] = useState<TecnicaInataCatalogo[]>([]);
  const [alinhamentos, setAlinhamentos] = useState<AlinhamentoCatalogo[]>([]);
  const [pericias, setPericias] = useState<PericiaCatalogo[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoCatalogo[]>([]);
  const [modificacoes, setModificacoes] = useState<ModificacaoCatalogo[]>([]);
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [homebrews, setHomebrews] = useState<HomebrewResumo[]>([]);
  const [fontesSelecionadas, setFontesSelecionadas] =
    useState<FontesConteudoSelecionadas>(FONTES_CONTEUDO_INICIAIS);
  const [fontesModalOpen, setFontesModalOpen] = useState(false);
  const [fontesModalVersion, setFontesModalVersion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {
      const usuarioId = Number.isInteger(usuario.id) && usuario.id > 0 ? usuario.id : null;

      async function carregarCatalogos() {
        try {
          setErro(null);
          const [
            catalogosBasicos,
            equipamentosCompletos,
            modificacoesCompletas,
            suplementosAtivos,
            homebrewsAcessiveis,
          ] = await Promise.all([
            apiGetCatalogosBasicos(),
            apiGetTodosEquipamentos({ limitePorPagina: 100 }),
            apiGetTodasModificacoes({ limitePorPagina: 100 }),
            apiGetSuplementos({ status: 'PUBLICADO' }),
            carregarHomebrewsAcessiveis(),
          ]);

          setClasses(catalogosBasicos.classes);
          setClas(catalogosBasicos.clas);
          setOrigens(catalogosBasicos.origens);
          setProficiencias(catalogosBasicos.proficiencias);
          setTiposGrau(catalogosBasicos.tiposGrau);
          setTecnicasInatas(catalogosBasicos.tecnicasInatas);
          setAlinhamentos(catalogosBasicos.alinhamentos);
          setPericias(catalogosBasicos.pericias);
          setEquipamentos(equipamentosCompletos);
          setModificacoes(modificacoesCompletas);
          setSuplementos(suplementosAtivos);
          setHomebrews(homebrewsAcessiveis);

          const selecaoSalva = usuarioId ? carregarFontesConteudoSalvas(usuarioId) : null;

          const selecaoInicial = sanitizarSelecaoComAcesso(
            selecaoSalva ?? FONTES_CONTEUDO_INICIAIS,
            suplementosAtivos,
            homebrewsAcessiveis,
          );

          setFontesSelecionadas(selecaoInicial);

          if (selecaoSalva && usuarioId) {
            salvarFontesConteudo(usuarioId, selecaoInicial);
          }

          if (!selecaoSalva) {
            setFontesModalVersion((version) => version + 1);
            setFontesModalOpen(true);
          }
        } catch (e) {
          setErro(mensagemErroNovoPersonagem(e, 'catalogos'));
        } finally {
          setLoading(false);
        }
      }

      carregarCatalogos();
    }
  }, [authLoading, usuario, router]);

  const carregarTrilhasDaClasse = async (classeId: number): Promise<TrilhaCatalogo[]> => {
    const trilhas = await apiGetTrilhasDaClasse(classeId);
    return filtrarListaPorFontes(trilhas, fontesSelecionadas);
  };

  const carregarCaminhosDaTrilha = async (trilhaId: number): Promise<CaminhoCatalogo[]> => {
    const caminhos = await apiGetCaminhosDaTrilha(trilhaId);
    return filtrarListaPorFontes(caminhos, fontesSelecionadas);
  };

  const classesFiltradas = useMemo(
    () => filtrarListaPorFontes(classes, fontesSelecionadas),
    [classes, fontesSelecionadas],
  );
  const clasFiltrados = useMemo(
    () => filtrarListaPorFontes(clas, fontesSelecionadas),
    [clas, fontesSelecionadas],
  );
  const origensFiltradas = useMemo(
    () => filtrarListaPorFontes(origens, fontesSelecionadas),
    [origens, fontesSelecionadas],
  );
  const tecnicasInatasFiltradas = useMemo(
    () => filtrarListaPorFontes(tecnicasInatas, fontesSelecionadas),
    [tecnicasInatas, fontesSelecionadas],
  );
  const equipamentosFiltrados = useMemo(
    () => filtrarListaPorFontes(equipamentos, fontesSelecionadas),
    [equipamentos, fontesSelecionadas],
  );
  const modificacoesFiltradas = useMemo(
    () => filtrarListaPorFontes(modificacoes, fontesSelecionadas),
    [modificacoes, fontesSelecionadas],
  );

  const chaveFontesWizard = useMemo(
    () => criarChaveFontesConteudo(fontesSelecionadas),
    [fontesSelecionadas],
  );

  const resumoFontes = useMemo(() => {
    return {
      suplementos: fontesSelecionadas.suplementoIds.length,
      homebrews: fontesSelecionadas.homebrewIds.length,
    };
  }, [fontesSelecionadas]);

  function handleAplicarFontes(selecao: FontesConteudoSelecionadas) {
    const selecaoSanitizada = sanitizarSelecaoComAcesso(selecao, suplementos, homebrews);
    setFontesSelecionadas(selecaoSanitizada);

    if (typeof usuario?.id === 'number' && usuario.id > 0) {
      salvarFontesConteudo(usuario.id, selecaoSanitizada);
    }
  }

  function abrirModalFontes() {
    setFontesModalVersion((version) => version + 1);
    setFontesModalOpen(true);
  }

  async function handleCreate(data: CreatePersonagemBasePayload) {
    try {
      const novo = await apiCreatePersonagemBase({
        ...data,
        fontesConteudo: {
          suplementoIds: [...fontesSelecionadas.suplementoIds],
          homebrewIds: [...fontesSelecionadas.homebrewIds],
        },
      });
      router.push(`/personagens-base/${novo.id}`);
    } catch (error) {
      throw new Error(mensagemErroNovoPersonagem(error, 'criar'));
    }
  }

  if (authLoading || loading) {
    return <Loading message="Carregando dados para criacao..." className="p-6 text-app-fg" />;
  }

  if (!usuario) return null;

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-app-fg">Novo personagem-base</h1>
            <p className="text-sm text-app-muted">Siga os passos para montar o seu personagem-base completo.</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => router.push('/personagens-base')}
          >
            Voltar para a lista
          </Button>
        </header>

        {erro && <ErrorAlert message={erro} />}

        <section className="rounded-lg border border-app-border bg-app-surface p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-app-fg">
                Fontes habilitadas para esta criacao
              </p>
              <p className="text-xs text-app-muted">
                Sistema base (fixo) + {resumoFontes.suplementos} suplemento(s) +{' '}
                {resumoFontes.homebrews} homebrew(s)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge color="green" size="sm">
                Base
              </Badge>
              <Button variant="secondary" size="sm" onClick={abrirModalFontes}>
                <Icon name="settings" className="w-4 h-4 mr-2" />
                Escolher fontes
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-app-muted">
            Alterar as fontes reinicia o wizard para manter as validacoes coerentes.
          </p>
        </section>

        <PersonagemBaseWizard
          key={chaveFontesWizard}
          classes={classesFiltradas}
          clas={clasFiltrados}
          origens={origensFiltradas}
          proficiencias={proficiencias}
          tiposGrau={tiposGrau}
          tecnicasInatas={tecnicasInatasFiltradas}
          alinhamentos={alinhamentos}
          pericias={pericias}
          equipamentos={equipamentosFiltrados}
          modificacoes={modificacoesFiltradas}
          carregarTrilhasDaClasse={carregarTrilhasDaClasse}
          carregarCaminhosDaTrilha={carregarCaminhosDaTrilha}
          onSubmitCreate={handleCreate}
        />
      </div>

      <FontesConteudoModal
        key={fontesModalVersion}
        isOpen={fontesModalOpen}
        onClose={() => setFontesModalOpen(false)}
        onConfirm={handleAplicarFontes}
        suplementos={suplementos}
        homebrews={homebrews}
        selecaoAtual={fontesSelecionadas}
      />
    </main>
  );
}
