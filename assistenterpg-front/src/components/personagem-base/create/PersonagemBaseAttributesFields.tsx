// components/personagem-base/PersonagemBaseAttributesFields.tsx
'use client';

import { Input } from '@/components/ui/Input';

type Props = {
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  onChangeAgilidade: (v: number) => void;
  onChangeForca: (v: number) => void;
  onChangeIntelecto: (v: number) => void;
  onChangePresenca: (v: number) => void;
  onChangeVigor: (v: number) => void;
};

function parseNumberInput(value: string): number {
  // input[type=number] pode ficar '' enquanto o usuário edita; evita NaN e mantém controlado
  if (value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function PersonagemBaseAttributesFields({
  agilidade,
  forca,
  intelecto,
  presenca,
  vigor,
  onChangeAgilidade,
  onChangeForca,
  onChangeIntelecto,
  onChangePresenca,
  onChangeVigor,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Input
        label="Agilidade"
        type="number"
        min={0}
        value={agilidade}
        onChange={(e) => onChangeAgilidade(parseNumberInput(e.target.value))}
      />
      <Input
        label="Força"
        type="number"
        min={0}
        value={forca}
        onChange={(e) => onChangeForca(parseNumberInput(e.target.value))}
      />
      <Input
        label="Intelecto"
        type="number"
        min={0}
        value={intelecto}
        onChange={(e) => onChangeIntelecto(parseNumberInput(e.target.value))}
      />
      <Input
        label="Presença"
        type="number"
        min={0}
        value={presenca}
        onChange={(e) => onChangePresenca(parseNumberInput(e.target.value))}
      />
      <Input
        label="Vigor"
        type="number"
        min={0}
        value={vigor}
        onChange={(e) => onChangeVigor(parseNumberInput(e.target.value))}
      />
    </div>
  );
}
