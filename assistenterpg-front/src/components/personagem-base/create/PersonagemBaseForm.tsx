// components/personagem-base/create/PersonagemBaseForm.tsx
'use client';

import React from 'react';
import type {
  AtributoBaseCodigo,
  CreatePersonagemBasePayload,
  UpdatePersonagemBasePayload,
  ClasseCatalogo,
  ClaCatalogo,
  OrigemCatalogo,
  ProficienciaCatalogo,
  TipoGrauCatalogo,
  TrilhaCatalogo,
  CaminhoCatalogo,
  TecnicaInataCatalogo,
  AlinhamentoCatalogo,
  PericiaCatalogo,
  GrauTreinamento,
  PoderGenericoInstanciaPayload,
  PassivasAtributoConfigFront,
  ItemInventarioDto, // ✅ ADICIONAR
} from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { PersonagemBaseBasicInfo } from './PersonagemBaseBasicInfo';
import { PersonagemBaseMainSelectors } from './PersonagemBaseMainSelectors';
import { PersonagemBaseAttributesFields } from './PersonagemBaseAttributesFields';
import { PersonagemBaseGrausField } from './PersonagemBaseGrausField';
import { usePersonagemBaseFormState } from './usePersonagemBaseFormState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

// ✅ InitialValues alinhado ao fluxo novo (passivas por atributo)
export type InitialValues = {
  nome: string;
  nivel: number;
  claId: number;
  origemId: number;
  classeId: number;
  trilhaId: number | null;
  caminhoId: number | null;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  estudouEscolaTecnica: boolean;
  tecnicaInataId: number | null;
  proficienciasCodigos: string[];
  grausAprimoramento: {
    tipoGrauCodigo: string;
    valor: number;
  }[];

  idade: number | null;
  prestigioBase: number;
  prestigioClaBase: number | null;
  alinhamentoId: number | null;
  background: string | null;
  atributoChaveEa: 'INT' | 'PRE';

  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  periciasLivresCodigos: string[];

  // ✅ campos novos
  grausTreinamento?: GrauTreinamento[];
  
  // ✅ NOVO: inventário
  itensInventario?: ItemInventarioDto[];
  
  // ✅ FORMATO NOVO: array de instâncias com config
  poderesGenericos?: PoderGenericoInstanciaPayload[];

  habilidadesConfig?: {
    habilidadeId: number;
    config?: Record<string, unknown>;
  }[];
  
  // ✅ fonte da verdade (novo)
  passivasAtributosAtivos?: AtributoBaseCodigo[];
  
  // ✅ NOVO: configs de Intelecto I/II (necessário para edição)
  passivasAtributosConfig?: PassivasAtributoConfigFront;

  // ⚠️ legado (opcional manter por compatibilidade, mas não usar no fluxo novo)
  poderesGenericosSelecionadosIds?: number[];
  passivasAtributoIds?: number[];
};

type BaseProps = {
  classes: ClasseCatalogo[];
  clas: ClaCatalogo[];
  origens: OrigemCatalogo[];
  proficiencias: ProficienciaCatalogo[];
  tiposGrau: TipoGrauCatalogo[];
  tecnicasInatas: TecnicaInataCatalogo[];
  alinhamentos: AlinhamentoCatalogo[];
  pericias: PericiaCatalogo[];
  carregarTrilhasDaClasse: (classeId: number) => Promise<TrilhaCatalogo[]>;
  carregarCaminhosDaTrilha: (trilhaId: number) => Promise<CaminhoCatalogo[]>;
};

type CreateProps = BaseProps & {
  mode?: 'create';
  initialValues?: undefined;
  onSubmitCreate: (data: CreatePersonagemBasePayload) => Promise<void>;
};

type EditProps = BaseProps & {
  mode: 'edit';
  initialValues: InitialValues;
  onSubmitEdit: (data: UpdatePersonagemBasePayload) => Promise<void>;
};

type Props = CreateProps | EditProps;

