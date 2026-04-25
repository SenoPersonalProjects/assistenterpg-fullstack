// app/personagens-base/[id]/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  apiDeletePersonagemBase,
  apiExportarPersonagemBase,
  apiGetSuplementos,
  apiUpdatePersonagemBase,
  extrairMensagemErro,
  traduzirErro,
  type UpdatePersonagemBasePayload,
  type SuplementoCatalogo,
} from '@/lib/api';
import {
  apiGetMeusHomebrews,
  apiListarGruposHomebrew,
  type HomebrewGrupoResumo,
  type HomebrewResumo,
} from '@/lib/api/homebrews';

import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { TabbedSection } from '@/components/ui/TabbedSection';
import type { Tab } from '@/components/ui/TabbedSection';

import { PersonagemBaseWizard } from '@/components/personagem-base/create/wizard/PersonagemBaseWizard';
import { usePersonagemBaseDetalhe } from '@/components/personagem-base/sections/usePersonagemBaseDetalhe';
import type { InitialValues } from '@/components/personagem-base/create/PersonagemBaseForm';
import { PersonagemBaseStepInventario } from '@/components/personagem-base/create/wizard/PersonagemBaseStepInventario';
import type { ItemInventarioDto, ItemInventarioPayload } from '@/lib/types';

import { SecaoInfoBasicas } from '@/components/personagem-base/sections/SecaoInfoBasicas';
import { SecaoOrigemClasse } from '@/components/personagem-base/sections/SecaoOrigemClasse';
import { SecaoPoderes } from '@/components/personagem-base/sections/SecaoPoderes';
import { SecaoInventario } from '@/components/personagem-base/sections/SecaoInventario';
import { FontesConteudoModal } from '@/components/personagem-base/create/modal/FontesConteudoModal';
import {
  FONTES_CONTEUDO_INICIAIS,
  criarChaveFontesConteudo,
  filtrarListaPorFontes,
  itemPertenceAsFontesSelecionadas,
  normalizarFontesConteudoSelecionadas,
  type FontesConteudoSelecionadas,
} from '@/lib/utils/fontes-conteudo';

