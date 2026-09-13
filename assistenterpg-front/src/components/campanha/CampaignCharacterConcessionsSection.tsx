'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { PowerConfigurationSummary } from '@/components/poderes/PowerConfigurationSummary';
import { apiGetPoderesGenericos, apiGetProficiencias } from '@/lib/api/catalogos';
import { apiListarEntidadesVinculadasPersonagem } from '@/lib/api/campanhas';
import { criarErroUsuario } from '@/lib/api/error-handler';
import {
  apiConcederPoderGenericoCampanha,
  apiConcederProficienciaCampanha,
  apiCriarHabilidadePersonalizadaCampanha,
  apiGetConcessoesCampanha,
  apiRemoverHabilidadePersonalizadaCampanha,
  apiRemoverPoderGenericoCampanha,
  apiRemoverProficienciaCampanha,
  type ConcessoesCampanha,
} from '@/lib/api/campanha-concessoes';
import type { EntidadeVinculadaPersonagem } from '@/lib/types/campanha.types';
import type { PoderGenericoCatalogo, ProficienciaCatalogo } from '@/lib/types/catalogo.types';

type CatalogoAberto = 'PODER' | 'PROFICIENCIA' | null;

type DadosCarregados = {
  concessoes: ConcessoesCampanha;
  listaPoderes: PoderGenericoCatalogo[];
  listaProficiencias: ProficienciaCatalogo[];
  listaVinculados: EntidadeVinculadaPersonagem[];
};

type CampaignCharacterConcessionsSectionProps = {
  campanhaId: number;
  personagemId: number;
  ativo: boolean;
};

