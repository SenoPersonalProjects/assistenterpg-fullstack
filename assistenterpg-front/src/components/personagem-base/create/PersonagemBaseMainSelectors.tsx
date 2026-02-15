// components/personagem-base/PersonagemBaseMainSelectors.tsx
'use client';

import { Select } from '@/components/ui/Select';
import type {
  ClasseCatalogo,
  ClaCatalogo,
  OrigemCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
} from '@/lib/api';

type Props = {
  classes: ClasseCatalogo[];
  clas: ClaCatalogo[];
  origens: OrigemCatalogo[];
  trilhas: TrilhaCatalogo[];
  caminhos: CaminhoCatalogo[];

  claId: string;
  origemId: string;
  classeId: string;
  trilhaId: string;
  caminhoId: string;

  onChangeClaId: (v: string) => void;
  onChangeOrigemId: (v: string) => void;
  onChangeClasseId: (v: string) => void;
  onChangeTrilhaId: (v: string) => void;
  onChangeCaminhoId: (v: string) => void;
};

export function PersonagemBaseMainSelectors({
  classes,
  clas,
  origens,
  trilhas,
  caminhos,
  claId,
  origemId,
  classeId,
  trilhaId,
  caminhoId,
  onChangeClaId,
  onChangeOrigemId,
  onChangeClasseId,
  onChangeTrilhaId,
  onChangeCaminhoId,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Select
        label="Clã"
        value={claId}
        onChange={(e) => onChangeClaId(e.target.value)}
        options={[
          { value: '', label: 'Selecione um clã' },
          ...clas.map((c) => ({ value: String(c.id), label: c.nome })),
        ]}
      />

      <Select
        label="Origem"
        value={origemId}
        onChange={(e) => onChangeOrigemId(e.target.value)}
        options={[
          { value: '', label: 'Selecione uma origem' },
          ...origens.map((o) => ({ value: String(o.id), label: o.nome })),
        ]}
      />

      <Select
        label="Classe"
        value={classeId}
        onChange={(e) => onChangeClasseId(e.target.value)}
        options={[
          { value: '', label: 'Selecione uma classe' },
          ...classes.map((classe) => ({
            value: String(classe.id),
            label: classe.nome,
          })),
        ]}
      />

      <Select
        label="Trilha"
        value={trilhaId}
        onChange={(e) => onChangeTrilhaId(e.target.value)}
        options={[
          { value: '', label: 'Selecione uma trilha' },
          ...trilhas.map((t) => ({
            value: String(t.id),
            label: t.nome,
          })),
        ]}
      />

      <Select
        label="Caminho (se houver)"
        value={caminhoId}
        onChange={(e) => onChangeCaminhoId(e.target.value)}
        options={[
          { value: '', label: 'Sem caminho específico' },
          ...caminhos.map((c) => ({
            value: String(c.id),
            label: c.nome,
          })),
        ]}
      />
    </div>
  );
}