function nomeArquivoExportacao(nomePersonagem: string): string {
  const base = nomePersonagem
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const nomeSeguro = base || 'personagem';
  const data = new Date().toISOString().slice(0, 10);
  return `personagem-${nomeSeguro}-${data}.json`;
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

async function carregarHomebrewsAcessiveis(): Promise<HomebrewResumo[]> {
  async function carregarTodasPaginas(
    callback: (pagina: number) => Promise<{ items: HomebrewResumo[]; totalPages: number }>,
  ): Promise<HomebrewResumo[]> {
    const primeiraPagina = await callback(1);
    const itens = [...(primeiraPagina.items ?? [])];
    const totalPaginas = Math.max(1, primeiraPagina.totalPages || 1);

    if (totalPaginas <= 1) return itens;

    const paginasRestantes = await Promise.all(
      Array.from({ length: totalPaginas - 1 }, (_, index) =>
        callback(index + 2),
      ),
    );

    for (const pagina of paginasRestantes) {
      itens.push(...(pagina.items ?? []));
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
  gruposHomebrew: HomebrewGrupoResumo[],
): FontesConteudoSelecionadas {
  const normalizada = normalizarFontesConteudoSelecionadas(selecao);
  const suplementoIdsValidos = new Set(suplementosAcessiveis.map((item) => item.id));
  const homebrewIdsValidos = new Set(homebrewsAcessiveis.map((item) => item.id));
  const gruposValidos = new Map(gruposHomebrew.map((grupo) => [grupo.id, grupo]));

  const homebrewIds = new Set(
    normalizada.homebrewIds.filter((id) => homebrewIdsValidos.has(id)),
  );
  const homebrewGrupoIds = normalizada.homebrewGrupoIds.filter((id) =>
    gruposValidos.has(id),
  );

  for (const grupoId of homebrewGrupoIds) {
    const grupo = gruposValidos.get(grupoId);
    if (!grupo) continue;
    for (const homebrewId of grupo.homebrewIds) {
      if (homebrewIdsValidos.has(homebrewId)) {
        homebrewIds.add(homebrewId);
      }
    }
  }

  return {
    suplementoIds: normalizada.suplementoIds.filter((id) => suplementoIdsValidos.has(id)),
    homebrewIds: [...homebrewIds].sort((a, b) => a - b),
    homebrewGrupoIds,
  };
}

function mensagemErroExportacao(error: unknown): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const code = (error as { body?: { code?: string } })?.body?.code;
  const base = traduzirErro(code, extrairMensagemErro(error), status);

  if (status === 404) {
    return 'Personagem não encontrado para exportação.';
  }

  if (status === 400 || status === 422) {
    return `Não foi possível exportar o JSON. ${base}`;
  }

  return base;
}

function mensagemErroOperacaoPersonagem(
  error: unknown,
  acao: 'atualizar' | 'excluir',
): string {
  const status = Number(
    (error as { status?: number })?.status ??
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { body?: { statusCode?: number } })?.body?.statusCode ??
      0,
  );
  const code = (error as { body?: { code?: string } })?.body?.code;
  const base = traduzirErro(code, extrairMensagemErro(error), status);

  if (status === 404) {
    return acao === 'excluir'
      ? 'Personagem nao encontrado para exclusao.'
      : 'Personagem nao encontrado para atualizacao.';
  }

  if (status === 400 || status === 422) {
    return acao === 'excluir'
      ? `Nao foi possivel excluir o personagem. ${base}`
      : `Nao foi possivel atualizar o personagem. ${base}`;
  }

  if (status === 403) {
    return 'Voce nao tem permissao para executar esta acao.';
  }

  return base;
}

function normalizarItemInventarioParaPayload(
  item: ItemInventarioDto,
): ItemInventarioPayload {
  return {
    equipamentoId: item.equipamentoId,
    quantidade: item.quantidade,
    equipado: item.equipado,
    modificacoesIds: item.modificacoes.map((modificacao) => modificacao.id),
    nomeCustomizado: item.nomeCustomizado ?? null,
    notas: item.notas ?? null,
    estado: item.estado ?? undefined,
  };
}

export default function PersonagemBaseDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params?.id;
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const {
    personagem,
    catalogos,
    passivasSelecionadas,
    loading,
    erro,
    refresh,
    carregarTrilhasDaClasse,
    carregarCaminhosDaTrilha,
    periciasMap,
    tiposGrauMap,
  } = usePersonagemBaseDetalhe(id);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const [modalInventarioAberto, setModalInventarioAberto] = useState(false);
  const [itensInventarioEdicao, setItensInventarioEdicao] = useState<
    ItemInventarioPayload[]
  >([]);
  const [salvandoInventario, setSalvandoInventario] = useState(false);
  const [fontesSelecionadas, setFontesSelecionadas] =
    useState<FontesConteudoSelecionadas>(FONTES_CONTEUDO_INICIAIS);
  const [fontesModalOpen, setFontesModalOpen] = useState(false);
  const [fontesModalVersion, setFontesModalVersion] = useState(0);
  const [suplementos, setSuplementos] = useState<SuplementoCatalogo[]>([]);
  const [homebrews, setHomebrews] = useState<HomebrewResumo[]>([]);
  const [gruposHomebrew, setGruposHomebrew] = useState<HomebrewGrupoResumo[]>([]);
  const [impactoFontesPendente, setImpactoFontesPendente] = useState<{
    selecao: FontesConteudoSelecionadas;
    impactos: string[];
  } | null>(null);

  useEffect(() => {
    if (!personagem) return;
    setFontesSelecionadas(
      normalizarFontesConteudoSelecionadas(
        personagem.fontesConteudo ?? FONTES_CONTEUDO_INICIAIS,
      ),
    );
  }, [personagem]);

  useEffect(() => {
    let cancelado = false;

    async function carregarFontesDisponiveis() {
      try {
        const [suplementosAtivos, homebrewsAcessiveis, gruposAcessiveis] = await Promise.all([
          apiGetSuplementos({ status: 'PUBLICADO' }),
          carregarHomebrewsAcessiveis(),
          apiListarGruposHomebrew(),
        ]);
        if (cancelado) return;
        setSuplementos(suplementosAtivos);
        setHomebrews(homebrewsAcessiveis);
        setGruposHomebrew(gruposAcessiveis);
      } catch {
        if (!cancelado) {
          setSuplementos([]);
          setHomebrews([]);
          setGruposHomebrew([]);
        }
      }
    }

    void carregarFontesDisponiveis();

    return () => {
      cancelado = true;
    };
  }, []);

  const alinhamento = useMemo(
    () => catalogos.alinhamentos.find((a) => a.id === personagem?.alinhamentoId),
    [catalogos.alinhamentos, personagem?.alinhamentoId],
  );

  const origemCatalogo = useMemo(
    () => catalogos.origens.find((o) => o.id === personagem?.origemId),
    [catalogos.origens, personagem?.origemId],
  );

  const classeCatalogo = useMemo(
    () => catalogos.classes.find((c) => c.id === personagem?.classeId),
    [catalogos.classes, personagem?.classeId],
  );

  const habilidadesIniciaisOrigem = useMemo(
    () =>
      origemCatalogo?.habilidadesIniciais ??
      origemCatalogo?.habilidadesOrigem?.map((r) => r.habilidade) ??
      [],
    [origemCatalogo],
  );

  const habilidadesIniciaisClasse = useMemo(
    () => classeCatalogo?.habilidadesIniciais ?? [],
    [classeCatalogo],
  );

  const classesFiltradas = useMemo(
    () => filtrarListaPorFontes(catalogos.classes, fontesSelecionadas),
    [catalogos.classes, fontesSelecionadas],
  );
  const clasFiltrados = useMemo(
    () => filtrarListaPorFontes(catalogos.clas, fontesSelecionadas),
    [catalogos.clas, fontesSelecionadas],
  );
  const origensFiltradas = useMemo(
    () => filtrarListaPorFontes(catalogos.origens, fontesSelecionadas),
    [catalogos.origens, fontesSelecionadas],
  );
  const tecnicasInatasFiltradas = useMemo(
    () => filtrarListaPorFontes(catalogos.tecnicasInatas, fontesSelecionadas),
    [catalogos.tecnicasInatas, fontesSelecionadas],
  );
  const equipamentosFiltrados = useMemo(
    () => filtrarListaPorFontes(catalogos.equipamentos, fontesSelecionadas),
    [catalogos.equipamentos, fontesSelecionadas],
  );
  const modificacoesFiltradas = useMemo(
    () => filtrarListaPorFontes(catalogos.modificacoes, fontesSelecionadas),
    [catalogos.modificacoes, fontesSelecionadas],
  );
  const chaveFontesWizard = useMemo(
    () => criarChaveFontesConteudo(fontesSelecionadas),
    [fontesSelecionadas],
  );
  const resumoFontes = useMemo(
    () => ({
      suplementos: fontesSelecionadas.suplementoIds.length,
      homebrews: fontesSelecionadas.homebrewIds.length,
      gruposHomebrew: fontesSelecionadas.homebrewGrupoIds.length,
    }),
    [fontesSelecionadas],
  );

  const initialValues: InitialValues | null = useMemo(() => {
    if (!personagem) return null;

    const manterIdObrigatorio = <T extends { id: number }>(id: number, lista: T[]) =>
      lista.length === 0 || lista.some((item) => item.id === id) ? id : 0;
    const manterIdOpcional = <T extends { id: number }>(
      id: number | null,
      lista: T[],
    ) =>
      !id || lista.length === 0 || lista.some((item) => item.id === id)
        ? id
        : null;
    const equipamentosPermitidos = new Set(equipamentosFiltrados.map((item) => item.id));
    const modificacoesPermitidas = new Set(modificacoesFiltradas.map((item) => item.id));

    return {
      nome: personagem.nome,
      nivel: personagem.nivel,
      claId: manterIdObrigatorio(personagem.claId, clasFiltrados),
      origemId: manterIdObrigatorio(personagem.origemId, origensFiltradas),
      classeId: manterIdObrigatorio(personagem.classeId, classesFiltradas),
      trilhaId: personagem.trilhaId,
      caminhoId: personagem.caminhoId,
      agilidade: personagem.agilidade,
      forca: personagem.forca,
      intelecto: personagem.intelecto,
      presenca: personagem.presenca,
      vigor: personagem.vigor,
      estudouEscolaTecnica: personagem.estudouEscolaTecnica,
      tecnicaInataId: manterIdOpcional(personagem.tecnicaInataId, tecnicasInatasFiltradas),
      proficienciasCodigos: personagem.proficiencias.map((p) => p.codigo),
      grausAprimoramento: personagem.grausAprimoramento.map((g) => ({
        tipoGrauCodigo: g.tipoGrauCodigo,
        valor: g.valorLivre,
      })),
      idade: personagem.idade,
      prestigioBase: personagem.prestigioBase,
      prestigioClaBase: personagem.prestigioClaBase,
      alinhamentoId: personagem.alinhamentoId ?? null,
      background: personagem.background,
      atributoChaveEa: personagem.atributoChaveEa,
      periciasClasseEscolhidasCodigos: personagem.periciasClasseEscolhidasCodigos ?? [],
      periciasOrigemEscolhidasCodigos: personagem.periciasOrigemEscolhidasCodigos ?? [],
      periciasLivresCodigos: personagem.periciasLivresCodigos ?? [],
      grausTreinamento: personagem.grausTreinamento ?? [],
      poderesGenericos: (personagem.poderesGenericos ?? []).map((p) => ({
        habilidadeId: p.habilidadeId,
        config: p.config ?? {},
      })),
      passivasAtributosAtivos: personagem.passivasAtributosAtivos ?? [],
      passivasAtributosConfig: personagem.passivasAtributosConfig ?? {},
      itensInventario: (personagem.itensInventario ?? [])
        .filter((item) => equipamentosPermitidos.has(item.equipamentoId))
        .map(normalizarItemInventarioParaPayload)
        .map((item) => ({
          ...item,
          modificacoesIds: (item.modificacoesIds ?? []).filter((modId) =>
            modificacoesPermitidas.has(modId),
          ),
        })),
    };
  }, [
    personagem,
    clasFiltrados,
    origensFiltradas,
    classesFiltradas,
    tecnicasInatasFiltradas,
    equipamentosFiltrados,
    modificacoesFiltradas,
  ]);

  async function handleUpdate(data: UpdatePersonagemBasePayload) {
    if (!personagem) return;
    try {
      setErroLocal(null);
      await apiUpdatePersonagemBase(personagem.id, {
        ...data,
        fontesConteudo: fontesSelecionadas,
      });
      await refresh();
      setModoEdicao(false);
    } catch (e) {
      setErroLocal(mensagemErroOperacaoPersonagem(e, 'atualizar'));
    }
  }

  async function carregarTrilhasFiltradas(classeId: number) {
    const trilhas = await carregarTrilhasDaClasse(classeId);
    return filtrarListaPorFontes(trilhas, fontesSelecionadas);
  }

  async function carregarCaminhosFiltrados(trilhaId: number) {
    const caminhos = await carregarCaminhosDaTrilha(trilhaId);
    return filtrarListaPorFontes(caminhos, fontesSelecionadas);
  }

  function analisarImpactoFontes(selecao: FontesConteudoSelecionadas): string[] {
    if (!personagem) return [];

    const impactos: string[] = [];
    const adicionarImpacto = <T extends { id: number; nome?: string }>(
      rotulo: string,
      idAtual: number | null | undefined,
      catalogo: T[],
    ) => {
      if (!idAtual) return;
      const item = catalogo.find((entrada) => entrada.id === idAtual);
      if (!item) return;
      if (!itemPertenceAsFontesSelecionadas(item, selecao)) {
        impactos.push(`${rotulo}: ${item.nome ?? `#${item.id}`}`);
      }
    };

    adicionarImpacto('Classe', personagem.classeId, catalogos.classes);
    adicionarImpacto('Cla', personagem.claId, catalogos.clas);
    adicionarImpacto('Origem', personagem.origemId, catalogos.origens);
    adicionarImpacto(
      'Tecnica inata',
      personagem.tecnicaInataId,
      catalogos.tecnicasInatas,
    );

    const equipamentosPorId = new Map(catalogos.equipamentos.map((item) => [item.id, item]));
    const modificacoesPorId = new Map(catalogos.modificacoes.map((item) => [item.id, item]));

    for (const item of personagem.itensInventario ?? []) {
      const equipamento = equipamentosPorId.get(item.equipamentoId);
      if (equipamento && !itemPertenceAsFontesSelecionadas(equipamento, selecao)) {
        impactos.push(`Item: ${item.nomeCustomizado || equipamento.nome}`);
      }

      for (const modificacao of item.modificacoes ?? []) {
        const modCatalogo = modificacoesPorId.get(modificacao.id);
        if (modCatalogo && !itemPertenceAsFontesSelecionadas(modCatalogo, selecao)) {
          impactos.push(
            `Modificacao em ${item.nomeCustomizado || equipamento?.nome || 'item'}: ${
              modCatalogo.nome
            }`,
          );
        }
      }
    }

    return impactos;
  }

  function confirmarAplicacaoFontes(selecao: FontesConteudoSelecionadas) {
    setFontesSelecionadas(selecao);
    setImpactoFontesPendente(null);
  }

  function handleAplicarFontes(selecao: FontesConteudoSelecionadas) {
    const selecaoSanitizada = sanitizarSelecaoComAcesso(
      selecao,
      suplementos,
      homebrews,
      gruposHomebrew,
    );
    const impactos = analisarImpactoFontes(selecaoSanitizada);

    if (impactos.length > 0) {
      setImpactoFontesPendente({ selecao: selecaoSanitizada, impactos });
      return;
    }

    confirmarAplicacaoFontes(selecaoSanitizada);
  }

  function abrirModalFontes() {
    setFontesModalVersion((version) => version + 1);
    setFontesModalOpen(true);
  }

  function handleDeleteClick() {
    if (!personagem) return;
    confirm({
      title: `Tem certeza que deseja excluir "${personagem.nome}"?`,
      description: 'Esta ação é irreversível!',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setErroLocal(null);
          await apiDeletePersonagemBase(personagem.id);
          router.push('/personagens-base');
        } catch (e) {
          setErroLocal(mensagemErroOperacaoPersonagem(e, 'excluir'));
        }
      },
    });
  }

  async function handleExportarClick() {
    if (!personagem) return;

    try {
      setErroLocal(null);
      setExportando(true);

      const exportacao = await apiExportarPersonagemBase(personagem.id);
      const arquivo = nomeArquivoExportacao(personagem.nome);
      baixarJsonArquivo(exportacao, arquivo);
      showToast('JSON exportado com sucesso.', 'success');
    } catch (error) {
      const mensagem = mensagemErroExportacao(error);
      setErroLocal(mensagem);
    } finally {
      setExportando(false);
    }
  }

  function abrirModalInventario() {
    if (!personagem) return;
    setItensInventarioEdicao(
      (personagem.itensInventario ?? []).map(normalizarItemInventarioParaPayload),
    );
    setModalInventarioAberto(true);
  }

  async function handleSalvarInventario() {
    if (!personagem) return;
    try {
      setErroLocal(null);
      setSalvandoInventario(true);
      await apiUpdatePersonagemBase(personagem.id, {
        itensInventario: itensInventarioEdicao,
      });
      await refresh();
      setModalInventarioAberto(false);
    } catch (e) {
      setErroLocal(mensagemErroOperacaoPersonagem(e, 'atualizar'));
    } finally {
      setSalvandoInventario(false);
    }
  }

  if (!id) {
    return (
      <main className="min-h-screen bg-app-bg p-6">
        <ErrorAlert message="ID inválido na rota." />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-app-bg flex items-center justify-center p-6">
        <Loading message="Carregando personagem..." className="text-app-fg" />
      </main>
    );
  }

  if (!personagem || !initialValues) {
    return (
      <main className="min-h-screen bg-app-bg p-6">
        <ErrorAlert message={erro ?? 'Personagem não encontrado.'} />
      </main>
    );
  }

  const tabs: Tab[] = [
    {
      id: 'info',
      titulo: 'Informações',
      icone: 'info',
      conteudo: (
        <SecaoInfoBasicas
          personagem={personagem}
          alinhamento={alinhamento}
          tecnicaInata={personagem.tecnicaInata ?? undefined}
          classeCatalogo={classeCatalogo}
          passivasSelecionadas={passivasSelecionadas}
        />
      ),
    },
    {
      id: 'origem',
      titulo: 'Origem & Classe',
      icone: 'class',
      conteudo: (
        <SecaoOrigemClasse
          personagem={personagem}
          habilidadesIniciaisOrigem={habilidadesIniciaisOrigem}
          habilidadesIniciaisClasse={habilidadesIniciaisClasse}
        />
      ),
    },
    {
      id: 'poderes',
      titulo: 'Poderes',
      icone: 'sparkles',
      conteudo: (
        <SecaoPoderes
          personagem={personagem}
          periciasMap={periciasMap}
          tiposGrauMap={tiposGrauMap}
        />
      ),
    },
    {
      id: 'inventario',
      titulo: 'Inventário',
      icone: 'briefcase',
      conteudo: (
        <SecaoInventario
          personagem={personagem}
          equipamentos={catalogos.equipamentos}
          modificacoes={catalogos.modificacoes}
        />
      ),
    },
  ];

  return (
    <>
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name="characters" className="w-6 h-6 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-fg">{personagem.nome}</h1>
                <p className="text-sm text-app-muted mt-0.5">
                  Nível {personagem.nivel} • {classeCatalogo?.nome}{' '}
                  {personagem.trilha?.nome ? `• ${personagem.trilha.nome}` : ''}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/personagens-base')}>
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </header>

          {(erro || erroLocal) && <ErrorAlert message={erro ?? erroLocal ?? ''} />}

          {modoEdicao ? (
            <section className="rounded-lg border border-app-border bg-app-surface p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-app-fg">
                    Fontes habilitadas para esta ficha
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
                    Gerenciar fontes
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-xs text-app-muted">
                Remover fontes pode limpar escolhas, itens ou modificacoes que vieram delas ao salvar.
              </p>
            </section>
          ) : null}

          {!modoEdicao ? (
            <TabbedSection tabs={tabs} defaultTabId="info" />
          ) : (
            <PersonagemBaseWizard
              key={`edit-${personagem.id}-${chaveFontesWizard}`}
              mode="edit"
              initialValues={initialValues}
              onSubmitEdit={handleUpdate}
              onCancel={() => setModoEdicao(false)}
              classes={classesFiltradas}
              clas={clasFiltrados}
              origens={origensFiltradas}
              proficiencias={catalogos.proficiencias}
              tiposGrau={catalogos.tiposGrau}
              tecnicasInatas={tecnicasInatasFiltradas}
              alinhamentos={catalogos.alinhamentos}
              pericias={catalogos.pericias}
              equipamentos={equipamentosFiltrados}
              modificacoes={modificacoesFiltradas}
              carregarTrilhasDaClasse={carregarTrilhasFiltradas}
              carregarCaminhosDaTrilha={carregarCaminhosFiltrados}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-8 border-t border-app-border">
            <Button variant="ghost" size="sm" onClick={() => router.push('/personagens-base')}>
              <Icon name="back" className="w-4 h-4 mr-2" />
              Voltar à lista
            </Button>
            {!modoEdicao ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportarClick}
                  disabled={exportando}
                >
                  <Icon name="download" className="w-4 h-4 mr-2" />
                  {exportando ? 'Exportando...' : 'Exportar JSON'}
                </Button>
                <Button variant="secondary" size="sm" onClick={abrirModalInventario}>
                  <Icon name="briefcase" className="w-4 h-4 mr-2" />
                  Editar inventario
                </Button>
                <Button variant="primary" size="sm" onClick={() => setModoEdicao(true)}>
                  <Icon name="edit" className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="text-app-danger hover:bg-app-danger/10"
                >
                  <Icon name="delete" className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setModoEdicao(false)}>
                Cancelar edição
              </Button>
            )}
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
      >
        <div className="rounded border border-app-danger/40 bg-app-danger/5 p-3">
          <p className="text-xs font-semibold text-app-danger mb-2 flex items-center gap-1.5">
            <Icon name="warning" className="w-4 h-4" />
            ATENÇÃO: Esta ação é IRREVERSÍVEL!
          </p>
          <ul className="space-y-1 text-xs text-app-danger/90">
            <li>• O personagem-base será excluído permanentemente</li>
            <li>• Todas as instâncias deste personagem em campanhas serão removidas</li>
            <li>• Todo o histórico e progresso serão perdidos</li>
            <li>• Fichas, anotações e relacionamentos serão apagados</li>
          </ul>
        </div>
      </ConfirmDialog>

      <FontesConteudoModal
        key={fontesModalVersion}
        isOpen={fontesModalOpen}
        onClose={() => setFontesModalOpen(false)}
        onConfirm={handleAplicarFontes}
        suplementos={suplementos}
        homebrews={homebrews}
        gruposHomebrew={gruposHomebrew}
        selecaoAtual={fontesSelecionadas}
      />

      <ConfirmDialog
        isOpen={Boolean(impactoFontesPendente)}
        onClose={() => setImpactoFontesPendente(null)}
        onConfirm={() => {
          if (impactoFontesPendente) {
            confirmarAplicacaoFontes(impactoFontesPendente.selecao);
          }
        }}
        title="Remover fontes usadas pela ficha?"
        description="Alguns conteudos atuais nao ficarao disponiveis com a nova selecao de fontes. Ao salvar a ficha, eles deverao ser removidos ou substituidos."
        confirmLabel="Aplicar mesmo assim"
        cancelLabel="Voltar"
        variant="danger"
      >
        <div className="rounded border border-app-danger/40 bg-app-danger/5 p-3">
          <p className="text-xs font-semibold text-app-danger mb-2">
            Impacto estimado
          </p>
          <ul className="space-y-1 text-xs text-app-danger/90">
            {(impactoFontesPendente?.impactos ?? []).slice(0, 12).map((impacto) => (
              <li key={impacto}>- {impacto}</li>
            ))}
            {(impactoFontesPendente?.impactos.length ?? 0) > 12 ? (
              <li>
                - Mais {(impactoFontesPendente?.impactos.length ?? 0) - 12} item(ns)
              </li>
            ) : null}
          </ul>
        </div>
      </ConfirmDialog>

      <Modal
        isOpen={modalInventarioAberto}
        onClose={() => setModalInventarioAberto(false)}
        title="Editar inventario"
        size="xl"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setModalInventarioAberto(false)}
              disabled={salvandoInventario}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSalvarInventario}
              disabled={salvandoInventario}
            >
              {salvandoInventario ? (
                <>
                  <Icon name="loading" className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar inventario'
              )}
            </Button>
          </>
        }
      >
        <PersonagemBaseStepInventario
          forca={personagem.forca}
          intelecto={personagem.intelecto}
          prestigioBase={personagem.prestigioBase}
          creditoCategoriaBonus={personagem.creditoCategoriaBonus}
          pericias={catalogos.pericias}
          equipamentos={equipamentosFiltrados}
          modificacoes={modificacoesFiltradas}
          itensInventario={itensInventarioEdicao}
          onChangeItensInventario={setItensInventarioEdicao}
        />
      </Modal>
    </>
  );
}