export function PersonagemBaseForm(props: Props) {
  const {
    classes,
    clas,
    origens,
    tiposGrau,
    tecnicasInatas,
    alinhamentos,
    carregarTrilhasDaClasse,
    carregarCaminhosDaTrilha,
  } = props;

  const mode = props.mode === 'edit' ? 'edit' : 'create';

  const editInitial = (props as EditProps).initialValues;
  const initialValues =
    mode === 'edit' && editInitial
      ? {
          ...editInitial,
          periciasClasseEscolhidasCodigos: editInitial.periciasClasseEscolhidasCodigos ?? [],
          periciasOrigemEscolhidasCodigos: editInitial.periciasOrigemEscolhidasCodigos ?? [],
          periciasLivresCodigos: editInitial.periciasLivresCodigos ?? [],
          grausTreinamento: editInitial.grausTreinamento ?? [],
          itensInventario: editInitial.itensInventario ?? [], // ✅ NOVO
          poderesGenericosSelecionadosIds: editInitial.poderesGenericosSelecionadosIds ?? [],
          passivasAtributosAtivos: editInitial.passivasAtributosAtivos ?? [],
        }
      : undefined;

  const {
    isEdit,
    erro,
    setErro,
    submitting,
    setSubmitting,

    // básicos + meta
    nome,
    setNome,
    nivel,
    setNivel,
    estudouEscolaTecnica,
    setEstudouEscolaTecnica,
    idade,
    setIdade,
    prestigioBase,
    setPrestigioBase,
    prestigioClaBase,
    setPrestigioClaBase,
    alinhamentoId,
    setAlinhamentoId,
    background,
    setBackground,

    // origem / classe / clã / trilha / caminho
    claId,
    setClaId,
    origemId,
    setOrigemId,
    classeId,
    setClasseId,
    trilhaId,
    setTrilhaId,
    caminhoId,
    setCaminhoId,

    // atributos
    agilidade,
    setAgilidade,
    forca,
    setForca,
    intelecto,
    setIntelecto,
    presenca,
    setPresenca,
    vigor,
    setVigor,
    atributoChaveEa,
    setAtributoChaveEa,

    // técnica / graus
    tecnicaInataId,
    setTecnicaInataId,
    graus,
    handleGrauChange,

    trilhas,
    caminhos,

    buildCreatePayload,
    buildUpdatePayload,
    resetCreateState,
  } = usePersonagemBaseFormState({
    mode,
    initialValues,
    carregarTrilhasDaClasse,
    carregarCaminhosDaTrilha,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      setErro('Nome é obrigatório');
      return;
    }
    if (!claId || !origemId || !classeId) {
      setErro('Classe, Clã e Origem são obrigatórios');
      return;
    }

    setErro(null);
    setSubmitting(true);

    try {
      if (isEdit) {
        const payload: UpdatePersonagemBasePayload = buildUpdatePayload();
        await (props as EditProps).onSubmitEdit(payload);
      } else {
        const payload: CreatePersonagemBasePayload = buildCreatePayload();
        await (props as CreateProps).onSubmitCreate(payload);
        resetCreateState();
      }
    } catch {
      setErro(isEdit ? 'Erro ao atualizar personagem-base' : 'Erro ao criar personagem-base');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SectionTitle className="mt-0">{isEdit ? 'Editar personagem-base' : 'Dados básicos'}</SectionTitle>

        <PersonagemBaseBasicInfo
          nome={nome}
          nivel={nivel}
          estudouEscolaTecnica={estudouEscolaTecnica}
          erroNome={erro === 'Nome é obrigatório' ? erro : undefined}
          onChangeNome={setNome}
          onChangeNivel={setNivel}
          onChangeEstudouEscolaTecnica={setEstudouEscolaTecnica}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Idade"
            type="number"
            min={0}
            value={idade ?? ''}
            onChange={(e) => setIdade(e.target.value === '' ? null : Number(e.target.value))}
          />
          <Input
            label="Prestígio geral base"
            type="number"
            value={prestigioBase}
            onChange={(e) => setPrestigioBase(Number(e.target.value) || 0)}
          />
          <Input
            label="Prestígio do clã base"
            type="number"
            value={prestigioClaBase ?? ''}
            onChange={(e) => setPrestigioClaBase(e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>

        <Select
          label="Alinhamento"
          value={alinhamentoId}
          onChange={(e) => setAlinhamentoId(e.target.value)}
          options={[
            { value: '', label: 'Selecione...' },
            ...alinhamentos.map((a) => ({ value: String(a.id), label: a.nome })),
          ]}
        />

        <Textarea
          label="Background / descrição"
          value={background ?? ''}
          onChange={(e) => setBackground(e.target.value || null)}
          placeholder="Opcional: conte a história do personagem..."
          rows={4}
        />

        <SectionTitle>Origem e papel</SectionTitle>
        <PersonagemBaseMainSelectors
          classes={classes}
          clas={clas}
          origens={origens}
          trilhas={trilhas}
          caminhos={caminhos}
          claId={claId}
          origemId={origemId}
          classeId={classeId}
          trilhaId={trilhaId}
          caminhoId={caminhoId}
          tecnicaInataId={tecnicaInataId}
          onChangeClaId={setClaId}
          onChangeOrigemId={setOrigemId}
          onChangeClasseId={setClasseId}
          onChangeTrilhaId={setTrilhaId}
          onChangeCaminhoId={setCaminhoId}
        />

        <SectionTitle>Atributos</SectionTitle>
        <PersonagemBaseAttributesFields
          agilidade={agilidade}
          forca={forca}
          intelecto={intelecto}
          presenca={presenca}
          vigor={vigor}
          onChangeAgilidade={setAgilidade}
          onChangeForca={setForca}
          onChangeIntelecto={setIntelecto}
          onChangePresenca={setPresenca}
          onChangeVigor={setVigor}
        />

        <Select
          label="Atributo-chave de energia amaldiçoada"
          value={atributoChaveEa}
          onChange={(e) => setAtributoChaveEa(e.target.value as 'INT' | 'PRE')}
          options={[
            { value: 'INT', label: 'Intelecto' },
            { value: 'PRE', label: 'Presença' },
          ]}
        />

        <SectionTitle>Características especiais</SectionTitle>
        
        {/* ✅ Técnica inata */}
        <Select
          label="Técnica inata"
          value={tecnicaInataId}
          onChange={(e) => setTecnicaInataId(e.target.value)}
          options={[
            { value: '', label: 'Nenhuma' },
            ...tecnicasInatas.map((t) => ({ value: String(t.id), label: t.nome })),
          ]}
        />

        {/* ✅ INFO: Proficiências são calculadas automaticamente */}
        <div className="rounded border border-app-border bg-app-surface p-3">
          <p className="text-xs text-app-muted">
            <strong>ℹ️ Proficiências:</strong> São calculadas automaticamente pelo sistema com base na classe, trilha, poderes e passivas selecionadas.
            {isEdit && ' Use o wizard para gerenciar poderes e passivas que concedem proficiências adicionais.'}
          </p>
        </div>

        <PersonagemBaseGrausField tiposGrau={tiposGrau} valores={graus} onChangeValor={handleGrauChange} />

        {erro && erro !== 'Nome é obrigatório' && <p className="text-sm text-app-danger">{erro}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? (isEdit ? 'Salvando...' : 'Criando...') : isEdit ? 'Salvar alterações' : 'Criar personagem-base'}
        </Button>
      </form>
    </Card>
  );
}