export function CampaignCharacterConcessionsSection({ campanhaId, personagemId, ativo }: CampaignCharacterConcessionsSectionProps) {
  const [dados, setDados] = useState<ConcessoesCampanha | null>(null);
  const [poderes, setPoderes] = useState<PoderGenericoCatalogo[]>([]);
  const [proficiencias, setProficiencias] = useState<ProficienciaCatalogo[]>([]);
  const [catalogoAberto, setCatalogoAberto] = useState<CatalogoAberto>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [vinculados, setVinculados] = useState<EntidadeVinculadaPersonagem[]>([]);
  const [poderSelecionado, setPoderSelecionado] = useState<PoderGenericoCatalogo | null>(null);
  const [configPoder, setConfigPoder] = useState<Record<string, unknown>>({});

  const carregar = useCallback(async () => {
    const [concessoes, listaPoderes, listaProficiencias, listaVinculados] = await Promise.all([
      apiGetConcessoesCampanha(campanhaId, personagemId),
      apiGetPoderesGenericos(),
      apiGetProficiencias(),
      apiListarEntidadesVinculadasPersonagem(campanhaId, personagemId),
    ]);

    return { concessoes, listaPoderes, listaProficiencias, listaVinculados } satisfies DadosCarregados;
  }, [campanhaId, personagemId]);

  const aplicarDados = useCallback((dadosCarregados: DadosCarregados) => {
    setDados(dadosCarregados.concessoes);
    setPoderes(dadosCarregados.listaPoderes);
    setProficiencias(dadosCarregados.listaProficiencias);
    setVinculados(dadosCarregados.listaVinculados);
  }, []);

  useEffect(() => {
    if (!ativo) return;

    let cancelado = false;
    void carregar()
      .then((dadosCarregados) => {
        if (!cancelado) aplicarDados(dadosCarregados);
      })
      .catch((error: unknown) => {
        if (!cancelado) setErro(criarErroUsuario(error).message);
      });

    return () => {
      cancelado = true;
    };
  }, [ativo, aplicarDados, carregar]);

  const executar = async (acao: () => Promise<unknown>) => {
    setErro(null);
    try {
      await acao();
      aplicarDados(await carregar());
    } catch (error) {
      setErro(criarErroUsuario(error).message);
    }
  };

  const catalogoSelecionado = catalogoAberto === 'PODER' ? poderes : proficiencias;
  const escolhaPoder = poderSelecionado
    && typeof poderSelecionado.mecanicasEspeciais === 'object'
    && poderSelecionado.mecanicasEspeciais
    && 'escolha' in poderSelecionado.mecanicasEspeciais
    ? (poderSelecionado.mecanicasEspeciais as { escolha?: { tipo?: string } }).escolha
    : undefined;
  const opcoesRitual = dados?.opcoesRitualPredileto?.habilidades ?? [];
  const podeConcederPoder = !escolhaPoder || (
    escolhaPoder.tipo === 'SHIKIGAMI'
      ? Number(configPoder.shikigamiId) > 0
      : escolhaPoder.tipo === 'FEITICO_CONHECIDO'
        ? Number(configPoder.habilidadeTecnicaId) > 0
        : String(configPoder.valor ?? '').trim().length > 0
  );

  const concederPoder = () => {
    if (!poderSelecionado || !podeConcederPoder) return;
    void executar(() => apiConcederPoderGenericoCampanha(campanhaId, personagemId, poderSelecionado.id, configPoder));
    setPoderSelecionado(null);
    setConfigPoder({});
  };

  const adicionarHabilidadePersonalizada = () => {
    void executar(async () => {
      await apiCriarHabilidadePersonalizadaCampanha(campanhaId, personagemId, nome, descricao);
      setNome('');
      setDescricao('');
    });
  };

  return (
    <section className="space-y-5 rounded-lg border border-app-border bg-app-surface p-4">
      <SectionHeader
        title="Concessões permanentes"
        description="Poderes, proficiências e habilidades descritivas concedidos pelo mestre. Essas escolhas permanecem na ficha da campanha."
        icon="sparkles"
      />
      {erro ? <ErrorAlert message={erro} /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {([
          ['PODER', 'Poder genérico', 'Escolha uma habilidade e consulte sua descrição antes de conceder.'],
          ['PROFICIENCIA', 'Proficiência', 'Conceda proficiências de armas, proteções e categorias especiais.'],
        ] as const).map(([tipo, titulo, ajuda]) => (
          <div key={tipo} className="rounded-xl border border-app-border bg-app-card p-4">
            <p className="text-sm font-semibold text-app-fg">{titulo}</p>
            <p className="mt-1 text-xs text-app-muted">{ajuda}</p>
            <Button className="mt-3" size="sm" type="button" onClick={() => setCatalogoAberto(tipo)}>
              Escolher {titulo.toLowerCase()}
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-app-border bg-app-card p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-app-fg">Habilidade personalizada</p>
          <p className="mt-1 text-xs text-app-muted">Registre um efeito narrativo próprio, com nome e descrição para consulta durante a campanha.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Nome" value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex.: Juramento do guardião" />
          <Textarea label="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Descreva o efeito, seus limites e quando ele se aplica." rows={3} />
        </div>
        <Button className="mt-3" size="sm" type="button" disabled={!nome.trim() || !descricao.trim()} onClick={adicionarHabilidadePersonalizada}>
          Adicionar habilidade
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 rounded-xl border border-app-border bg-app-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-app-fg">Poderes concedidos</p>
            <Badge size="xs" color="purple">{dados?.poderesGenericos.length ?? 0}</Badge>
          </div>
          {dados?.poderesGenericos.length ? dados.poderesGenericos.map((poder) => (
            <div key={poder.id} className="rounded-lg border border-app-border bg-app-surface p-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-app-fg">{poder.habilidade.nome}</span>
                <Button size="xs" variant="ghost" type="button" onClick={() => void executar(() => apiRemoverPoderGenericoCampanha(campanhaId, personagemId, poder.id))}>Remover</Button>
              </div>
              {poder.habilidade.descricao ? <p className="mt-1 leading-relaxed text-app-muted">{poder.habilidade.descricao}</p> : null}
              <PowerConfigurationSummary config={poder.config} habilidadesTecnica={opcoesRitual} vinculados={vinculados.map((vinculado) => ({ id: vinculado.id, nome: vinculado.nome }))} />
            </div>
          )) : <p className="text-xs text-app-muted">Nenhum poder concedido.</p>}
        </div>

        <div className="space-y-2 rounded-xl border border-app-border bg-app-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-app-fg">Proficiências concedidas</p>
            <Badge size="xs" color="cyan">{dados?.proficienciasConcedidas.length ?? 0}</Badge>
          </div>
          {dados?.proficienciasConcedidas.length ? dados.proficienciasConcedidas.map((item) => (
            <div key={item.proficiencia.id} className="flex items-center justify-between gap-2 rounded-lg border border-app-border bg-app-surface p-3 text-xs">
              <span className="font-medium text-app-fg">{item.proficiencia.nome}</span>
              <Button size="xs" variant="ghost" type="button" onClick={() => void executar(() => apiRemoverProficienciaCampanha(campanhaId, personagemId, item.proficiencia.id))}>Remover</Button>
            </div>
          )) : <p className="text-xs text-app-muted">Nenhuma proficiência concedida.</p>}
        </div>

        <div className="space-y-2 rounded-xl border border-app-border bg-app-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-app-fg">Habilidades personalizadas</p>
            <Badge size="xs" color="blue">{dados?.habilidadesPersonalizadas.length ?? 0}</Badge>
          </div>
          {dados?.habilidadesPersonalizadas.length ? dados.habilidadesPersonalizadas.map((habilidade) => (
            <div key={habilidade.id} className="rounded-lg border border-app-border bg-app-surface p-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-app-fg">{habilidade.nome}</span>
                <Button size="xs" variant="ghost" type="button" onClick={() => void executar(() => apiRemoverHabilidadePersonalizadaCampanha(campanhaId, personagemId, habilidade.id))}>Remover</Button>
              </div>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed text-app-muted">{habilidade.descricao}</p>
            </div>
          )) : <p className="text-xs text-app-muted">Nenhuma habilidade personalizada.</p>}
        </div>
      </div>

      <Modal isOpen={catalogoAberto !== null} onClose={() => setCatalogoAberto(null)} title={catalogoAberto === 'PODER' ? 'Conceder poder genérico' : 'Conceder proficiência'} size="lg">
        <div className="space-y-2">
          {catalogoSelecionado.map((item) => (
            <button key={item.id} type="button" className="w-full rounded-xl border border-app-border bg-app-surface p-3 text-left transition hover:border-app-primary/60 hover:bg-app-primary/5" onClick={() => {
              const tipo = catalogoAberto;
              if (tipo === 'PODER') {
                setCatalogoAberto(null);
                setPoderSelecionado(item as PoderGenericoCatalogo);
                setConfigPoder({});
                return;
              }
              setCatalogoAberto(null);
              void executar(() => apiConcederProficienciaCampanha(campanhaId, personagemId, item.id));
            }}>
              <p className="font-semibold text-app-fg">{item.nome}</p>
              {item.descricao ? <p className="mt-1 text-xs leading-relaxed text-app-muted">{item.descricao}</p> : null}
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={poderSelecionado !== null} onClose={() => { setPoderSelecionado(null); setConfigPoder({}); }} title={`Configurar ${poderSelecionado?.nome ?? 'poder'}`} size="md">
        {poderSelecionado ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-app-muted">{poderSelecionado.descricao}</p>
            {escolhaPoder ? (
              <div className="rounded-xl border border-app-border bg-app-card p-3">
                <p className="text-sm font-semibold text-app-fg">Escolha necessária</p>
                {escolhaPoder.tipo === 'SHIKIGAMI' ? (
                  <Select className="mt-2" value={String(configPoder.shikigamiId ?? '')} onChange={(event) => setConfigPoder({ ...configPoder, shikigamiId: Number(event.target.value) })} helperText="O vínculo escolhido ficará registrado na concessão.">
                    <option value="">Selecione o shikigami favorito...</option>
                    {vinculados.filter((vinculado) => vinculado.tipo === 'SHIKIGAMI').map((vinculado) => <option key={vinculado.id} value={vinculado.id}>{vinculado.nome}</option>)}
                  </Select>
                ) : escolhaPoder.tipo === 'FEITICO_CONHECIDO' ? (
                  <Select className="mt-2" value={String(configPoder.habilidadeTecnicaId ?? '')} onChange={(event) => setConfigPoder({ ...configPoder, habilidadeTecnicaId: Number(event.target.value) })} helperText={`Mostramos apenas habilidades da técnica ${dados?.opcoesRitualPredileto?.tecnicaNome ?? 'inata'} deste personagem.`}>
                    <option value="">Selecione uma habilidade da técnica...</option>
                    {opcoesRitual.map((habilidade) => <option key={habilidade.id} value={habilidade.id}>{habilidade.nome} (EA {habilidade.custoEA} / PE {habilidade.custoPE})</option>)}
                  </Select>
                ) : (
                  <Input label="Valor da escolha" value={String(configPoder.valor ?? '')} onChange={(event) => setConfigPoder({ ...configPoder, valor: event.target.value })} placeholder="Informe a escolha conforme a descrição" helperText="Esse valor será salvo apenas nesta concessão." />
                )}
              </div>
            ) : <p className="text-sm text-app-muted">Este poder não exige configuração adicional.</p>}
            <Button type="button" onClick={concederPoder} disabled={!podeConcederPoder}>Conceder poder</Button>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
