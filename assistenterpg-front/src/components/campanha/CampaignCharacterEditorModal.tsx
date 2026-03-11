'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiAplicarModificadorPersonagemCampanha,
  apiAtualizarRecursosPersonagemCampanha,
  apiDesfazerModificadorPersonagemCampanha,
  apiListarHistoricoPersonagemCampanha,
  apiListarModificadoresPersonagemCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type {
  CampoModificadorPersonagemCampanha,
  HistoricoPersonagemCampanha,
  ModificadorPersonagemCampanha,
  PersonagemCampanhaResumo,
} from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

type Props = {
  isOpen: boolean;
  campanhaId: number;
  personagem: Pick<PersonagemCampanhaResumo, 'id' | 'nome' | 'recursos'> | null;
  onClose: () => void;
  onPersonagemAtualizado: (personagem: PersonagemCampanhaResumo) => void;
  contextoSessao?: {
    sessaoId: number;
    cenaId?: number | null;
  };
};

const CAMPOS_MODIFICADOR_OPTIONS: Array<{
  value: CampoModificadorPersonagemCampanha;
  label: string;
}> = [
  { value: 'PV_MAX', label: 'PV Maximo' },
  { value: 'PE_MAX', label: 'PE Maximo' },
  { value: 'EA_MAX', label: 'EA Maximo' },
  { value: 'SAN_MAX', label: 'Sanidade Maxima' },
  { value: 'DEFESA_BASE', label: 'Defesa Base' },
  { value: 'DEFESA_EQUIPAMENTO', label: 'Defesa Equipamento' },
  { value: 'DEFESA_OUTROS', label: 'Defesa Outros' },
  { value: 'ESQUIVA', label: 'Esquiva' },
  { value: 'BLOQUEIO', label: 'Bloqueio' },
  { value: 'DESLOCAMENTO', label: 'Deslocamento' },
  { value: 'LIMITE_PE_EA_POR_TURNO', label: 'Limite PE/EA por turno' },
  { value: 'PRESTIGIO_GERAL', label: 'Prestigio Geral' },
  { value: 'PRESTIGIO_CLA', label: 'Prestigio Cla' },
];

const LABEL_CAMPO_MODIFICADOR: Record<CampoModificadorPersonagemCampanha, string> =
  Object.fromEntries(
    CAMPOS_MODIFICADOR_OPTIONS.map((item) => [item.value, item.label]),
  ) as Record<CampoModificadorPersonagemCampanha, string>;

function formatarDataHora(valor: string): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString('pt-BR');
}

