'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { PersonagemCampanhaResumo } from '@/lib/types';
import { textoSeguro } from '@/lib/campanha/sessao-formatters';

type AddPersonagemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adicionando: boolean;
  sessaoEncerrada: boolean;
  personagensDisponiveis: PersonagemCampanhaResumo[];
  personagemSelecionadoId: string;
  onPersonagemSelecionadoChange: (value: string) => void;
  iniciativaValor: string;
  onIniciativaValorChange: (value: string) => void;
  carregando: boolean;
  erro?: string | null;
};

export function AddPersonagemModal({
  isOpen,
  onClose,
  onConfirm,
  adicionando,
  sessaoEncerrada,
  personagensDisponiveis,
  personagemSelecionadoId,
  onPersonagemSelecionadoChange,
  iniciativaValor,
  onIniciativaValorChange,
  carregando,
  erro,
}: AddPersonagemModalProps) {
  const personagemSelecionado = personagensDisponiveis.find(
    (item) => String(item.id) === personagemSelecionadoId,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar personagem na cena"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={adicionando}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={
              adicionando ||
              sessaoEncerrada ||
              carregando ||
              personagensDisponiveis.length === 0 ||
              !personagemSelecionadoId
            }
          >
            {adicionando ? 'Adicionando...' : 'Adicionar na cena'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {erro ? <ErrorAlert message={erro} /> : null}
        <p className="text-sm text-app-muted">
          Selecione um personagem associado e informe a iniciativa para adiciona-lo
          na cena.
        </p>

        <Select
          label="Personagem disponivel"
          value={personagemSelecionadoId}
          onChange={(event) => onPersonagemSelecionadoChange(event.target.value)}
        >
          {carregando ? <option value="">Carregando...</option> : null}
          {!carregando && personagensDisponiveis.length === 0 ? (
            <option value="">Nenhum personagem disponivel</option>
          ) : null}
          {personagensDisponiveis.map((personagem) => (
            <option key={personagem.id} value={String(personagem.id)}>
              {textoSeguro(personagem.nome)} ({textoSeguro(personagem.dono?.apelido ?? '')})
            </option>
          ))}
        </Select>

        {carregando ? <Loading size="sm" message="Carregando personagens..." /> : null}

        {personagemSelecionado ? (
          <div className="rounded border border-app-border bg-app-surface p-3 space-y-2">
            <p className="text-xs font-semibold text-app-fg">
              {textoSeguro(personagemSelecionado.nome)}
            </p>
            <p className="text-xs text-app-muted">
              Jogador: {textoSeguro(personagemSelecionado.dono?.apelido ?? '-')}
            </p>
            <div className="session-chip-row">
              <span className="session-chip">
                PV {personagemSelecionado.recursos.pvAtual}/
                {personagemSelecionado.recursos.pvMax}
              </span>
              <span className="session-chip">
                SAN {personagemSelecionado.recursos.sanAtual}/
                {personagemSelecionado.recursos.sanMax}
              </span>
              <span className="session-chip">
                PE {personagemSelecionado.recursos.peAtual}/
                {personagemSelecionado.recursos.peMax}
              </span>
              <span className="session-chip">
                EA {personagemSelecionado.recursos.eaAtual}/
                {personagemSelecionado.recursos.eaMax}
              </span>
            </div>
          </div>
        ) : null}

        <div className="rounded border border-app-border bg-app-bg p-3 space-y-2">
          <p className="text-xs font-semibold text-app-fg">Iniciativa</p>
          <Input
            type="number"
            label="Valor inteiro"
            value={iniciativaValor}
            onChange={(event) => onIniciativaValorChange(event.target.value)}
            placeholder="Ex.: 15"
          />
          <p className="text-xs text-app-muted">
            Use este valor para refletir a iniciativa rolada pelo personagem.
          </p>
        </div>
      </div>
    </Modal>
  );
}
