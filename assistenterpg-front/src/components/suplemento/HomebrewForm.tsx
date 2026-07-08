// src/components/suplemento/HomebrewForm.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPublicacao } from "@/lib/types/homebrew-enums";
import { ApiError } from "@/lib/api/axios-client";

import type {
  TipoHomebrewConteudo,
  CreateHomebrewDto,
} from "@/lib/api/homebrews";
import {
  useHomebrewForm,
  type HomebrewFormInitialValues,
} from "./hooks/useHomebrewForm";

// Formulários específicos
import { ClaFormFields } from "./forms/ClaFormFields";
import { OrigemFormFields } from "./forms/OrigemFormFields";
import { TrilhaFormFields } from "./forms/TrilhaFormFields";
import { CaminhoFormFields } from "./forms/CaminhoFormFields";
import { EquipamentoFormFields } from "./forms/EquipamentoFormFields";
import { PoderGenericoFormFields } from "./forms/PoderGenericoFormFields";
import { TecnicaAmaldicoadaFormFields } from "./forms/TecnicaAmaldicoadaFormFields";

type Props = {
  onSubmit: (data: CreateHomebrewDto) => Promise<void>;
  onCancel: () => void;
  initialValues?: HomebrewFormInitialValues;
};

const TIPO_LABELS: Record<TipoHomebrewConteudo, string> = {
  CLA: "Clã",
  ORIGEM: "Origem",
  TRILHA: "Trilha",
  CAMINHO: "Caminho",
  EQUIPAMENTO: "Equipamento",
  PODER_GENERICO: "Poder Genérico",
  TECNICA_AMALDICOADA: "Técnica Amaldiçoada",
};

const TIPO_ICONS: Record<TipoHomebrewConteudo, IconName> = {
  CLA: "clan",
  ORIGEM: "story",
  TRILHA: "school",
  CAMINHO: "map",
  EQUIPAMENTO: "item",
  PODER_GENERICO: "sparkles",
  TECNICA_AMALDICOADA: "technique",
};

function extrairMensagensDetalhes(details: unknown): string[] {
  if (!details) return [];

  if (typeof details === "string") return [details];

  if (Array.isArray(details)) {
    return details.filter((item): item is string => typeof item === "string");
  }

  if (typeof details === "object") {
    const mensagens: string[] = [];

    for (const valor of Object.values(details as Record<string, unknown>)) {
      mensagens.push(...extrairMensagensDetalhes(valor));
    }

    return mensagens;
  }

  return [];
}

