'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
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
}: AddPersonagemModalProps) {
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
              !personagemSelecionadoId ||
              !iniciativaValor.trim()
            }
          >
            {adicionando ? 'Adicionando...' : 'Adicionar na cena'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
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
        <Input
          type="number"
          label="Iniciativa (inteiro)"
          value={iniciativaValor}
          onChange={(event) => onIniciativaValorChange(event.target.value)}
          placeholder="Ex.: 15"
        />
        <p className="text-xs text-app-muted">
          Dica: use este valor para refletir a iniciativa rolada pelo personagem.
        </p>
      </div>
    </Modal>
  );
}
