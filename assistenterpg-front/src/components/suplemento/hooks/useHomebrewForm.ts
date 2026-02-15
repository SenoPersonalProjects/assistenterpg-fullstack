// src/components/suplemento/hooks/useHomebrewForm.ts

'use client';

import { useState, useCallback } from 'react';
import type {
  TipoHomebrewConteudo,
  CreateHomebrewDto,
  StatusPublicacao,
} from '@/lib/api/homebrews';
import { CategoriaEquipamento } from '@/lib/types/homebrew-enums';

type InitialValues = {
  nome?: string;
  descricao?: string;
  tipo?: TipoHomebrewConteudo;
  status?: StatusPublicacao;
  tags?: string[];
  versao?: string;
  dados?: any;
};

type Params = {
  initialValues?: InitialValues;
};

export function useHomebrewForm({ initialValues }: Params = {}) {
  // ==================== ESTADOS BÁSICOS ====================
  const [tipo, setTipo] = useState<TipoHomebrewConteudo>(
    initialValues?.tipo ?? 'EQUIPAMENTO'
  );
  const [nome, setNome] = useState(initialValues?.nome ?? '');
  const [descricao, setDescricao] = useState(initialValues?.descricao ?? '');
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [status, setStatus] = useState<StatusPublicacao>(
    initialValues?.status ?? 'RASCUNHO'
  );
  const [versao, setVersao] = useState(initialValues?.versao ?? '1.0.0');

  // ==================== DADOS ESPECÍFICOS ====================
  const [dados, setDados] = useState<any>(initialValues?.dados ?? {});

  // ==================== CONTROLE ====================
  const [erro, setErro] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ==================== HELPERS ====================
  const updateDados = useCallback((partialDados: any) => {
    setDados((prev: any) => ({ ...prev, ...partialDados }));
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
      case 'CLA':
        // Opcional: tecnicaInataId, caracteristicas, requisitos
        break;

      case 'ORIGEM':
        if (!dados.pericias || !Array.isArray(dados.pericias) || dados.pericias.length === 0) {
          erros.push('Origem deve ter pelo menos uma perícia');
        }
        break;

      case 'TRILHA':
        if (!dados.classeId) {
          erros.push('ID da classe é obrigatório');
        }
        if (!dados.habilidades || !Array.isArray(dados.habilidades) || dados.habilidades.length === 0) {
          erros.push('Trilha deve ter pelo menos uma habilidade');
        }
        break;

      case 'CAMINHO':
        if (!dados.habilidades || !Array.isArray(dados.habilidades) || dados.habilidades.length === 0) {
          erros.push('Caminho deve ter pelo menos uma habilidade');
        }
        break;

      case 'EQUIPAMENTO':
        if (!dados.categoria) {
          erros.push('Categoria de equipamento é obrigatória');
        }
        if (dados.espacos == null || dados.espacos < 0) {
          erros.push('Espaços deve ser um número válido (≥ 0)');
        }

        // Validações específicas por categoria
        const categoria = dados.categoria as CategoriaEquipamento;

        if (categoria === CategoriaEquipamento.ARMA) {
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

        if (categoria === CategoriaEquipamento.PROTECAO) {
          if (!dados.proficienciaProtecao) erros.push('Proficiência de proteção é obrigatória');
          if (!dados.tipoProtecao) erros.push('Tipo de proteção é obrigatório');
          if (dados.bonusDefesa == null) erros.push('Bônus de defesa é obrigatório');
          if (dados.penalidadeCarga == null) erros.push('Penalidade de carga é obrigatória');
          if (!dados.reducoesDano) dados.reducoesDano = []; // Pode ser vazio
        }

        if (categoria === CategoriaEquipamento.ACESSORIO) {
          if (!dados.tipoAcessorio) erros.push('Tipo de acessório é obrigatório');
        }

        if (categoria === CategoriaEquipamento.MUNICAO) {
          if (!dados.duracaoCenas) erros.push('Duração (cenas) é obrigatória');
          if (dados.recuperavel == null) erros.push('Defina se a munição é recuperável');
        }

        if (categoria === CategoriaEquipamento.EXPLOSIVO) {
          if (!dados.tipoExplosivo) erros.push('Tipo de explosivo é obrigatório');
          if (!dados.efeito?.trim()) erros.push('Efeito do explosivo é obrigatório');
        }

        if (categoria === CategoriaEquipamento.FERRAMENTA_AMALDICOADA) {
          if (!dados.tipoAmaldicoado) erros.push('Tipo amaldiçoado é obrigatório');

          // Validar que pelo menos um subtipo está preenchido
          const temArma = dados.armaAmaldicoada && dados.armaAmaldicoada.tipoBase;
          const temProtecao = dados.protecaoAmaldicoada && dados.protecaoAmaldicoada.tipoBase;
          const temArtefato = dados.artefatoAmaldicoado && dados.artefatoAmaldicoado.tipoBase;

          if (!temArma && !temProtecao && !temArtefato) {
            erros.push('Ferramenta amaldiçoada deve ter arma, proteção ou artefato configurado');
          }
        }

        if (categoria === CategoriaEquipamento.ITEM_OPERACIONAL) {
          // Campos opcionais, sem validação obrigatória
        }

        if (categoria === CategoriaEquipamento.ITEM_AMALDICOADO) {
          if (!dados.tipoAmaldicoado) erros.push('Tipo amaldiçoado é obrigatório');
          if (!dados.efeito?.trim()) erros.push('Efeito do item amaldiçoado é obrigatório');
        }
        break;

      case 'PODER_GENERICO':
        if (!dados.efeitos?.trim()) {
          erros.push('Descrição dos efeitos é obrigatória');
        }
        break;

      case 'TECNICA_AMALDICOADA':
        if (!dados.tipo) {
          erros.push('Tipo de técnica é obrigatório');
        }
        if (!dados.habilidades || !Array.isArray(dados.habilidades) || dados.habilidades.length === 0) {
          erros.push('Técnica deve ter pelo menos uma habilidade');
        }

        // Validar cada habilidade
        if (Array.isArray(dados.habilidades)) {
          dados.habilidades.forEach((hab: any, idx: number) => {
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
      dados,
    };
  }, [nome, descricao, tipo, status, tags, versao, dados, validar]);

  // ==================== RESET ====================
  const reset = useCallback(() => {
    setNome('');
    setDescricao('');
    setTags([]);
    setStatus('RASCUNHO');
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
