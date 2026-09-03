'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { apiGetPoderesGenericos, apiGetProficiencias } from '@/lib/api/catalogos';
import { criarErroUsuario } from '@/lib/api/error-handler';
import {
  apiConcederPoderGenericoCampanha, apiConcederProficienciaCampanha,
  apiCriarHabilidadePersonalizadaCampanha, apiGetConcessoesCampanha,
  apiRemoverHabilidadePersonalizadaCampanha, apiRemoverPoderGenericoCampanha,
  apiRemoverProficienciaCampanha, type ConcessoesCampanha,
} from '@/lib/api/campanha-concessoes';

export function CampaignCharacterConcessionsSection({ campanhaId, personagemId, ativo }: { campanhaId: number; personagemId: number; ativo: boolean }) {
  const [dados, setDados] = useState<ConcessoesCampanha | null>(null);
  const [poderId, setPoderId] = useState('');
  const [proficienciaId, setProficienciaId] = useState('');
  const [poderes, setPoderes] = useState<Array<{ id: number; nome: string }>>([]);
  const [proficiencias, setProficiencias] = useState<Array<{ id: number; nome: string }>>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [concessoes, listaPoderes, listaProficiencias] = await Promise.all([
        apiGetConcessoesCampanha(campanhaId, personagemId), apiGetPoderesGenericos(), apiGetProficiencias(),
      ]);
      setDados(concessoes); setPoderes(listaPoderes); setProficiencias(listaProficiencias);
    } catch (error) { setErro(criarErroUsuario(error).message); }
  }, [campanhaId, personagemId]);
  useEffect(() => { if (ativo) void carregar(); }, [ativo, carregar]);
  const executar = async (acao: () => Promise<unknown>) => { setErro(null); try { await acao(); await carregar(); } catch (error) { setErro(criarErroUsuario(error).message); } };

  return <section className="space-y-3 rounded-lg border border-app-border bg-app-surface p-4">
    <div><h3 className="text-sm font-semibold text-app-fg">Concessões permanentes</h3><p className="text-xs text-app-muted">Poderes, proficiências e habilidades descritivas concedidos pelo mestre.</p></div>
    {erro ? <ErrorAlert message={erro} /> : null}
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2"><Select label="Poder genérico" value={poderId} onChange={(event) => setPoderId(event.target.value)} options={[{ value: '', label: 'Selecione...' }, ...poderes.map((p) => ({ value: String(p.id), label: p.nome }))]} /><Button size="sm" disabled={!poderId} onClick={() => void executar(() => apiConcederPoderGenericoCampanha(campanhaId, personagemId, Number(poderId)))}>Conceder poder</Button></div>
      <div className="space-y-2"><Select label="Proficiência" value={proficienciaId} onChange={(event) => setProficienciaId(event.target.value)} options={[{ value: '', label: 'Selecione...' }, ...proficiencias.map((p) => ({ value: String(p.id), label: p.nome }))]} /><Button size="sm" disabled={!proficienciaId} onClick={() => void executar(() => apiConcederProficienciaCampanha(campanhaId, personagemId, Number(proficienciaId)))}>Conceder proficiência</Button></div>
    </div>
    <div className="grid gap-2 md:grid-cols-2"><Input label="Habilidade personalizada" value={nome} onChange={(event) => setNome(event.target.value)} /><Input label="Descrição" value={descricao} onChange={(event) => setDescricao(event.target.value)} /><Button size="sm" disabled={!nome.trim() || !descricao.trim()} onClick={() => void executar(async () => { await apiCriarHabilidadePersonalizadaCampanha(campanhaId, personagemId, nome, descricao); setNome(''); setDescricao(''); })}>Adicionar habilidade</Button></div>
    <div className="space-y-2 text-xs">{dados?.poderesGenericos.map((poder) => <div key={poder.id} className="flex justify-between gap-2 rounded border border-app-border p-2"><span>{poder.habilidade.nome}</span><Button size="xs" variant="ghost" onClick={() => void executar(() => apiRemoverPoderGenericoCampanha(campanhaId, personagemId, poder.id))}>Remover</Button></div>)}{dados?.proficienciasConcedidas.map((item) => <div key={item.proficiencia.id} className="flex justify-between gap-2 rounded border border-app-border p-2"><span>{item.proficiencia.nome}</span><Button size="xs" variant="ghost" onClick={() => void executar(() => apiRemoverProficienciaCampanha(campanhaId, personagemId, item.proficiencia.id))}>Remover</Button></div>)}{dados?.habilidadesPersonalizadas.map((habilidade) => <div key={habilidade.id} className="flex justify-between gap-2 rounded border border-app-border p-2"><span>{habilidade.nome}</span><Button size="xs" variant="ghost" onClick={() => void executar(() => apiRemoverHabilidadePersonalizadaCampanha(campanhaId, personagemId, habilidade.id))}>Remover</Button></div>)}</div>
  </section>;
}
