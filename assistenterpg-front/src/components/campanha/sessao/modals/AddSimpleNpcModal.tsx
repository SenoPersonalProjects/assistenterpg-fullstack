'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import type { TipoFichaNpcAmeaca, TipoNpcAmeaca } from '@/lib/types';

type AddSimpleNpcModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  adicionando: boolean;
  sessaoEncerrada: boolean;
  nome: string;
  onNomeChange: (value: string) => void;
  defesa: string;
  onDefesaChange: (value: string) => void;
  pontosVidaMax: string;
  onPontosVidaMaxChange: (value: string) => void;
  iniciativaValor: string;
  onIniciativaValorChange: (value: string) => void;
  sanAtual: string;
  sanMax: string;
  eaAtual: string;
  eaMax: string;
  onSanAtualChange: (value: string) => void;
  onSanMaxChange: (value: string) => void;
  onEaAtualChange: (value: string) => void;
  onEaMaxChange: (value: string) => void;
  fichaTipo: TipoFichaNpcAmeaca;
  onFichaTipoChange: (value: TipoFichaNpcAmeaca) => void;
  tipo: TipoNpcAmeaca;
  onTipoChange: (value: TipoNpcAmeaca) => void;
  tamanho: string;
  onTamanhoChange: (value: string) => void;
  atributos: Record<'agilidade' | 'forca' | 'intelecto' | 'presenca' | 'vigor', string>;
  onAtributoChange: (campo: 'agilidade' | 'forca' | 'intelecto' | 'presenca' | 'vigor', value: string) => void;
  pericias: Record<'percepcao' | 'iniciativa' | 'fortitude' | 'reflexos' | 'vontade' | 'luta' | 'jujutsu', string>;
  onPericiaChange: (campo: 'percepcao' | 'iniciativa' | 'fortitude' | 'reflexos' | 'vontade' | 'luta' | 'jujutsu', value: string) => void;
};

const tamanhos = ['MINUSCULO', 'PEQUENO', 'MEDIO', 'GRANDE', 'ENORME', 'COLOSSAL'];

export function AddSimpleNpcModal({
  isOpen,
  onClose,
  onConfirm,
  adicionando,
  sessaoEncerrada,
  nome,
  onNomeChange,
  defesa,
  onDefesaChange,
  pontosVidaMax,
  onPontosVidaMaxChange,
  iniciativaValor,
  onIniciativaValorChange,
  sanAtual,
  sanMax,
  eaAtual,
  eaMax,
  onSanAtualChange,
  onSanMaxChange,
  onEaAtualChange,
  onEaMaxChange,
  fichaTipo,
  onFichaTipoChange,
  tipo,
  onTipoChange,
  tamanho,
  onTamanhoChange,
  atributos,
  onAtributoChange,
  pericias,
  onPericiaChange,
}: AddSimpleNpcModalProps) {
  const podeConfirmar =
    !adicionando &&
    !sessaoEncerrada &&
    nome.trim().length > 0 &&
    defesa.trim().length > 0 &&
    pontosVidaMax.trim().length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar NPC simples"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={adicionando}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!podeConfirmar}>
            {adicionando ? 'Adicionando...' : 'Adicionar NPC simples'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Nome" value={nome} onChange={(e) => onNomeChange(e.target.value)} />
          <Select
            label="Tipo de ficha"
            value={fichaTipo}
            onChange={(e) => onFichaTipoChange(e.target.value as TipoFichaNpcAmeaca)}
          >
            <option value="NPC">NPC</option>
            <option value="AMEACA">Ameaca</option>
          </Select>
          <Input type="number" label="PV max" value={pontosVidaMax} onChange={(e) => onPontosVidaMaxChange(e.target.value)} />
          <Input type="number" label="Defesa" value={defesa} onChange={(e) => onDefesaChange(e.target.value)} />
          <Input type="number" label="Iniciativa na ordem" value={iniciativaValor} onChange={(e) => onIniciativaValorChange(e.target.value)} placeholder="Opcional" />
          <Select label="Tipo" value={tipo} onChange={(e) => onTipoChange(e.target.value as TipoNpcAmeaca)}>
            <option value="OUTRO">Outro</option>
            <option value="HUMANO">Humano</option>
            <option value="FEITICEIRO">Feiticeiro</option>
            <option value="MALDICAO">Maldicao</option>
            <option value="ANIMAL">Animal</option>
            <option value="HIBRIDO">Hibrido</option>
          </Select>
          <Select label="Tamanho" value={tamanho} onChange={(e) => onTamanhoChange(e.target.value)}>
            {tamanhos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>

        <details className="rounded border border-app-border bg-app-surface p-3">
          <summary className="cursor-pointer text-xs font-semibold text-app-fg">
            Recursos opcionais (SAN / EA)
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input type="number" label="SAN atual" value={sanAtual} onChange={(e) => onSanAtualChange(e.target.value)} />
            <Input type="number" label="SAN max" value={sanMax} onChange={(e) => onSanMaxChange(e.target.value)} />
            <Input type="number" label="EA atual" value={eaAtual} onChange={(e) => onEaAtualChange(e.target.value)} />
            <Input type="number" label="EA max" value={eaMax} onChange={(e) => onEaMaxChange(e.target.value)} />
          </div>
        </details>

        <details className="rounded border border-app-border bg-app-surface p-3">
          <summary className="cursor-pointer text-xs font-semibold text-app-fg">
            Atributos opcionais
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
            <Input type="number" label="AGI" value={atributos.agilidade} onChange={(e) => onAtributoChange('agilidade', e.target.value)} />
            <Input type="number" label="FOR" value={atributos.forca} onChange={(e) => onAtributoChange('forca', e.target.value)} />
            <Input type="number" label="INT" value={atributos.intelecto} onChange={(e) => onAtributoChange('intelecto', e.target.value)} />
            <Input type="number" label="PRE" value={atributos.presenca} onChange={(e) => onAtributoChange('presenca', e.target.value)} />
            <Input type="number" label="VIG" value={atributos.vigor} onChange={(e) => onAtributoChange('vigor', e.target.value)} />
          </div>
        </details>

        <details className="rounded border border-app-border bg-app-surface p-3">
          <summary className="cursor-pointer text-xs font-semibold text-app-fg">
            Pericias opcionais
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
            <Input type="number" label="Percepcao" value={pericias.percepcao} onChange={(e) => onPericiaChange('percepcao', e.target.value)} />
            <Input type="number" label="Iniciativa" value={pericias.iniciativa} onChange={(e) => onPericiaChange('iniciativa', e.target.value)} />
            <Input type="number" label="Fortitude" value={pericias.fortitude} onChange={(e) => onPericiaChange('fortitude', e.target.value)} />
            <Input type="number" label="Reflexos" value={pericias.reflexos} onChange={(e) => onPericiaChange('reflexos', e.target.value)} />
            <Input type="number" label="Vontade" value={pericias.vontade} onChange={(e) => onPericiaChange('vontade', e.target.value)} />
            <Input type="number" label="Luta" value={pericias.luta} onChange={(e) => onPericiaChange('luta', e.target.value)} />
            <Input type="number" label="Jujutsu" value={pericias.jujutsu} onChange={(e) => onPericiaChange('jujutsu', e.target.value)} />
          </div>
        </details>
      </div>
    </Modal>
  );
}
