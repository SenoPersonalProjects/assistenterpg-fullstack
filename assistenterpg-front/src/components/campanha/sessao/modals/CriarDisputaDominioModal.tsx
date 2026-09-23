'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';

type DominioElegivel = {
  id: number;
  nome: string;
  tipo: string;
  participante: { nome: string };
  disputas: Array<{ estado: string }>;
};

type ParticipanteAlvo = {
  id: number;
  nome: string;
  tipo: 'PERSONAGEM' | 'NPC';
};

type Props = {
  isOpen: boolean;
  dominios: DominioElegivel[];
  alvos: ParticipanteAlvo[];
  enviando: boolean;
  erro?: string | null;
  onClose: () => void;
  onConfirmar: (dados: {
    dominioIds: number[];
    alvosPersonagemSessaoIds: number[];
    alvosNpcSessaoIds: number[];
  }) => void;
};

function alternarId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function CriarDisputaDominioModal({
  isOpen,
  dominios,
  alvos,
  enviando,
  erro,
  onClose,
  onConfirmar,
}: Props) {
  const [dominioIds, setDominioIds] = useState<number[]>([]);
  const [alvoTokens, setAlvoTokens] = useState<string[]>([]);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const dominiosElegiveis = useMemo(
    () => dominios.filter((dominio) => !dominio.disputas.some((disputa) => disputa.estado === 'ATIVA')),
    [dominios],
  );

  function confirmar() {
    if (dominioIds.length < 2) {
      setErroLocal('Selecione pelo menos dois Domínios para iniciar a disputa.');
      return;
    }
    const selecionados = alvos.filter((alvo) => alvoTokens.includes(`${alvo.tipo}:${alvo.id}`));
    onConfirmar({
      dominioIds,
      alvosPersonagemSessaoIds: selecionados
        .filter((alvo) => alvo.tipo === 'PERSONAGEM')
        .map((alvo) => alvo.id),
      alvosNpcSessaoIds: selecionados
        .filter((alvo) => alvo.tipo === 'NPC')
        .map((alvo) => alvo.id),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={enviando ? () => undefined : onClose}
      title="Criar disputa de Domínios"
      size="xl"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="button" onClick={confirmar} disabled={enviando || dominioIds.length < 2}>
            {enviando ? 'Criando disputa...' : 'Iniciar disputa'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {erro || erroLocal ? <ErrorAlert message={erro ?? erroLocal ?? ''} /> : null}
        <div className="rounded-xl border border-app-secondary/40 bg-app-secondary/10 p-3 text-sm text-app-fg">
          <p className="font-semibold">Como funciona a Dominância</p>
          <p className="mt-1 text-xs text-app-muted">
            Cada Domínio começa com 0. A cada Refinamento, a margem sobre o segundo melhor resultado concede +1, +2 ou +3 de Dominância. Ao chegar a 3, vence imediatamente; após três resoluções vence a maior Dominância e empate colapsa todos os Domínios envolvidos.
          </p>
        </div>

        <section aria-labelledby="disputa-dominios-titulo" className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 id="disputa-dominios-titulo" className="text-sm font-semibold text-app-fg">
              Domínios participantes
            </h3>
            <Badge color={dominioIds.length >= 2 ? 'green' : 'yellow'} size="sm">
              {dominioIds.length}/2 mínimos
            </Badge>
          </div>
          {dominiosElegiveis.length === 0 ? (
            <p className="rounded border border-app-border p-3 text-sm text-app-muted">
              Não há dois Domínios ativos disponíveis fora de uma disputa.
            </p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {dominiosElegiveis.map((dominio) => (
                <div key={dominio.id} className="rounded-lg border border-app-border bg-app-base/40 p-3">
                  <Checkbox
                    checked={dominioIds.includes(dominio.id)}
                    onChange={() => {
                      setErroLocal(null);
                      setDominioIds((ids) => alternarId(ids, dominio.id));
                    }}
                    label={
                      <span>
                        <span className="font-semibold">{dominio.nome}</span>
                        <span className="block text-xs text-app-muted">
                          {dominio.participante.nome} · Domínio {dominio.tipo.toLowerCase()}
                        </span>
                      </span>
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="disputa-alvos-titulo" className="space-y-2">
          <div>
            <h3 id="disputa-alvos-titulo" className="text-sm font-semibold text-app-fg">
              Alvos na região de colisão <span className="font-normal text-app-muted">(opcional)</span>
            </h3>
            <p className="text-xs text-app-muted">
              Para estes alvos, o Acerto Garantido dos Domínios em disputa fica neutralizado enquanto a disputa estiver ativa. Sem alvos, a disputa ainda acontece, mas não neutraliza Acertos Garantidos.
            </p>
          </div>
          {alvos.length === 0 ? (
            <p className="rounded border border-app-border p-3 text-sm text-app-muted">Nenhum participante disponível na cena.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {alvos.map((alvo) => (
                <div key={`${alvo.tipo}-${alvo.id}`} className="rounded-lg border border-app-border bg-app-base/40 p-3">
                  <Checkbox
                    checked={alvoTokens.includes(`${alvo.tipo}:${alvo.id}`)}
                    onChange={() =>
                      setAlvoTokens((tokens) => {
                        const token = `${alvo.tipo}:${alvo.id}`;
                        return tokens.includes(token)
                          ? tokens.filter((item) => item !== token)
                          : [...tokens, token];
                      })
                    }
                    label={
                      <span>
                        <span className="font-semibold">{alvo.nome}</span>
                        <span className="ml-2 text-xs text-app-muted">{alvo.tipo === 'NPC' ? 'NPC' : 'Personagem'}</span>
                      </span>
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
