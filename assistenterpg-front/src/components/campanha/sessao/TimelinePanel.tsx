'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import type { EventoSessaoTimeline, UserErrorState } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';
import { formatarDataHora } from '@/lib/utils/formatters';

type TimelinePanelProps = {
  eventosSessao: EventoSessaoTimeline[];
  sessaoEncerrada: boolean;
  podeControlarSessao: boolean;
  desfazendoEventoId: number | null;
  erro?: UserErrorState | null;
  onAbrirDetalhes: (evento: EventoSessaoTimeline) => void;
  onDesfazerEvento: (evento: EventoSessaoTimeline) => void;
};

const CATEGORIAS = [
  ['TODOS', 'Todos os eventos'],
  ['DOMINIO', 'Domínios e barreiras'],
  ['RECURSO', 'Recursos'],
  ['CONDICAO', 'Condições'],
  ['CENA', 'Cena e turnos'],
  ['ROLAGEM', 'Rolagens'],
  ['OUTRO', 'Outros'],
] as const;

function opcoesContexto(
  eventos: EventoSessaoTimeline[],
  chave: 'personagens' | 'npcs' | 'dominios',
) {
  const porId = new Map<number, string>();
  eventos.forEach((evento) =>
    (evento.contexto?.[chave] ?? []).forEach((item) => porId.set(item.id, item.nome)),
  );
  return [...porId.entries()]
    .map(([id, nome]) => ({ id, nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function TimelinePanel({
  eventosSessao,
  sessaoEncerrada,
  podeControlarSessao,
  desfazendoEventoId,
  erro,
  onAbrirDetalhes,
  onDesfazerEvento,
}: TimelinePanelProps) {
  const [personagemId, setPersonagemId] = useState('');
  const [npcId, setNpcId] = useState('');
  const [dominioId, setDominioId] = useState('');
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number][0]>('TODOS');
  const opcoes = useMemo(
    () => ({
      personagens: opcoesContexto(eventosSessao, 'personagens'),
      npcs: opcoesContexto(eventosSessao, 'npcs'),
      dominios: opcoesContexto(eventosSessao, 'dominios'),
    }),
    [eventosSessao],
  );
  const filtrados = useMemo(
    () => eventosSessao.filter((evento) => {
      const contexto = evento.contexto;
      return (
        (categoria === 'TODOS' || contexto?.categoria === categoria) &&
        (!personagemId || contexto?.personagens.some((item) => item.id === Number(personagemId))) &&
        (!npcId || contexto?.npcs.some((item) => item.id === Number(npcId))) &&
        (!dominioId || contexto?.dominios.some((item) => item.id === Number(dominioId)))
      );
    }),
    [categoria, dominioId, eventosSessao, npcId, personagemId],
  );
  const filtrosAtivos = Boolean(personagemId || npcId || dominioId || categoria !== 'TODOS');

  function limparFiltros() {
    setPersonagemId('');
    setNpcId('');
    setDominioId('');
    setCategoria('TODOS');
  }

  return (
    <div className="space-y-2">
      {erro ? <ErrorAlert message={erro} /> : null}
      <div className="rounded border border-app-border bg-app-base/40 p-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-app-fg">Filtros do histórico</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-app-muted">{filtrados.length} de {eventosSessao.length}</span>
            {filtrosAtivos ? <Button type="button" size="xs" variant="ghost" onClick={limparFiltros}>Limpar</Button> : null}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-app-muted">Personagem
            <select className="mt-1 w-full rounded border border-app-border bg-app-surface p-1.5 text-xs text-app-fg" value={personagemId} onChange={(event) => setPersonagemId(event.target.value)}>
              <option value="">Todos</option>
              {opcoes.personagens.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
            </select>
          </label>
          <label className="text-xs text-app-muted">NPC
            <select className="mt-1 w-full rounded border border-app-border bg-app-surface p-1.5 text-xs text-app-fg" value={npcId} onChange={(event) => setNpcId(event.target.value)}>
              <option value="">Todos</option>
              {opcoes.npcs.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
            </select>
          </label>
          <label className="text-xs text-app-muted">Domínio
            <select className="mt-1 w-full rounded border border-app-border bg-app-surface p-1.5 text-xs text-app-fg" value={dominioId} onChange={(event) => setDominioId(event.target.value)}>
              <option value="">Todos</option>
              {opcoes.dominios.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
            </select>
          </label>
          <label className="text-xs text-app-muted">Evento
            <select className="mt-1 w-full rounded border border-app-border bg-app-surface p-1.5 text-xs text-app-fg" value={categoria} onChange={(event) => setCategoria(event.target.value as typeof categoria)}>
              {CATEGORIAS.map(([codigo, nome]) => <option key={codigo} value={codigo}>{nome}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="max-h-[420px] overflow-y-auto rounded border border-app-border p-2 space-y-2">
        {filtrados.length === 0 ? (
          <EmptyState
            variant="session"
            size="sm"
            icon="list"
            title={eventosSessao.length === 0 ? 'Sem eventos' : 'Nenhum evento encontrado'}
            description={eventosSessao.length === 0 ? 'Nenhum evento operacional registrado ainda.' : 'Ajuste ou limpe os filtros para consultar outros eventos.'}
          />
        ) : (
          filtrados.map((evento) => {
            const dominio = evento.contexto?.categoria === 'DOMINIO';
            return (
              <div key={evento.id} className={`rounded border px-2 py-2 space-y-1 ${dominio ? 'border-app-secondary/50 bg-app-secondary/10' : 'border-app-border bg-app-surface'}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-app-fg">{textoSeguro(evento.descricao)}</p>
                  <div className="flex shrink-0 gap-1">
                    {dominio ? <Badge color="purple" size="xs">Domínio</Badge> : null}
                    {evento.desfeito ? <Badge color="gray" size="xs">Desfeito</Badge> : null}
                  </div>
                </div>
                {evento.contexto?.dominios.length ? <p className="session-text-xxs text-app-secondary">{evento.contexto.dominios.map((item) => item.nome).join(' · ')}</p> : null}
                <p className="session-text-xxs text-app-muted">
                  {formatarDataHora(evento.criadoEm)}{evento.autor?.apelido ? ` por ${textoSeguro(evento.autor.apelido)}` : ''}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onAbrirDetalhes(evento)}>Detalhes</Button>
                  {podeControlarSessao && evento.podeDesfazer ? (
                    <Button size="sm" variant="secondary" onClick={() => onDesfazerEvento(evento)} disabled={Boolean(desfazendoEventoId) || sessaoEncerrada}>
                      {desfazendoEventoId === evento.id ? 'Desfazendo...' : 'Desfazer evento'}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
