'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import {
  apiGetPericias,
  criarErroUsuario,
  type AtributoMacroPersonalizada,
  type MacroAtaqueConfigV1,
  type MacroDanoConfigV1,
  type MacroFormulaLivreConfigV1,
  type MacroPersonalizadaSessao,
  type MacroPersonalizadaTipo,
  type SalvarMacroPersonagemCampanhaPayload,
} from '@/lib/api';
import type { PericiaCatalogo } from '@/lib/types';

type Props = {
  isOpen: boolean;
  macro: MacroPersonalizadaSessao | null;
  salvando: boolean;
  onClose: () => void;
  onSalvar: (payload: SalvarMacroPersonagemCampanhaPayload) => Promise<void>;
};

const ATRIBUTOS: AtributoMacroPersonalizada[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];

function numeroInteiro(valor: string, fallback = 0): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.trunc(numero) : fallback;
}

export function SessionCharacterMacroEditorModal({
  isOpen,
  macro,
  salvando,
  onClose,
  onSalvar,
}: Props) {
  const configAtaque = macro?.tipo === 'ATAQUE_PERICIA' ? macro.config as MacroAtaqueConfigV1 : null;
  const configDano = macro?.tipo === 'DANO_FORMULA' ? macro.config as MacroDanoConfigV1 : null;
  const configLivre = macro?.tipo === 'FORMULA_LIVRE' ? macro.config as MacroFormulaLivreConfigV1 : null;
  const [tipo, setTipo] = useState<MacroPersonalizadaTipo>(macro?.tipo ?? 'ATAQUE_PERICIA');
  const [nome, setNome] = useState(macro?.nome ?? '');
  const [descricao, setDescricao] = useState(macro?.descricao ?? '');
  const [visibilidade, setVisibilidade] = useState<'PUBLICA' | 'SECRETA_MESTRE'>(macro?.visibilidadePadrao ?? 'PUBLICA');
  const [periciaCodigo, setPericiaCodigo] = useState(configAtaque?.periciaCodigo ?? 'LUTA');
  const [atributoBase, setAtributoBase] = useState(configAtaque?.atributoBase ?? '');
  const [categoriaAtaque, setCategoriaAtaque] = useState<'CORPO_A_CORPO' | 'A_DISTANCIA' | 'OUTRO'>(
    configAtaque?.categoriaAtaque ?? 'CORPO_A_CORPO',
  );
  const [ajusteFlat, setAjusteFlat] = useState(String(configAtaque?.ajusteFlatPadrao ?? configDano?.ajusteFlatPadrao ?? 0));
  const [ajusteDados, setAjusteDados] = useState(String(configAtaque?.ajusteDadosPadrao ?? 0));
  const [dt, setDt] = useState(configAtaque?.dtPadrao === undefined ? '' : String(configAtaque.dtPadrao));
  const [formula, setFormula] = useState(configDano?.formulaBase ?? configLivre?.formula ?? '');
  const [tipoDano, setTipoDano] = useState(configDano?.tipoDano ?? '');
  const [critico, setCritico] = useState(configDano?.criticoMultiplicador ? String(configDano.criticoMultiplicador) : '');
  const [pericias, setPericias] = useState<PericiaCatalogo[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || pericias.length > 0) return;
    let montado = true;
    void apiGetPericias()
      .then((itens) => {
        if (montado) setPericias([...itens].sort((a, b) => a.nome.localeCompare(b.nome)));
      })
      .catch((error) => {
        if (montado) setErro(criarErroUsuario(error).message);
      });
    return () => {
      montado = false;
    };
  }, [isOpen, pericias.length]);

  const periciaOptions = useMemo(
    () =>
      pericias.map((pericia) => ({
        value: pericia.codigo,
        label: pericia.nome,
      })),
    [pericias],
  );

  const enviar = async (event: FormEvent) => {
    event.preventDefault();
    setErro(null);
    let config: SalvarMacroPersonagemCampanhaPayload['config'];
    if (tipo === 'ATAQUE_PERICIA') {
      config = {
        periciaCodigo,
        ...(atributoBase ? { atributoBase: atributoBase as AtributoMacroPersonalizada } : {}),
        categoriaAtaque,
        ajusteFlatPadrao: numeroInteiro(ajusteFlat),
        ajusteDadosPadrao: numeroInteiro(ajusteDados),
        ...(dt ? { dtPadrao: numeroInteiro(dt) } : {}),
      };
    } else if (tipo === 'DANO_FORMULA') {
      config = {
        formulaBase: formula,
        ...(tipoDano.trim() ? { tipoDano: tipoDano.trim() } : {}),
        ajusteFlatPadrao: numeroInteiro(ajusteFlat),
        ...(critico ? { criticoMultiplicador: numeroInteiro(critico) } : {}),
      };
    } else {
      config = { formula };
    }
    try {
      await onSalvar({
        tipo,
        nome,
        ...(descricao.trim() ? { descricao } : {}),
        visibilidadePadrao: visibilidade,
        config,
      });
    } catch (error) {
      setErro(criarErroUsuario(error).message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={salvando ? () => undefined : onClose}
      title={macro ? 'Editar macro personalizada' : 'Nova macro personalizada'}
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="session-character-macro-form" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar macro'}
          </Button>
        </>
      }
    >
      <form id="session-character-macro-form" className="space-y-3" onSubmit={enviar}>
        {erro ? <ErrorAlert message={erro} /> : null}
        <label className="block space-y-1 text-sm text-app-fg">
          <span>Nome</span>
          <input
            className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
            required
            minLength={1}
            maxLength={80}
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
        </label>
        <Select
          label="Tipo"
          value={tipo}
          disabled={Boolean(macro)}
          onChange={(event) => setTipo(event.target.value as MacroPersonalizadaTipo)}
          options={[
            { value: 'ATAQUE_PERICIA', label: 'Ataque por perícia' },
            { value: 'DANO_FORMULA', label: 'Dano por fórmula' },
            { value: 'FORMULA_LIVRE', label: 'Fórmula livre' },
          ]}
        />
        <label className="block space-y-1 text-sm text-app-fg">
          <span>Descrição</span>
          <textarea
            className="min-h-20 w-full rounded border border-app-border bg-app-surface px-3 py-2"
            maxLength={500}
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
          />
        </label>
        <Select
          label="Visibilidade padrão"
          value={visibilidade}
          onChange={(event) => setVisibilidade(event.target.value as 'PUBLICA' | 'SECRETA_MESTRE')}
          options={[
            { value: 'PUBLICA', label: 'Pública' },
            { value: 'SECRETA_MESTRE', label: 'Secreta para o mestre' },
          ]}
        />

        {tipo === 'ATAQUE_PERICIA' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Perícia"
              value={periciaCodigo}
              onChange={(event) => setPericiaCodigo(event.target.value)}
              options={
                periciaOptions.length
                  ? periciaOptions
                  : [{ value: periciaCodigo, label: periciaCodigo }]
              }
            />
            <Select
              label="Atributo"
              value={atributoBase}
              onChange={(event) => setAtributoBase(event.target.value)}
              options={[
                { value: '', label: 'Padrão da perícia' },
                ...ATRIBUTOS.map((atributo) => ({
                  value: atributo,
                  label: atributo,
                })),
              ]}
            />
            <Select
              label="Categoria"
              value={categoriaAtaque}
              onChange={(event) => setCategoriaAtaque(event.target.value as typeof categoriaAtaque)}
              options={[
                { value: 'CORPO_A_CORPO', label: 'Corpo a corpo' },
                { value: 'A_DISTANCIA', label: 'À distância' },
                { value: 'OUTRO', label: 'Outro' },
              ]}
            />
            <label className="space-y-1 text-sm text-app-fg">
              <span>DT padrão</span>
              <input
                className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
                type="number"
                min={0}
                max={100000}
                value={dt}
                onChange={(event) => setDt(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm text-app-fg">
              <span>Flat padrão</span>
              <input
                className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
                type="number"
                min={-100}
                max={100}
                value={ajusteFlat}
                onChange={(event) => setAjusteFlat(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm text-app-fg">
              <span>Dados padrão</span>
              <input
                className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
                type="number"
                min={-10}
                max={10}
                value={ajusteDados}
                onChange={(event) => setAjusteDados(event.target.value)}
              />
            </label>
          </div>
        ) : null}

        {tipo === 'DANO_FORMULA' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-app-fg sm:col-span-2">
              <span>Fórmula de dano</span>
              <input
                className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
                required
                maxLength={120}
                placeholder="2d8+4"
                value={formula}
                onChange={(event) => setFormula(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm text-app-fg">
              <span>Tipo de dano</span>
              <input
                className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
                maxLength={40}
                placeholder="Impacto"
                value={tipoDano}
                onChange={(event) => setTipoDano(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm text-app-fg">
              <span>Crítico</span>
              <input
                className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
                type="number"
                min={2}
                max={5}
                placeholder="Sem crítico"
                value={critico}
                onChange={(event) => setCritico(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm text-app-fg">
              <span>Flat padrão adicional</span>
              <input
                className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
                type="number"
                min={-1000}
                max={1000}
                value={ajusteFlat}
                onChange={(event) => setAjusteFlat(event.target.value)}
              />
            </label>
          </div>
        ) : null}

        {tipo === 'FORMULA_LIVRE' ? (
          <label className="block space-y-1 text-sm text-app-fg">
            <span>Fórmula livre</span>
            <input
              className="w-full rounded border border-app-border bg-app-surface px-3 py-2"
              required
              maxLength={200}
              placeholder="2d6+3"
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
            />
          </label>
        ) : null}
      </form>
    </Modal>
  );
}
