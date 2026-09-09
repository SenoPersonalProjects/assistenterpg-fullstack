'use client';

import { useState } from 'react';
import { SessionPanel } from '@/components/campanha/sessao/SessionPanel';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { NpcSessaoCampanha, SessaoCampanhaDetalhe } from '@/lib/types';

type AlvoControle =
  | { tipo: 'PERSONAGEM'; id: number; nome: string; controladorUsuarioId: number | null }
  | { tipo: 'NPC'; id: number; nome: string; controladorUsuarioId: number | null };

type Props = {
  elencoControladoPeloMestre: boolean;
  participantes: SessaoCampanhaDetalhe['participantes'];
  personagens: SessaoCampanhaDetalhe['cards'];
  npcs: NpcSessaoCampanha[];
  atualizando: boolean;
  onAtualizarElenco: (ativo: boolean) => void;
  onAtualizarControlador: (
    alvo: AlvoControle,
    controladorUsuarioId: number | null,
  ) => void;
};

export function SessionRosterControlPanel({
  elencoControladoPeloMestre,
  participantes,
  personagens,
  npcs,
  atualizando,
  onAtualizarElenco,
  onAtualizarControlador,
}: Props) {
  const [alvo, setAlvo] = useState<AlvoControle | null>(null);
  const jogadores = participantes.filter((participante) => participante.papel === 'JOGADOR');
  const abrirPersonagem = (card: SessaoCampanhaDetalhe['cards'][number]) =>
    setAlvo({
      tipo: 'PERSONAGEM',
      id: card.personagemSessaoId,
      nome: card.nomePersonagem,
      controladorUsuarioId: card.controladorUsuarioId ?? null,
    });
  const abrirNpc = (npc: NpcSessaoCampanha) =>
    setAlvo({
      tipo: 'NPC',
      id: npc.npcSessaoId,
      nome: npc.nome,
      controladorUsuarioId: npc.controladorUsuarioId ?? null,
    });
  const labelControlador = (id: number | null) =>
    jogadores.find((jogador) => jogador.usuarioId === id)?.apelido ?? 'Mestre';

  return (
    <>
      <SessionPanel
        title="Elenco e controle"
        subtitle="Defina quem opera cada participante nesta sessão."
        tone="control"
        right={
          <Button
            size="sm"
            variant={elencoControladoPeloMestre ? 'primary' : 'secondary'}
            disabled={atualizando}
            onClick={() => onAtualizarElenco(!elencoControladoPeloMestre)}
          >
            {elencoControladoPeloMestre ? 'Elenco do mestre ativo' : 'Ativar elenco do mestre'}
          </Button>
        }
      >
        <div className="space-y-2">
          {[...personagens.map((card) => ({
            tipo: 'PERSONAGEM' as const,
            nome: card.nomePersonagem,
            controladorUsuarioId: card.controladorUsuarioId ?? null,
            onClick: () => abrirPersonagem(card),
          })), ...npcs.filter((npc) => npc.visibilidade !== 'resumida').map((npc) => ({
            tipo: 'NPC' as const,
            nome: npc.nome,
            controladorUsuarioId: npc.controladorUsuarioId ?? null,
            onClick: () => abrirNpc(npc),
          }))].map((item) => (
            <div key={`${item.tipo}:${item.nome}`} className="flex items-center justify-between gap-3 rounded-lg border border-app-border/50 bg-app-surface/30 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-app-fg">{item.nome}</p>
                <Badge color={item.tipo === 'NPC' ? 'purple' : 'blue'} size="sm">{item.tipo === 'NPC' ? 'NPC' : 'Personagem'}</Badge>
              </div>
              <Button size="sm" variant="secondary" onClick={item.onClick} disabled={atualizando}>
                Controlador: {labelControlador(item.controladorUsuarioId)}
              </Button>
            </div>
          ))}
        </div>
      </SessionPanel>

      <Modal isOpen={alvo !== null} onClose={() => setAlvo(null)} title={alvo ? `Controle: ${alvo.nome}` : 'Controle'} size="sm">
        {alvo ? (
          <div className="space-y-3">
            <p className="text-sm text-app-muted">O mestre mantém a edição estrutural. O jogador delegado opera recursos, ações e rolagens.</p>
            <Button className="w-full justify-start" variant={alvo.controladorUsuarioId === null ? 'primary' : 'secondary'} disabled={atualizando} onClick={() => { onAtualizarControlador(alvo, null); setAlvo(null); }}>
              Mestre somente
            </Button>
            {jogadores.map((jogador) => (
              <Button key={jogador.usuarioId} className="w-full justify-start" variant={alvo.controladorUsuarioId === jogador.usuarioId ? 'primary' : 'secondary'} disabled={atualizando} onClick={() => { onAtualizarControlador(alvo, jogador.usuarioId); setAlvo(null); }}>
                {jogador.apelido}
              </Button>
            ))}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
