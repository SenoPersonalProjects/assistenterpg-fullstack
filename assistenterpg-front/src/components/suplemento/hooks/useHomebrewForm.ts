// src/components/suplemento/hooks/useHomebrewForm.ts

'use client';

import { useState, useCallback } from 'react';
import type { CreateHomebrewDto, DadosDanoArma, DadosReducaoDano, JsonValue } from '@/lib/api/homebrews';
import {
  TipoHomebrewConteudo,
  StatusPublicacao,
  TipoEquipamento,
  type TipoTecnicaAmaldicoada,
  type EmpunhaduraArma,
} from '@/lib/types/homebrew-enums';

type HomebrewHabilidadeInput = {
  codigo?: string;
  nome?: string;
  descricao?: string;
  execucao?: unknown;
  custoPE?: number | null;
  custoEA?: number | null;
  efeito?: string;
};

type HomebrewSubtipoComBase = {
  tipoBase?: string;
  dadosArma?: Record<string, unknown>;
  dadosProtecao?: Record<string, unknown>;
  efeito?: string;
  custoUso?: string;
  manutencao?: string;
  proficienciaRequerida?: boolean;
};

export type HomebrewFormDados = {
  [key: string]: unknown;
  tecnicaInataId?: number;
  caracteristicas?: unknown[] | string;
  requisitos?: unknown;
  pericias?: string[];
  habilidades?: HomebrewHabilidadeInput[] | string;
  classeId?: number;
  nivelRequisito?: number;
  tipo?: TipoEquipamento | TipoTecnicaAmaldicoada;
  categoria?: string;
  espacos?: number;
  tipoUso?: string;
  proficienciaArma?: string;
  empunhaduras?: EmpunhaduraArma[];
  tipoArma?: string;
  subtipoDistancia?: string;
  danos?: DadosDanoArma[];
  alcance?: string;
  tipoMunicaoCodigo?: string;
  habilidadeEspecial?: string;
  criticoValor?: number | null;
  criticoMultiplicador?: number | null;
  agil?: boolean | null;
  proficienciaProtecao?: string;
  tipoProtecao?: string;
  bonusDefesa?: number | null;
  penalidadeCarga?: number | null;
  reducoesDano?: DadosReducaoDano[];
  tipoAcessorio?: string;
  maxVestimentas?: number;
  requereEmpunhar?: boolean | null;
  periciaBonificada?: string;
  bonusPericia?: number;
  duracaoCenas?: number | null;
  recuperavel?: boolean | null;
  tipoExplosivo?: string;
  efeito?: string;
  tipoAmaldicoado?: string;
  hereditaria?: boolean;
  linkExterno?: string;
  mecanicas?: unknown;
  armaAmaldicoada?: HomebrewSubtipoComBase | null;
  protecaoAmaldicoada?: HomebrewSubtipoComBase | null;
  artefatoAmaldicoado?: HomebrewSubtipoComBase | null;
  efeitos?: string;
};

export type HomebrewFormInitialValues = {
  nome?: string;
  descricao?: string;
  tipo?: TipoHomebrewConteudo;
  status?: StatusPublicacao;
  tags?: string[];
  versao?: string;
  dados?: JsonValue;
};

type Params = {
  initialValues?: HomebrewFormInitialValues;
};

function toHomebrewFormDados(value: JsonValue | undefined): HomebrewFormDados {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as HomebrewFormDados)
    : {};
}

