// src/components/suplemento/forms/equipamentos/FerramentaAmaldicoadaFields.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiGetEquipamentoDetalhado,
  apiGetMeusEquipamentosHomebrew,
  apiGetTodosEquipamentos,
} from '@/lib/api/equipamentos';
import type { EquipamentoCatalogo, EquipamentoDetalhadoDto } from '@/lib/types';
import {
  TipoAmaldicoado,
  TIPO_AMALDICOADO_LABELS,
} from '@/lib/types/homebrew-enums';
import { ArmaFields } from './ArmaFields';
import { ProtecaoFields } from './ProtecaoFields';
import type { HomebrewFormDados } from '../../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

type CacheDetalhes = Record<number, EquipamentoDetalhadoDto>;
type SubDadosFerramenta = Record<string, unknown>;

const TIPOS_BASE_ARTEFATO = new Set([
  'ACESSORIO',
  'ITEM_OPERACIONAL',
  'ITEM_AMALDICOADO',
  'GENERICO',
]);

function clonarDanos(detalhe: EquipamentoDetalhadoDto) {
  return (detalhe.danos ?? []).map((dano) => ({
    empunhadura: dano.empunhadura ?? undefined,
    tipoDano: dano.tipoDano as never,
    rolagem: dano.rolagem,
    valorFlat: dano.valorFlat,
  }));
}

function clonarReducoes(detalhe: EquipamentoDetalhadoDto) {
  return (detalhe.reducoesDano ?? []).map((reducao) => ({
    tipoReducao: reducao.tipoReducao as never,
    valor: reducao.valor,
  }));
}

function formatarRotuloEquipamento(equipamento: EquipamentoCatalogo) {
  const prefixo = equipamento.fonte === 'HOMEBREW' ? '[Homebrew] ' : '';
  return `${prefixo}${equipamento.nome}`;
}

function normalizarComparacao(valor: unknown) {
  return String(valor ?? '')
    .trim()
    .toUpperCase();
}

function inferirBaseId(
  opcoes: EquipamentoCatalogo[],
  tipoBase?: string | null,
): number | null {
  const alvo = normalizarComparacao(tipoBase);
  if (!alvo) return null;

  const encontrada = opcoes.find((equipamento) => {
    const codigo = normalizarComparacao(equipamento.codigo);
    const nome = normalizarComparacao(equipamento.nome);
    const tipoBaseArma = normalizarComparacao(
      (equipamento.armaAmaldicoada as { tipoBase?: string } | null)?.tipoBase,
    );
    const tipoBaseProtecao = normalizarComparacao(
      (equipamento.protecaoAmaldicoada as { tipoBase?: string } | null)?.tipoBase,
    );
    const tipoBaseArtefato = normalizarComparacao(
      (equipamento.artefatoAmaldicoado as { tipoBase?: string } | null)?.tipoBase,
    );

    return [codigo, nome, tipoBaseArma, tipoBaseProtecao, tipoBaseArtefato].includes(alvo);
  });

  return encontrada?.id ?? null;
}