export function CampaignCharacterEditorModal({
  isOpen,
  campanhaId,
  personagem,
  onClose,
  onPersonagemAtualizado,
  contextoSessao,
}: Props) {
  const [pvAtual, setPvAtual] = useState('');
  const [peAtual, setPeAtual] = useState('');
  const [eaAtual, setEaAtual] = useState('');
  const [sanAtual, setSanAtual] = useState('');

  const [campoModificador, setCampoModificador] =
    useState<CampoModificadorPersonagemCampanha>('EA_MAX');
  const [valorModificador, setValorModificador] = useState('');
  const [nomeModificador, setNomeModificador] = useState('');
  const [descricaoModificador, setDescricaoModificador] = useState('');

  const [modificadores, setModificadores] = useState<
    ModificadorPersonagemCampanha[]
  >([]);
  const [historico, setHistorico] = useState<HistoricoPersonagemCampanha[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);
  const [savingRecursos, setSavingRecursos] = useState(false);
  const [savingModificador, setSavingModificador] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const personagemId = personagem?.id ?? null;

  const titulo = useMemo(() => {
    if (!personagem) return 'Editar ficha da campanha';
    return `Editar ficha: ${personagem.nome}`;
  }, [personagem]);
  const filtrosModificador = useMemo(() => {
    if (!contextoSessao) return undefined;
    return {
      sessaoId: contextoSessao.sessaoId,
      ...(typeof contextoSessao.cenaId === 'number'
        ? { cenaId: contextoSessao.cenaId }
        : {}),
    };
  }, [contextoSessao]);

  const contextoLabel = useMemo(() => {
    if (!contextoSessao) return null;
    if (typeof contextoSessao.cenaId === 'number') {
      return `Sessao #${contextoSessao.sessaoId} - Cena #${contextoSessao.cenaId}`;
    }
    return `Sessao #${contextoSessao.sessaoId}`;
  }, [contextoSessao]);

  const carregarDadosRelacionados = useCallback(async () => {
    if (!personagemId) return;

    setLoadingDados(true);
    try {
      const [listaModificadores, listaHistorico] = await Promise.all([
        apiListarModificadoresPersonagemCampanha(
          campanhaId,
          personagemId,
          true,
          filtrosModificador,
        ),
        apiListarHistoricoPersonagemCampanha(campanhaId, personagemId),
      ]);

      setModificadores(listaModificadores);
      setHistorico(listaHistorico);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoadingDados(false);
    }
  }, [campanhaId, filtrosModificador, personagemId]);

  useEffect(() => {
    if (!isOpen || !personagem) return;

    setPvAtual(String(personagem.recursos.pvAtual));
    setPeAtual(String(personagem.recursos.peAtual));
    setEaAtual(String(personagem.recursos.eaAtual));
    setSanAtual(String(personagem.recursos.sanAtual));
    setErro(null);
    setSucesso(null);
    void carregarDadosRelacionados();
  }, [isOpen, personagemId, campanhaId, personagem, carregarDadosRelacionados]);

  async function handleSalvarRecursos() {
    if (!personagemId || !personagem) return;

    const payload = {
      pvAtual: Number.isNaN(Number(pvAtual))
        ? personagem.recursos.pvAtual
        : Number(pvAtual),
      peAtual: Number.isNaN(Number(peAtual))
        ? personagem.recursos.peAtual
        : Number(peAtual),
      eaAtual: Number.isNaN(Number(eaAtual))
        ? personagem.recursos.eaAtual
        : Number(eaAtual),
      sanAtual: Number.isNaN(Number(sanAtual))
        ? personagem.recursos.sanAtual
        : Number(sanAtual),
    };

    setErro(null);
    setSucesso(null);
    setSavingRecursos(true);
    try {
      const atualizado = await apiAtualizarRecursosPersonagemCampanha(
        campanhaId,
        personagemId,
        payload,
      );
      onPersonagemAtualizado(atualizado);
      setPvAtual(String(atualizado.recursos.pvAtual));
      setPeAtual(String(atualizado.recursos.peAtual));
      setEaAtual(String(atualizado.recursos.eaAtual));
      setSanAtual(String(atualizado.recursos.sanAtual));
      setSucesso('Recursos atualizados na ficha da campanha.');
      await carregarDadosRelacionados();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSavingRecursos(false);
    }
  }

  async function handleAplicarModificador() {
    if (!personagemId) return;
    const valor = Number(valorModificador);

    if (Number.isNaN(valor) || valor === 0) {
      setErro('Informe um valor inteiro diferente de zero para o modificador.');
      return;
    }

    if (!nomeModificador.trim()) {
      setErro('Informe um nome para identificar a origem do modificador.');
      return;
    }

    setErro(null);
    setSucesso(null);
    setSavingModificador(true);
    try {
      const resposta = await apiAplicarModificadorPersonagemCampanha(
        campanhaId,
        personagemId,
        {
          campo: campoModificador,
          valor,
          nome: nomeModificador.trim(),
          descricao: descricaoModificador.trim() || undefined,
          sessaoId: contextoSessao?.sessaoId,
          cenaId:
            typeof contextoSessao?.cenaId === 'number'
              ? contextoSessao.cenaId
              : undefined,
        },
      );

      onPersonagemAtualizado(resposta.personagem);
      setValorModificador('');
      setNomeModificador('');
      setDescricaoModificador('');
      setSucesso('Modificador aplicado com sucesso.');
      await carregarDadosRelacionados();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSavingModificador(false);
    }
  }

  async function handleDesfazerModificador(modificadorId: number) {
    if (!personagemId) return;

    setErro(null);
    setSucesso(null);
    setSavingModificador(true);
    try {
      const resposta = await apiDesfazerModificadorPersonagemCampanha(
        campanhaId,
        personagemId,
        modificadorId,
      );
      onPersonagemAtualizado(resposta.personagem);
      setSucesso('Modificador desfeito com sucesso.');
      await carregarDadosRelacionados();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSavingModificador(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="xl">
      {!personagem ? null : (
        <div className="space-y-5">
          {contextoLabel ? (
            <section className="rounded-lg border border-app-border bg-app-surface p-3">
              <p className="text-xs text-app-muted">
                Contexto dos modificadores: {contextoLabel}
              </p>
            </section>
          ) : null}

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-app-fg">
              Recursos atuais da campanha
            </h3>
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                label={`PV Atual (max ${personagem.recursos.pvMax})`}
                type="number"
                value={pvAtual}
                onChange={(e) => setPvAtual(e.target.value)}
              />
              <Input
                label={`PE Atual (max ${personagem.recursos.peMax})`}
                type="number"
                value={peAtual}
                onChange={(e) => setPeAtual(e.target.value)}
              />
              <Input
                label={`EA Atual (max ${personagem.recursos.eaMax})`}
                type="number"
                value={eaAtual}
                onChange={(e) => setEaAtual(e.target.value)}
              />
              <Input
                label={`SAN Atual (max ${personagem.recursos.sanMax})`}
                type="number"
                value={sanAtual}
                onChange={(e) => setSanAtual(e.target.value)}
              />
            </div>
            <Button onClick={handleSalvarRecursos} disabled={savingRecursos}>
              {savingRecursos ? 'Salvando...' : 'Salvar recursos'}
            </Button>
          </section>

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-app-fg">
              Aplicar modificador narrativo
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                label="Campo"
                value={campoModificador}
                onChange={(e) =>
                  setCampoModificador(
                    e.target.value as CampoModificadorPersonagemCampanha,
                  )
                }
                options={CAMPOS_MODIFICADOR_OPTIONS}
              />
              <Input
                label="Valor (+/-)"
                type="number"
                value={valorModificador}
                onChange={(e) => setValorModificador(e.target.value)}
              />
              <Input
                label="Nome da fonte"
                value={nomeModificador}
                onChange={(e) => setNomeModificador(e.target.value)}
                placeholder="Ex.: Maldicao ancestral"
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Descricao (opcional)"
                  value={descricaoModificador}
                  onChange={(e) => setDescricaoModificador(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleAplicarModificador}
              disabled={savingModificador}
            >
              {savingModificador ? 'Aplicando...' : 'Aplicar modificador'}
            </Button>
          </section>

          {erro && (
            <p className="rounded border border-app-danger/40 bg-app-danger/10 px-3 py-2 text-sm text-app-danger">
              {erro}
            </p>
          )}
          {sucesso && (
            <p className="rounded border border-app-success/40 bg-app-success/10 px-3 py-2 text-sm text-app-success">
              {sucesso}
            </p>
          )}

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-app-fg">Modificadores</h3>
              {loadingDados && (
                <span className="text-xs text-app-muted flex items-center gap-1">
                  <Icon name="spinner" className="w-3 h-3" />
                  Atualizando...
                </span>
              )}
            </div>
            {modificadores.length === 0 ? (
              <p className="text-sm text-app-muted">
                Nenhum modificador aplicado nesta ficha.
              </p>
            ) : (
              <ul className="space-y-2">
                {modificadores.map((modificador) => (
                  <li
                    key={modificador.id}
                    className="rounded border border-app-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-app-fg">
                          {modificador.nome}{' '}
                          <span className="text-app-muted font-normal">
                            ({LABEL_CAMPO_MODIFICADOR[modificador.campo]})
                          </span>
                        </p>
                        <p className="text-sm text-app-muted">
                          Valor: {modificador.valor > 0 ? '+' : ''}
                          {modificador.valor}
                        </p>
                        {modificador.descricao && (
                          <p className="text-sm text-app-muted">
                            {modificador.descricao}
                          </p>
                        )}
                        <p className="text-xs text-app-muted">
                          Criado em {formatarDataHora(modificador.criadoEm)}
                        </p>
                        {modificador.sessaoId !== null || modificador.cenaId !== null ? (
                          <p className="text-xs text-app-muted">
                            Contexto:{' '}
                            {modificador.sessaoId !== null
                              ? `Sessao #${modificador.sessaoId}`
                              : 'Sessao nao informada'}
                            {modificador.cenaId !== null
                              ? ` - Cena #${modificador.cenaId}`
                              : ''}
                          </p>
                        ) : null}
                        {!modificador.ativo && modificador.desfeitoEm && (
                          <p className="text-xs text-app-muted">
                            Desfeito em {formatarDataHora(modificador.desfeitoEm)}
                          </p>
                        )}
                      </div>
                      {modificador.ativo ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            void handleDesfazerModificador(modificador.id)
                          }
                          disabled={savingModificador}
                        >
                          Desfazer
                        </Button>
                      ) : (
                        <span className="text-xs rounded border border-app-border px-2 py-1 text-app-muted">
                          Desfeito
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-app-fg">Historico</h3>
            {historico.length === 0 ? (
              <p className="text-sm text-app-muted">
                Nenhum evento registrado para esta ficha ainda.
              </p>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {historico.map((evento) => (
                  <li
                    key={evento.id}
                    className="rounded border border-app-border px-3 py-2"
                  >
                    <p className="text-sm text-app-fg">{evento.tipo}</p>
                    {evento.descricao && (
                      <p className="text-sm text-app-muted">{evento.descricao}</p>
                    )}
                    <p className="text-xs text-app-muted">
                      {formatarDataHora(evento.criadoEm)}
                      {evento.criadoPor?.apelido
                        ? ` por ${evento.criadoPor.apelido}`
                        : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
