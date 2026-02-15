// src/components/suplemento/HomebrewForm.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

import type { TipoHomebrewConteudo, CreateHomebrewDto } from '@/lib/api/homebrews';
import { useHomebrewForm } from './hooks/useHomebrewForm';

// Formulários específicos
import { ClaFormFields } from './forms/ClaFormFields';
import { OrigemFormFields } from './forms/OrigemFormFields';
import { TrilhaFormFields } from './forms/TrilhaFormFields';
import { CaminhoFormFields } from './forms/CaminhoFormFields';
import { EquipamentoFormFields } from './forms/EquipamentoFormFields';
import { PoderGenericoFormFields } from './forms/PoderGenericoFormFields';
import { TecnicaAmaldicoadaFormFields } from './forms/TecnicaAmaldicoadaFormFields';

type Props = {
  onSubmit: (data: CreateHomebrewDto) => Promise<void>;
  onCancel: () => void;
  initialValues?: any;
};

const TIPO_LABELS: Record<TipoHomebrewConteudo, string> = {
  CLA: 'Clã',
  ORIGEM: 'Origem',
  TRILHA: 'Trilha',
  CAMINHO: 'Caminho',
  EQUIPAMENTO: 'Equipamento',
  PODER_GENERICO: 'Poder Genérico',
  TECNICA_AMALDICOADA: 'Técnica Amaldiçoada',
};

const TIPO_ICONS: Record<TipoHomebrewConteudo, string> = {
  CLA: 'clan',
  ORIGEM: 'story',
  TRILHA: 'school',
  CAMINHO: 'map',
  EQUIPAMENTO: 'item',
  PODER_GENERICO: 'sparkles',
  TECNICA_AMALDICOADA: 'technique',
};

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

  const tagsString = tags.join(', ');

  function handleTagsChange(value: string) {
    const tagsArray = value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setTags(tagsArray);
  }

  async function handleSubmit(e: React.FormEvent, criarOutro = false) {
    e.preventDefault();

    const validacao = validar();
    if (!validacao.valido) {
      setErro(validacao.erros.join('\n'));
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
    } catch (err: any) {
      console.error('[HomebrewForm] Erro:', err);
      setErro(err?.message ?? 'Erro ao salvar homebrew');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <Card>
        <div className="space-y-6">
          {/* Cabeçalho: Tipo e Status */}
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
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="ARQUIVADO">Arquivado</option>
            </Select>
          </div>

          {/* Indicador visual do tipo */}
          <div className="rounded-lg border border-app-primary/30 bg-app-primary/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name={TIPO_ICONS[tipo] as any} className="w-5 h-5 text-app-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-app-muted">Criando</p>
                <p className="text-base font-semibold text-app-fg">{TIPO_LABELS[tipo]}</p>
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-app-border" />

          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-app-fg flex items-center gap-2">
              <Icon name="info" className="w-4 h-4 text-app-primary" />
              Informações básicas
            </h3>

            <Input
              label="Nome *"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={`Ex: ${tipo === 'EQUIPAMENTO' ? 'Espada Flamejante' : tipo === 'CLA' ? 'Clã Gojo' : 'Técnica do Trovão'}`}
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
                value={tagsString}
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
          </div>

          {/* Divisor */}
          <div className="border-t border-app-border" />

          {/* Campos Específicos por Tipo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-app-fg flex items-center gap-2">
              <Icon name={TIPO_ICONS[tipo] as any} className="w-4 h-4 text-app-primary" />
              Dados específicos de {TIPO_LABELS[tipo]}
            </h3>

            {tipo === 'CLA' && <ClaFormFields dados={dados} onChange={updateDados} />}
            {tipo === 'ORIGEM' && <OrigemFormFields dados={dados} onChange={updateDados} />}
            {tipo === 'TRILHA' && <TrilhaFormFields dados={dados} onChange={updateDados} />}
            {tipo === 'CAMINHO' && <CaminhoFormFields dados={dados} onChange={updateDados} />}
            {tipo === 'EQUIPAMENTO' && <EquipamentoFormFields dados={dados} onChange={updateDados} />}
            {tipo === 'PODER_GENERICO' && <PoderGenericoFormFields dados={dados} onChange={updateDados} />}
            {tipo === 'TECNICA_AMALDICOADA' && <TecnicaAmaldicoadaFormFields dados={dados} onChange={updateDados} />}
          </div>

          {/* Erro */}
          {erro && (
            <div className="pt-4">
              <ErrorAlert message={erro} />
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-app-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Icon name="loading" className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Icon name="add" className="w-4 h-4 mr-2" />
                    Salvar e criar outro
                  </>
                )}
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Icon name="loading" className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Icon name="check" className="w-4 h-4 mr-2" />
                    Salvar homebrew
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </form>
  );
}
