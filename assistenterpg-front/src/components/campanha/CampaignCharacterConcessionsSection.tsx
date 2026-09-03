'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { apiGetPoderesGenericos, apiGetProficiencias } from '@/lib/api/catalogos';
import { apiListarEntidadesVinculadasPersonagem } from '@/lib/api/campanhas';
import type { EntidadeVinculadaPersonagem } from '@/lib/types/campanha.types';
import type { PoderGenericoCatalogo, ProficienciaCatalogo } from '@/lib/types/catalogo.types';
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

type CatalogoAberto = 'PODER' | 'PROFICIENCIA' | null;

export function CampaignCharacterConcessionsSection({ campanhaId, personagemId, ativo }: { campanhaId: number; personagemId: number; ativo: boolean }) {
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
    try {
      const [concessoes, listaPoderes, listaProficiencias, listaVinculados] = await Promise.all([
        apiGetConcessoesCampanha(campanhaId, personagemId),
        apiGetPoderesGenericos(),
        apiGetProficiencias(),
        apiListarEntidadesVinculadasPersonagem(campanhaId, personagemId),
      ]);
      setDados(concessoes);
      setPoderes(listaPoderes);
      setProficiencias(listaProficiencias);
      setVinculados(listaVinculados);
    } catch (error) {
      setErro(criarErroUsuario(error).message);
    }
  }, [campanhaId, personagemId]);

  useEffect(() => { if (ativo) void carregar(); }, [ativo, carregar]);

  const executar = async (acao: () => Promise<unknown>) => {
    setErro(null);
    try { await acao(); await carregar(); } catch (error) { setErro(criarErroUsuario(error).message); }
  };

  const catalogoSelecionado = catalogoAberto === 'PODER' ? poderes : proficiencias;
  const escolhaPoder = poderSelecionado && typeof poderSelecionado.mecanicasEspeciais === 'object' && poderSelecionado.mecanicasEspeciais && 'escolha' in poderSelecionado.mecanicasEspeciais
    ? (poderSelecionado.mecanicasEspeciais as { escolha?: { tipo?: string } }).escolha : undefined;
  const opcoesRitual = dados?.opcoesRitualPredileto?.habilidades ?? [];
  const nomeHabilidadeConfigurada = (config: Record<string, unknown> | null | undefined) => {
    const id = Number(config?.habilidadeTecnicaId);
    return opcoesRitual.find((habilidade) => habilidade.id === id)?.nome ?? (Number.isInteger(id) && id > 0 ? `Habilidade #${id}` : null);
  };
  const concederPoder = () => {
    if (!poderSelecionado) return;
    void executar(() => apiConcederPoderGenericoCampanha(campanhaId, personagemId, poderSelecionado.id, configPoder));
    setPoderSelecionado(null); setConfigPoder({});
  };

  return (
    <section className="space-y-3 rounded-lg border border-app-border bg-app-surface p-4">
      <div>
        <h3 className="text-sm font-semibold text-app-fg">Concessões permanentes</h3>
        <p className="text-xs text-app-muted">Poderes, proficiências e habilidades descritivas concedidos pelo mestre.</p>
      </div>
      {erro ? <ErrorAlert message={erro} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {([
          ['PODER', 'Poder genérico', 'Escolha uma habilidade e veja sua descrição antes de conceder.'],
          ['PROFICIENCIA', 'Proficiência', 'Conceda proficiências de armas, proteções e categorias especiais.'],
        ] as const).map(([tipo, titulo, ajuda]) => (
          <div key={tipo} className="rounded border border-app-border p-3">
            <p className="text-sm font-semibold text-app-fg">{titulo}</p>
            <p className="mt-1 text-xs text-app-muted">{ajuda}</p>
            <Button className="mt-3" size="sm" onClick={() => setCatalogoAberto(tipo)}>Escolher {titulo.toLowerCase()}</Button>
          </div>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <Input label="Habilidade personalizada" value={nome} onChange={(event) => setNome(event.target.value)} />
        <Input label="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} />
        <Button size="sm" disabled={!nome.trim() || !descricao.trim()} onClick={() => void executar(async () => { await apiCriarHabilidadePersonalizadaCampanha(campanhaId, personagemId, nome, descricao); setNome(''); setDescricao(''); })}>Adicionar habilidade</Button>
      </div>
      <div className="space-y-2 text-xs">
        {dados?.poderesGenericos.map((poder) => <div key={poder.id} className="rounded border border-app-border p-3"><div className="flex justify-between gap-2"><span className="font-semibold">{poder.habilidade.nome}</span><Button size="xs" variant="ghost" onClick={() => void executar(() => apiRemoverPoderGenericoCampanha(campanhaId, personagemId, poder.id))}>Remover</Button></div>{poder.habilidade.descricao ? <p className="mt-1 text-xs text-app-muted">{poder.habilidade.descricao}</p> : null}{poder.config && Object.keys(poder.config).length > 0 ? <p className="mt-2 rounded bg-app-bg p-2 text-[11px] text-app-muted">Configuração: {nomeHabilidadeConfigurada(poder.config) ?? JSON.stringify(poder.config)}</p> : null}</div>)}
        {dados?.proficienciasConcedidas.map((item) => <div key={item.proficiencia.id} className="flex justify-between gap-2 rounded border border-app-border p-2"><span>{item.proficiencia.nome}</span><Button size="xs" variant="ghost" onClick={() => void executar(() => apiRemoverProficienciaCampanha(campanhaId, personagemId, item.proficiencia.id))}>Remover</Button></div>)}
        {dados?.habilidadesPersonalizadas.map((habilidade) => <div key={habilidade.id} className="flex justify-between gap-2 rounded border border-app-border p-2"><span>{habilidade.nome}</span><Button size="xs" variant="ghost" onClick={() => void executar(() => apiRemoverHabilidadePersonalizadaCampanha(campanhaId, personagemId, habilidade.id))}>Remover</Button></div>)}
      </div>
      <Modal isOpen={catalogoAberto !== null} onClose={() => setCatalogoAberto(null)} title={catalogoAberto === 'PODER' ? 'Conceder poder genérico' : 'Conceder proficiência'} size="lg">
        <div className="space-y-2">
          {catalogoSelecionado.map((item) => (
            <button key={item.id} type="button" className="w-full rounded-xl border border-app-border bg-app-surface p-3 text-left transition hover:border-app-primary/60 hover:bg-app-primary/5" onClick={() => { const tipo = catalogoAberto; if (tipo === 'PODER') { setCatalogoAberto(null); setPoderSelecionado(item as PoderGenericoCatalogo); setConfigPoder({}); } else { setCatalogoAberto(null); void executar(() => apiConcederProficienciaCampanha(campanhaId, personagemId, item.id)); } }}>
              <p className="font-semibold text-app-fg">{item.nome}</p>
              {item.descricao ? <p className="mt-1 text-xs leading-relaxed text-app-muted">{item.descricao}</p> : null}
            </button>
          ))}
        </div>
      </Modal>
      <Modal isOpen={poderSelecionado !== null} onClose={() => { setPoderSelecionado(null); setConfigPoder({}); }} title={`Configurar ${poderSelecionado?.nome ?? 'poder'}`} size="md">
        {poderSelecionado ? <div className="space-y-3"><p className="text-sm text-app-muted">{poderSelecionado.descricao}</p>{escolhaPoder ? <div className="space-y-2"><p className="text-sm font-semibold">Escolha exigida: {escolhaPoder.tipo}</p>{escolhaPoder.tipo === 'SHIKIGAMI' ? <select className="w-full rounded border border-app-border bg-app-card px-3 py-2" value={String(configPoder.shikigamiId ?? '')} onChange={(e) => setConfigPoder({ ...configPoder, shikigamiId: Number(e.target.value) })}><option value="">Selecione o shikigami favorito...</option>{vinculados.filter((v) => v.tipo === 'SHIKIGAMI').map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}</select> : escolhaPoder.tipo === 'FEITICO_CONHECIDO' ? <select className="w-full rounded border border-app-border bg-app-card px-3 py-2" value={String(configPoder.habilidadeTecnicaId ?? '')} onChange={(e) => setConfigPoder({ ...configPoder, habilidadeTecnicaId: Number(e.target.value) })}><option value="">Selecione uma habilidade da técnica {dados?.opcoesRitualPredileto?.tecnicaNome ?? 'inata'}...</option>{opcoesRitual.map((habilidade) => <option key={habilidade.id} value={habilidade.id}>{habilidade.nome} (EA {habilidade.custoEA} / PE {habilidade.custoPE})</option>)}</select> : <Input label="Valor da escolha" value={String(configPoder.valor ?? '')} onChange={(e) => setConfigPoder({ ...configPoder, valor: e.target.value })} placeholder="Informe a escolha conforme a descrição" />}</div> : <p className="text-sm text-app-muted">Este poder não exige configuração adicional.</p>}<Button onClick={concederPoder} disabled={Boolean(escolhaPoder && Object.keys(configPoder).length === 0)}>Conceder poder</Button></div> : null}
      </Modal>
    </section>
  );
}