function parseTagsInput(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function tagsIguais(atual: string[], proxima: string[]): boolean {
  if (atual.length !== proxima.length) {
    return false;
  }

  return atual.every((tag, index) => tag === proxima[index]);
}

export function HomebrewForm({ onSubmit, onCancel, initialValues }: Props) {
  const {
    tipo,
    nome,
    descricao,
    tags,
    status,
    versao,
    dados,
    erro,
    submitting,
    setTipo,
    setNome,
    setDescricao,
    setTags,
    setStatus,
    setVersao,
    updateDados,
    setErro,
    setSubmitting,
    validar,
    buildPayload,
    reset,
  } = useHomebrewForm({ initialValues });

  const [tagsInput, setTagsInput] = useState(() => tags.join(", "));

  useEffect(() => {
    setTagsInput(tags.join(", "));
  }, [tags]);

  function handleTagsChange(value: string) {
    setTagsInput(value);
    const tagsArray = parseTagsInput(value);
    if (!tagsIguais(tags, tagsArray)) {
      setTags(tagsArray);
    }
  }

  async function handleSubmit(e: React.FormEvent, criarOutro = false) {
    e.preventDefault();

    const validacao = validar();
    if (!validacao.valido) {
      setErro(validacao.erros.join("\n"));
      return;
    }

    try {
      setErro(null);
      setSubmitting(true);

      const payload = buildPayload();
      await onSubmit(payload);

      if (criarOutro) {
        reset();
      } else {
        onCancel();
      }
    } catch (err) {
      console.error("[HomebrewForm] Erro:", err);

      if (err instanceof ApiError) {
        const mensagens = [
          err.message,
          ...extrairMensagensDetalhes(err.body?.details),
        ].filter(
          (mensagem, index, arr) => mensagem && arr.indexOf(mensagem) === index,
        );

        setErro(mensagens.join("\n"));
        return;
      }

      setErro(err instanceof Error ? err.message : "Erro ao salvar homebrew");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">
      <section className="space-y-4 rounded-xl border border-white/5 bg-app-surface/45 p-4">
        <SectionHeader
          title="Publicação"
          description="Defina o tipo estrutural e o estado de publicação deste conteúdo."
          icon="book"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Tipo de homebrew *"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoHomebrewConteudo)}
            required
          >
            {Object.entries(TIPO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <Select
            label="Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusPublicacao)}
          >
            <option value="RASCUNHO">Rascunho</option>
            <option value="PUBLICADO">Publicado</option>
            <option value="ARQUIVADO">Arquivado</option>
          </Select>
        </div>

        <div className="rounded-lg border border-app-primary/20 bg-app-primary/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name={TIPO_ICONS[tipo]} className="h-5 w-5 text-app-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">
                Tipo selecionado
              </p>
              <p className="truncate text-base font-bold text-app-fg">{TIPO_LABELS[tipo]}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-white/5 bg-app-surface/45 p-4">
        <SectionHeader
          title="Informações básicas"
          description="Nome, descrição, tags e versão usados na biblioteca."
          icon="info"
        />

        <Input
          label="Nome *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder={`Ex: ${
            tipo === "EQUIPAMENTO"
              ? "Espada Flamejante"
              : tipo === "CLA"
                ? "Clã Gojo"
                : "Técnica do Trovão"
          }`}
          required
          autoFocus
        />

        <Textarea
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva o homebrew em detalhes..."
          rows={3}
          maxLength={2000}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Tags"
            value={tagsInput}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Ex: combate, suporte (separar por vírgula)"
          />

          <Input
            label="Versão"
            value={versao}
            onChange={(e) => setVersao(e.target.value)}
            placeholder="1.0.0"
          />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, idx) => (
              <Badge key={idx} color="blue" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-white/5 bg-app-surface/45 p-4">
        <SectionHeader
          title={`Dados específicos de ${TIPO_LABELS[tipo]}`}
          description="Campos próprios do tipo selecionado. A estrutura final do payload permanece a mesma."
          icon={TIPO_ICONS[tipo]}
        />

        {tipo === "CLA" && <ClaFormFields dados={dados} onChange={updateDados} />}
        {tipo === "ORIGEM" && <OrigemFormFields dados={dados} onChange={updateDados} />}
        {tipo === "TRILHA" && <TrilhaFormFields dados={dados} onChange={updateDados} />}
        {tipo === "CAMINHO" && <CaminhoFormFields dados={dados} onChange={updateDados} />}
        {tipo === "EQUIPAMENTO" && <EquipamentoFormFields dados={dados} onChange={updateDados} />}
        {tipo === "PODER_GENERICO" && (
          <PoderGenericoFormFields dados={dados} onChange={updateDados} />
        )}
        {tipo === "TECNICA_AMALDICOADA" && (
          <TecnicaAmaldicoadaFormFields dados={dados} onChange={updateDados} />
        )}
      </section>

      {erro && <ErrorAlert message={erro} />}

      <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-app-surface/45 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={(e) => handleSubmit(e, true)}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Icon name="loading" className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Icon name="add" className="mr-2 h-4 w-4" />
                Salvar e criar outro
              </>
            )}
          </Button>

          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Icon name="loading" className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Icon name="check" className="mr-2 h-4 w-4" />
                Salvar homebrew
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