export function useHomebrewForm({ initialValues }: Params = {}) {
  // ==================== ESTADOS BÁSICOS ====================
  const [tipo, setTipo] = useState<TipoHomebrewConteudo>(
    initialValues?.tipo ?? TipoHomebrewConteudo.EQUIPAMENTO
  );
  const [nome, setNome] = useState(initialValues?.nome ?? '');
  const [descricao, setDescricao] = useState(initialValues?.descricao ?? '');
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [status, setStatus] = useState<StatusPublicacao>(
    initialValues?.status ?? StatusPublicacao.RASCUNHO
  );
  const [versao, setVersao] = useState(initialValues?.versao ?? '1.0.0');

  // ==================== DADOS ESPECÍFICOS ====================
  const [dados, setDados] = useState<HomebrewFormDados>(toHomebrewFormDados(initialValues?.dados));

  // ==================== CONTROLE ====================
  const [erro, setErro] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ==================== HELPERS ====================
  const updateDados = useCallback((partialDados: Partial<HomebrewFormDados>) => {
    setDados((prev) => ({ ...prev, ...partialDados }));
  }, []);

  const resetDados = useCallback(() => {
    setDados({});
  }, []);

  // Ao trocar tipo, limpa dados específicos
  const handleTipoChange = useCallback((novoTipo: TipoHomebrewConteudo) => {
    setTipo(novoTipo);
    setDados({});
    setErro(null);
  }, []);

  // ==================== VALIDAÇÃO ====================
  const validar = useCallback((): { valido: boolean; erros: string[] } => {
    const erros: string[] = [];

    // ✅ VALIDAÇÕES BÁSICAS
    if (!nome.trim()) {
      erros.push('Nome é obrigatório');
    } else if (nome.trim().length < 3) {
      erros.push('Nome deve ter pelo menos 3 caracteres');
    }

    // ✅ VALIDAÇÕES ESPECÍFICAS POR TIPO
    switch (tipo) {
      case TipoHomebrewConteudo.CLA:
        // Opcional: tecnicaInataId, caracteristicas, requisitos
        break;

      case TipoHomebrewConteudo.ORIGEM:
        if (!dados.pericias || !Array.isArray(dados.pericias) || dados.pericias.length === 0) {
          erros.push('Origem deve ter pelo menos uma perícia');
        }
        break;

      case TipoHomebrewConteudo.TRILHA:
        if (!dados.classeId) {
          erros.push('ID da classe é obrigatório');
        }
        if (!dados.habilidades || !Array.isArray(dados.habilidades) || dados.habilidades.length === 0) {
          erros.push('Trilha deve ter pelo menos uma habilidade');
        }
        break;

      case TipoHomebrewConteudo.CAMINHO:
        if (!dados.habilidades || !Array.isArray(dados.habilidades) || dados.habilidades.length === 0) {
          erros.push('Caminho deve ter pelo menos uma habilidade');
        }
        break;

      case TipoHomebrewConteudo.EQUIPAMENTO:
        if (!dados.tipo) {
          erros.push('Tipo de equipamento e obrigatorio');
        }
        if (!dados.categoria) {
          erros.push('Categoria de equipamento é obrigatória');
        }
        if (dados.espacos == null || dados.espacos < 0) {
          erros.push('Espaços deve ser um número válido (≥ 0)');
        }

        // Validacoes especificas por tipo
        const tipoEquipamento = dados.tipo as TipoEquipamento | undefined;

        if (tipoEquipamento === TipoEquipamento.ARMA) {
          if (!dados.proficienciaArma) erros.push('Proficiência de arma é obrigatória');
          if (!dados.empunhaduras || dados.empunhaduras.length === 0) {
            erros.push('Arma deve ter pelo menos uma empunhadura');
          }
          if (!dados.tipoArma) erros.push('Tipo de arma é obrigatório');
          if (!dados.danos || dados.danos.length === 0) {
            erros.push('Arma deve ter pelo menos um dano configurado');
          }
          if (!dados.alcance) erros.push('Alcance é obrigatório');
          if (dados.criticoValor == null) erros.push('Crítico (valor) é obrigatório');
          if (dados.criticoMultiplicador == null) erros.push('Crítico (multiplicador) é obrigatório');
          if (dados.agil == null) erros.push('Defina se a arma é ágil');
        }

        if (tipoEquipamento === TipoEquipamento.PROTECAO) {
          if (!dados.proficienciaProtecao) erros.push('Proficiência de proteção é obrigatória');
          if (!dados.tipoProtecao) erros.push('Tipo de proteção é obrigatório');
          if (dados.bonusDefesa == null) erros.push('Bônus de defesa é obrigatório');
          if (dados.penalidadeCarga == null) erros.push('Penalidade de carga é obrigatória');
        }

        if (tipoEquipamento === TipoEquipamento.ACESSORIO) {
          if (!dados.tipoAcessorio) erros.push('Tipo de acessório é obrigatório');
        }

        if (tipoEquipamento === TipoEquipamento.MUNICAO) {
          if (!dados.duracaoCenas) erros.push('Duração (cenas) é obrigatória');
          if (dados.recuperavel == null) erros.push('Defina se a munição é recuperável');
        }

        if (tipoEquipamento === TipoEquipamento.EXPLOSIVO) {
          if (!dados.tipoExplosivo) erros.push('Tipo de explosivo é obrigatório');
          if (!dados.efeito?.trim()) erros.push('Efeito do explosivo é obrigatório');
        }

        if (tipoEquipamento === TipoEquipamento.FERRAMENTA_AMALDICOADA) {
          if (!dados.tipoAmaldicoado) erros.push('Tipo amaldiçoado é obrigatório');

          // Validar que pelo menos um subtipo está preenchido
          const temArma = dados.armaAmaldicoada && dados.armaAmaldicoada.tipoBase;
          const temProtecao = dados.protecaoAmaldicoada && dados.protecaoAmaldicoada.tipoBase;
          const temArtefato = dados.artefatoAmaldicoado && dados.artefatoAmaldicoado.tipoBase;

          if (!temArma && !temProtecao && !temArtefato) {
            erros.push('Ferramenta amaldiçoada deve ter arma, proteção ou artefato configurado');
          }
        }

        if (tipoEquipamento === TipoEquipamento.ITEM_OPERACIONAL) {
          // Campos opcionais, sem validação obrigatória
        }

        if (tipoEquipamento === TipoEquipamento.ITEM_AMALDICOADO) {
          if (!dados.tipoAmaldicoado) erros.push('Tipo amaldiçoado é obrigatório');
          if (!dados.efeito?.trim()) erros.push('Efeito do item amaldiçoado é obrigatório');
        }
        break;

      case TipoHomebrewConteudo.PODER_GENERICO:
        if (!dados.efeitos?.trim()) {
          erros.push('Descrição dos efeitos é obrigatória');
        }
        break;

      case TipoHomebrewConteudo.TECNICA_AMALDICOADA:
        if (!dados.tipo) {
          erros.push('Tipo de técnica é obrigatório');
        }
        if (!dados.habilidades || !Array.isArray(dados.habilidades) || dados.habilidades.length === 0) {
          erros.push('Técnica deve ter pelo menos uma habilidade');
        }

        // Validar cada habilidade
        if (Array.isArray(dados.habilidades)) {
          dados.habilidades.forEach((hab, idx: number) => {
            if (!hab.codigo?.trim()) erros.push(`Habilidade #${idx + 1}: Código é obrigatório`);
            if (!hab.nome?.trim()) erros.push(`Habilidade #${idx + 1}: Nome é obrigatório`);
            if (!hab.descricao?.trim()) erros.push(`Habilidade #${idx + 1}: Descrição é obrigatória`);
            if (!hab.execucao) erros.push(`Habilidade #${idx + 1}: Execução é obrigatória`);
            if (hab.custoPE == null) erros.push(`Habilidade #${idx + 1}: Custo PE é obrigatório`);
            if (hab.custoEA == null) erros.push(`Habilidade #${idx + 1}: Custo EA é obrigatório`);
            if (!hab.efeito?.trim()) erros.push(`Habilidade #${idx + 1}: Efeito é obrigatório`);
          });
        }
        break;
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }, [tipo, nome, dados]);

  // ==================== PAYLOAD ====================
  const buildPayload = useCallback((): CreateHomebrewDto => {
    const validacao = validar();
    if (!validacao.valido) {
      throw new Error(validacao.erros.join('\n'));
    }

    return {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      tipo,
      status,
      tags: tags.length > 0 ? tags : undefined,
      versao,
      dados: dados as unknown as JsonValue,
    };
  }, [nome, descricao, tipo, status, tags, versao, dados, validar]);

  // ==================== RESET ====================
  const reset = useCallback(() => {
    setNome('');
    setDescricao('');
    setTags([]);
    setStatus(StatusPublicacao.RASCUNHO);
    setVersao('1.0.0');
    setDados({});
    setErro(null);
    // Mantém o tipo selecionado para facilitar criação em lote
  }, []);

  return {
    // Estados
    tipo,
    nome,
    descricao,
    tags,
    status,
    versao,
    dados,
    erro,
    submitting,

    // Setters
    setTipo: handleTipoChange,
    setNome,
    setDescricao,
    setTags,
    setStatus,
    setVersao,
    setDados,
    updateDados,
    resetDados,
    setErro,
    setSubmitting,

    // Helpers
    validar,
    buildPayload,
    reset,
  };
}