export function FerramentaAmaldicoadaFields({ dados, onChange }: Props) {
  const tipoAmaldicoado = dados.tipoAmaldicoado as TipoAmaldicoado | undefined;
  const tiposFerramentaAmaldicoada: TipoAmaldicoado[] = [
    TipoAmaldicoado.ARMA,
    TipoAmaldicoado.PROTECAO,
    TipoAmaldicoado.ARTEFATO,
  ];

  const [equipamentosBase, setEquipamentosBase] = useState<EquipamentoCatalogo[]>([]);
  const [detalhesCache, setDetalhesCache] = useState<CacheDetalhes>({});
  const [carregandoBases, setCarregandoBases] = useState(false);
  const [armaBaseId, setArmaBaseId] = useState<number | null>(null);
  const [protecaoBaseId, setProtecaoBaseId] = useState<number | null>(null);
  const [artefatoBaseId, setArtefatoBaseId] = useState<number | null>(null);
  const confirmacao = useConfirm();

  useEffect(() => {
    let ativo = true;

    async function carregarBases() {
      try {
        setCarregandoBases(true);
        const [oficiais, meusHomebrew] = await Promise.all([
          apiGetTodosEquipamentos({ limitePorPagina: 100 }),
          apiGetMeusEquipamentosHomebrew(),
        ]);

        if (!ativo) return;

        const publicados = meusHomebrew.filter(
          (equipamento) => equipamento.homebrewOrigemStatus === 'PUBLICADO',
        );

        const mapa = new Map<number, EquipamentoCatalogo>();
        for (const equipamento of oficiais) {
          mapa.set(equipamento.id, equipamento);
        }
        for (const equipamento of publicados) {
          mapa.set(equipamento.id, equipamento);
        }

        setEquipamentosBase(Array.from(mapa.values()));
      } catch {
        if (ativo) {
          setEquipamentosBase([]);
        }
      } finally {
        if (ativo) {
          setCarregandoBases(false);
        }
      }
    }

    void carregarBases();

    return () => {
      ativo = false;
    };
  }, []);

  const opcoesArma = useMemo(
    () => equipamentosBase.filter((equipamento) => equipamento.tipo === 'ARMA'),
    [equipamentosBase],
  );

  const opcoesProtecao = useMemo(
    () => equipamentosBase.filter((equipamento) => equipamento.tipo === 'PROTECAO'),
    [equipamentosBase],
  );

  const opcoesArtefato = useMemo(
    () => equipamentosBase.filter((equipamento) => TIPOS_BASE_ARTEFATO.has(equipamento.tipo)),
    [equipamentosBase],
  );

  useEffect(() => {
    if (!armaBaseId && dados.armaAmaldicoada?.tipoBase) {
      setArmaBaseId(inferirBaseId(opcoesArma, dados.armaAmaldicoada.tipoBase));
    }
  }, [armaBaseId, dados.armaAmaldicoada?.tipoBase, opcoesArma]);

  useEffect(() => {
    if (!protecaoBaseId && dados.protecaoAmaldicoada?.tipoBase) {
      setProtecaoBaseId(
        inferirBaseId(opcoesProtecao, dados.protecaoAmaldicoada.tipoBase),
      );
    }
  }, [dados.protecaoAmaldicoada?.tipoBase, opcoesProtecao, protecaoBaseId]);

  useEffect(() => {
    if (!artefatoBaseId && dados.artefatoAmaldicoado?.tipoBase) {
      setArtefatoBaseId(
        inferirBaseId(opcoesArtefato, dados.artefatoAmaldicoado.tipoBase),
      );
    }
  }, [artefatoBaseId, dados.artefatoAmaldicoado?.tipoBase, opcoesArtefato]);

  function updateSubDados(
    campo: 'armaAmaldicoada' | 'protecaoAmaldicoada' | 'artefatoAmaldicoado',
    subDados: SubDadosFerramenta,
  ) {
    const atual = (dados[campo] as SubDadosFerramenta | null) ?? {};
    onChange({ [campo]: { ...atual, ...subDados } });
  }

  function updateDadosArma(dadosArma: Record<string, unknown>) {
    const armaAmaldicoada = (dados.armaAmaldicoada as SubDadosFerramenta | null) ?? {};
    onChange({
      armaAmaldicoada: {
        ...armaAmaldicoada,
        dadosArma: {
          ...((armaAmaldicoada.dadosArma as Record<string, unknown> | undefined) ?? {}),
          ...dadosArma,
        },
      },
    });
  }

  function updateDadosProtecao(dadosProtecao: Record<string, unknown>) {
    const protecaoAmaldicoada =
      (dados.protecaoAmaldicoada as SubDadosFerramenta | null) ?? {};
    onChange({
      protecaoAmaldicoada: {
        ...protecaoAmaldicoada,
        dadosProtecao: {
          ...((protecaoAmaldicoada.dadosProtecao as Record<string, unknown> | undefined) ?? {}),
          ...dadosProtecao,
        },
      },
    });
  }

  async function obterDetalhe(id: number) {
    const existente = detalhesCache[id];
    if (existente) return existente;

    const detalhe = await apiGetEquipamentoDetalhado(id);
    setDetalhesCache((prev) => ({ ...prev, [id]: detalhe }));
    return detalhe;
  }

  function solicitarSobrescrita(titulo: string, onConfirm: () => Promise<void>) {
    confirmacao.confirm({
      title: titulo,
      description:
        'Os dados preenchidos automaticamente pela base atual serão substituídos pelos dados do novo item.',
      confirmLabel: 'Trocar item base',
      variant: 'warning',
      onConfirm,
    });
  }

  async function selecionarBaseArma(id: number) {
    if (armaBaseId && armaBaseId !== id) {
      solicitarSobrescrita('Trocar arma base?', () => aplicarBaseArma(id));
      return;
    }

    await aplicarBaseArma(id);
  }

  async function aplicarBaseArma(id: number) {
    const detalhe = await obterDetalhe(id);
    const atual = (dados.armaAmaldicoada as SubDadosFerramenta | null) ?? {};

    updateSubDados('armaAmaldicoada', {
      tipoBase: detalhe.codigo,
      proficienciaRequerida: Boolean(detalhe.proficienciaArma),
      efeito: typeof atual.efeito === 'string' ? atual.efeito : '',
      dadosArma: {
        proficienciaArma: detalhe.proficienciaArma ?? undefined,
        empunhaduras: detalhe.empunhaduras ?? [],
        tipoArma: detalhe.tipoArma ?? undefined,
        subtipoDistancia: detalhe.subtipoDistancia ?? undefined,
        agil: detalhe.agil ?? false,
        danos: clonarDanos(detalhe),
        criticoValor: detalhe.criticoValor ?? 20,
        criticoMultiplicador: detalhe.criticoMultiplicador ?? 2,
        alcance: detalhe.alcance ?? undefined,
        tipoMunicaoCodigo: detalhe.tipoMunicaoCodigo ?? undefined,
        habilidadeEspecial: detalhe.habilidadeEspecial ?? undefined,
      },
    });

    setArmaBaseId(id);
  }

  async function selecionarBaseProtecao(id: number) {
    if (protecaoBaseId && protecaoBaseId !== id) {
      solicitarSobrescrita('Trocar proteção base?', () => aplicarBaseProtecao(id));
      return;
    }

    await aplicarBaseProtecao(id);
  }

  async function aplicarBaseProtecao(id: number) {
    const detalhe = await obterDetalhe(id);
    const atual = (dados.protecaoAmaldicoada as SubDadosFerramenta | null) ?? {};

    updateSubDados('protecaoAmaldicoada', {
      tipoBase: detalhe.codigo,
      proficienciaRequerida: Boolean(detalhe.proficienciaProtecao),
      efeito: typeof atual.efeito === 'string' ? atual.efeito : '',
      dadosProtecao: {
        proficienciaProtecao: detalhe.proficienciaProtecao ?? undefined,
        tipoProtecao: detalhe.tipoProtecao ?? undefined,
        bonusDefesa: detalhe.bonusDefesa ?? 0,
        penalidadeCarga: detalhe.penalidadeCarga ?? 0,
        reducoesDano: clonarReducoes(detalhe),
      },
    });

    setProtecaoBaseId(id);
  }

  async function selecionarBaseArtefato(id: number) {
    if (artefatoBaseId && artefatoBaseId !== id) {
      solicitarSobrescrita('Trocar artefato base?', () => aplicarBaseArtefato(id));
      return;
    }

    await aplicarBaseArtefato(id);
  }

  async function aplicarBaseArtefato(id: number) {
    const detalhe = await obterDetalhe(id);
    const atual = (dados.artefatoAmaldicoado as SubDadosFerramenta | null) ?? {};

    updateSubDados('artefatoAmaldicoado', {
      tipoBase: detalhe.codigo,
      proficienciaRequerida: detalhe.requereEmpunhar === true,
      efeito:
        typeof atual.efeito === 'string' && atual.efeito.length > 0
          ? atual.efeito
          : detalhe.efeito ?? '',
      custoUso: typeof atual.custoUso === 'string' ? atual.custoUso : '',
      manutencao: typeof atual.manutencao === 'string' ? atual.manutencao : '',
    });

    setArtefatoBaseId(id);
  }

  return (
    <div className="space-y-4">
      <Select
        label="Tipo amaldiçoado *"
        value={tipoAmaldicoado ?? ''}
        onChange={(e) => {
          const novoTipo = e.target.value as TipoAmaldicoado;
          setArmaBaseId(null);
          setProtecaoBaseId(null);
          setArtefatoBaseId(null);
          onChange({
            tipoAmaldicoado: novoTipo,
            armaAmaldicoada: undefined,
            protecaoAmaldicoada: undefined,
            artefatoAmaldicoado: undefined,
          });
        }}
        required
      >
        <option value="">Selecione...</option>
        {tiposFerramentaAmaldicoada.map((value) => (
          <option key={value} value={value}>
            {TIPO_AMALDICOADO_LABELS[value]}
          </option>
        ))}
      </Select>

      {tipoAmaldicoado === TipoAmaldicoado.ARMA && (
        <div className="space-y-4 border-t border-app-border pt-3">
          <div className="flex items-center gap-2">
            <Icon name="sword" className="h-5 w-5 text-app-primary" />
            <h4 className="text-sm font-semibold text-app-fg">Arma Amaldiçoada</h4>
          </div>

          <Select
            label="Arma base *"
            value={armaBaseId ? String(armaBaseId) : ''}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isFinite(value) && value > 0) {
                void selecionarBaseArma(value);
              }
            }}
            helperText={
              carregandoBases
                ? 'Carregando armas disponíveis...'
                : dados.armaAmaldicoada?.tipoBase
                  ? `Base atual: ${String(dados.armaAmaldicoada.tipoBase)}`
                  : 'Selecione uma arma existente para preencher os dados base automaticamente.'
            }
            required
          >
            <option value="">Selecionar arma...</option>
            {opcoesArma.map((equipamento) => (
              <option key={equipamento.id} value={equipamento.id}>
                {formatarRotuloEquipamento(equipamento)}
              </option>
            ))}
          </Select>

          <Checkbox
            label="Proficiência requerida"
            checked={dados.armaAmaldicoada?.proficienciaRequerida ?? false}
            onChange={(e) =>
              updateSubDados('armaAmaldicoada', {
                proficienciaRequerida: e.target.checked,
              })
            }
          />

          <Textarea
            label="Efeito amaldiçoado *"
            value={String(dados.armaAmaldicoada?.efeito ?? '')}
            onChange={(e) => updateSubDados('armaAmaldicoada', { efeito: e.target.value })}
            placeholder="Efeito especial da maldição..."
            rows={3}
            maxLength={1000}
            required
          />

          <div className="border-t border-app-border pt-3">
            <p className="mb-3 text-xs font-medium text-app-fg">Dados da arma base</p>
            <ArmaFields
              dados={(dados.armaAmaldicoada?.dadosArma as HomebrewFormDados | undefined) ?? {}}
              onChange={updateDadosArma}
            />
          </div>
        </div>
      )}

      {tipoAmaldicoado === TipoAmaldicoado.PROTECAO && (
        <div className="space-y-4 border-t border-app-border pt-3">
          <div className="flex items-center gap-2">
            <Icon name="shield-defense" className="h-5 w-5 text-app-primary" />
            <h4 className="text-sm font-semibold text-app-fg">Proteção Amaldiçoada</h4>
          </div>

          <Select
            label="Proteção base *"
            value={protecaoBaseId ? String(protecaoBaseId) : ''}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isFinite(value) && value > 0) {
                void selecionarBaseProtecao(value);
              }
            }}
            helperText={
              carregandoBases
                ? 'Carregando proteções disponíveis...'
                : dados.protecaoAmaldicoada?.tipoBase
                  ? `Base atual: ${String(dados.protecaoAmaldicoada.tipoBase)}`
                  : 'Selecione uma proteção existente para preencher os dados base automaticamente.'
            }
            required
          >
            <option value="">Selecionar proteção...</option>
            {opcoesProtecao.map((equipamento) => (
              <option key={equipamento.id} value={equipamento.id}>
                {formatarRotuloEquipamento(equipamento)}
              </option>
            ))}
          </Select>

          <Checkbox
            label="Proficiência requerida"
            checked={dados.protecaoAmaldicoada?.proficienciaRequerida ?? false}
            onChange={(e) =>
              updateSubDados('protecaoAmaldicoada', {
                proficienciaRequerida: e.target.checked,
              })
            }
          />

          <Textarea
            label="Efeito amaldiçoado *"
            value={String(dados.protecaoAmaldicoada?.efeito ?? '')}
            onChange={(e) => updateSubDados('protecaoAmaldicoada', { efeito: e.target.value })}
            placeholder="Efeito especial da maldição..."
            rows={3}
            maxLength={1000}
            required
          />

          <div className="border-t border-app-border pt-3">
            <p className="mb-3 text-xs font-medium text-app-fg">Dados da proteção base</p>
            <ProtecaoFields
              dados={
                (dados.protecaoAmaldicoada?.dadosProtecao as HomebrewFormDados | undefined) ?? {}
              }
              onChange={updateDadosProtecao}
            />
          </div>
        </div>
      )}

      {tipoAmaldicoado === TipoAmaldicoado.ARTEFATO && (
        <div className="space-y-4 border-t border-app-border pt-3">
          <div className="flex items-center gap-2">
            <Icon name="sparkles" className="h-5 w-5 text-app-primary" />
            <h4 className="text-sm font-semibold text-app-fg">Artefato Amaldiçoado</h4>
          </div>

          <Select
            label="Artefato base *"
            value={artefatoBaseId ? String(artefatoBaseId) : ''}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isFinite(value) && value > 0) {
                void selecionarBaseArtefato(value);
              }
            }}
            helperText={
              carregandoBases
                ? 'Carregando utilitários disponíveis...'
                : dados.artefatoAmaldicoado?.tipoBase
                  ? `Base atual: ${String(dados.artefatoAmaldicoado.tipoBase)}`
                  : 'Selecione um item compatível para usar como base do artefato.'
            }
            required
          >
            <option value="">Selecionar item...</option>
            {opcoesArtefato.map((equipamento) => (
              <option key={equipamento.id} value={equipamento.id}>
                {formatarRotuloEquipamento(equipamento)}
              </option>
            ))}
          </Select>

          <Checkbox
            label="Proficiência requerida"
            checked={dados.artefatoAmaldicoado?.proficienciaRequerida ?? false}
            onChange={(e) =>
              updateSubDados('artefatoAmaldicoado', {
                proficienciaRequerida: e.target.checked,
              })
            }
          />

          <Textarea
            label="Efeito *"
            value={String(dados.artefatoAmaldicoado?.efeito ?? '')}
            onChange={(e) => updateSubDados('artefatoAmaldicoado', { efeito: e.target.value })}
            placeholder="Efeito do artefato..."
            rows={3}
            maxLength={1000}
            required
          />

          <Textarea
            label="Custo de uso *"
            value={String(dados.artefatoAmaldicoado?.custoUso ?? '')}
            onChange={(e) => updateSubDados('artefatoAmaldicoado', { custoUso: e.target.value })}
            placeholder="Ex: 1 PE por uso, 5 EA por ativação"
            rows={2}
            required
          />

          <Textarea
            label="Manutenção *"
            value={String(dados.artefatoAmaldicoado?.manutencao ?? '')}
            onChange={(e) => updateSubDados('artefatoAmaldicoado', { manutencao: e.target.value })}
            placeholder="Ex: Requer recarga semanal, usa energia amaldiçoada"
            rows={2}
            required
          />
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmacao.isOpen}
        onClose={confirmacao.handleClose}
        onConfirm={() => void confirmacao.handleConfirm()}
        title={confirmacao.options?.title ?? 'Trocar item base?'}
        description={confirmacao.options?.description ?? ''}
        confirmLabel={confirmacao.options?.confirmLabel}
        cancelLabel={confirmacao.options?.cancelLabel}
        variant={confirmacao.options?.variant}
      />
    </div>
  );
}
