// app/personagens-base/[id]/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  apiDeletePersonagemBase,
  apiExportarPersonagemBase,
  apiUpdatePersonagemBase,
  extrairMensagemErro,
  traduzirErro,
  type UpdatePersonagemBasePayload,
} from '@/lib/api';

import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
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
import type { ItemInventarioPayload } from '@/lib/types';

import { SecaoInfoBasicas } from '@/components/personagem-base/sections/SecaoInfoBasicas';
import { SecaoOrigemClasse } from '@/components/personagem-base/sections/SecaoOrigemClasse';
import { SecaoPoderes } from '@/components/personagem-base/sections/SecaoPoderes';
import { SecaoInventario } from '@/components/personagem-base/sections/SecaoInventario';

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

  const initialValues: InitialValues | null = useMemo(() => {
    if (!personagem) return null;

    return {
      nome: personagem.nome,
      nivel: personagem.nivel,
      claId: personagem.claId,
      origemId: personagem.origemId,
      classeId: personagem.classeId,
      trilhaId: personagem.trilhaId,
      caminhoId: personagem.caminhoId,
      agilidade: personagem.agilidade,
      forca: personagem.forca,
      intelecto: personagem.intelecto,
      presenca: personagem.presenca,
      vigor: personagem.vigor,
      estudouEscolaTecnica: personagem.estudouEscolaTecnica,
      tecnicaInataId: personagem.tecnicaInataId,
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
      itensInventario: personagem.itensInventario ?? [],
    };
  }, [personagem]);

  async function handleUpdate(data: UpdatePersonagemBasePayload) {
    if (!personagem) return;
    try {
      setErroLocal(null);
      await apiUpdatePersonagemBase(personagem.id, data);
      await refresh();
      setModoEdicao(false);
    } catch (e) {
      setErroLocal(mensagemErroOperacaoPersonagem(e, 'atualizar'));
    }
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
    setItensInventarioEdicao(personagem.itensInventario ?? []);
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

          {!modoEdicao ? (
            <TabbedSection tabs={tabs} defaultTabId="info" />
          ) : (
            <PersonagemBaseWizard
              mode="edit"
              initialValues={initialValues}
              onSubmitEdit={handleUpdate}
              onCancel={() => setModoEdicao(false)}
              classes={catalogos.classes}
              clas={catalogos.clas}
              origens={catalogos.origens}
              proficiencias={catalogos.proficiencias}
              tiposGrau={catalogos.tiposGrau}
              tecnicasInatas={catalogos.tecnicasInatas}
              alinhamentos={catalogos.alinhamentos}
              pericias={catalogos.pericias}
              equipamentos={catalogos.equipamentos}
              modificacoes={catalogos.modificacoes}
              carregarTrilhasDaClasse={carregarTrilhasDaClasse}
              carregarCaminhosDaTrilha={carregarCaminhosDaTrilha}
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
          equipamentos={catalogos.equipamentos}
          modificacoes={catalogos.modificacoes}
          itensInventario={itensInventarioEdicao}
          onChangeItensInventario={setItensInventarioEdicao}
        />
      </Modal>
    </>
  );
}
