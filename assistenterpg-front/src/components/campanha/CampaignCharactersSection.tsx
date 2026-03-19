'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  apiDesassociarPersonagemCampanha,
  apiListarPersonagensBaseDisponiveisCampanha,
  apiListarPersonagensCampanha,
  apiVincularPersonagemCampanha,
  extrairMensagemErro,
} from '@/lib/api';
import type {
  PersonagemBaseDisponivelCampanha,
  PersonagemCampanhaResumo,
} from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { CampaignCharacterEditorModal } from './CampaignCharacterEditorModal';

type Props = {
  campanhaId: number;
  usuarioId: number;
  usuarioEhMestre: boolean;
  onTotalPersonagensChange?: (total: number) => void;
};

function chaveDismissSugestao(campanhaId: number): string {
  return `assistenterpg:campanha:${campanhaId}:sugestao-personagem-dismissed`;
}

export function CampaignCharactersSection({
  campanhaId,
  usuarioId,
  usuarioEhMestre,
  onTotalPersonagensChange,
}: Props) {
  const [personagensCampanha, setPersonagensCampanha] = useState<
    PersonagemCampanhaResumo[]
  >([]);
  const [personagensBase, setPersonagensBase] = useState<
    PersonagemBaseDisponivelCampanha[]
  >([]);
  const [personagemBaseSelecionado, setPersonagemBaseSelecionado] = useState('');
  const [loading, setLoading] = useState(true);
  const [associando, setAssociando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [personagemEdicao, setPersonagemEdicao] =
    useState<PersonagemCampanhaResumo | null>(null);
  const [personagemRemocao, setPersonagemRemocao] =
    useState<PersonagemCampanhaResumo | null>(null);
  const [removendoPersonagemId, setRemovendoPersonagemId] = useState<number | null>(
    null,
  );
  const [sugestaoAberta, setSugestaoAberta] = useState(false);
  const [sugestaoInicializada, setSugestaoInicializada] = useState(false);
  const onTotalPersonagensChangeRef = useRef(onTotalPersonagensChange);

  useEffect(() => {
    onTotalPersonagensChangeRef.current = onTotalPersonagensChange;
  }, [onTotalPersonagensChange]);

  useEffect(() => {
    setSugestaoAberta(false);
    setSugestaoInicializada(false);
  }, [campanhaId]);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const [personagens, personagensDisponiveis] = await Promise.all([
        apiListarPersonagensCampanha(campanhaId),
        apiListarPersonagensBaseDisponiveisCampanha(campanhaId),
      ]);

      setPersonagensCampanha(personagens);
      onTotalPersonagensChangeRef.current?.(personagens.length);
      setPersonagensBase(personagensDisponiveis);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }, [campanhaId]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const idsBaseJaAssociados = useMemo(
    () => new Set(personagensCampanha.map((personagem) => personagem.personagemBaseId)),
    [personagensCampanha],
  );

  const opcoesPersonagensBase = useMemo(
    () =>
      personagensBase
        .filter((personagem) => !idsBaseJaAssociados.has(personagem.id))
        .map((personagem) => ({
          value: String(personagem.id),
          label: usuarioEhMestre
            ? `${personagem.nome} (Nv ${personagem.nivel}) - ${personagem.dono.apelido}`
            : `${personagem.nome} (Nv ${personagem.nivel})`,
        })),
    [personagensBase, idsBaseJaAssociados, usuarioEhMestre],
  );

  const usuarioJaTemPersonagemNaCampanha = useMemo(
    () =>
      personagensCampanha.some((personagem) => personagem.donoId === usuarioId),
    [personagensCampanha, usuarioId],
  );
  const limiteUsuarioAtingido =
    !usuarioEhMestre && usuarioJaTemPersonagemNaCampanha;

  useEffect(() => {
    if (loading || sugestaoInicializada) return;

    if (typeof window === 'undefined') {
      setSugestaoInicializada(true);
      return;
    }

    const foiDispensada =
      window.sessionStorage.getItem(chaveDismissSugestao(campanhaId)) === '1';
    const deveSugerir =
      !usuarioJaTemPersonagemNaCampanha &&
      opcoesPersonagensBase.length > 0 &&
      !foiDispensada;

    if (deveSugerir) {
      setPersonagemBaseSelecionado((atual) =>
        atual || opcoesPersonagensBase[0]?.value || '',
      );
      setSugestaoAberta(true);
    }

    setSugestaoInicializada(true);
  }, [
    campanhaId,
    loading,
    opcoesPersonagensBase,
    sugestaoInicializada,
    usuarioJaTemPersonagemNaCampanha,
  ]);

  function handleDispensarSugestao() {
    setSugestaoAberta(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(chaveDismissSugestao(campanhaId), '1');
    }
  }

  async function handleAssociarPersonagem() {
    if (!personagemBaseSelecionado) {
      setErro('Selecione um personagem-base para associar.');
      return;
    }

    setErro(null);
    setSucesso(null);
    setAssociando(true);
    try {
      await apiVincularPersonagemCampanha(campanhaId, {
        personagemBaseId: Number(personagemBaseSelecionado),
      });
      setPersonagemBaseSelecionado('');
      setSucesso('Personagem associado com sucesso na campanha.');
      setSugestaoAberta(false);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(chaveDismissSugestao(campanhaId));
      }
      await carregarDados();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setAssociando(false);
    }
  }

  function handlePersonagemAtualizado(personagemAtualizado: PersonagemCampanhaResumo) {
    setPersonagensCampanha((atual) =>
      atual.map((personagem) =>
        personagem.id === personagemAtualizado.id ? personagemAtualizado : personagem,
      ),
    );
    setPersonagemEdicao(personagemAtualizado);
  }

  function handleSolicitarDesassociar(personagem: PersonagemCampanhaResumo) {
    setPersonagemRemocao(personagem);
  }

  async function handleConfirmarDesassociacao() {
    if (!personagemRemocao) return;

    setErro(null);
    setSucesso(null);
    setRemovendoPersonagemId(personagemRemocao.id);
    try {
      await apiDesassociarPersonagemCampanha(campanhaId, personagemRemocao.id);
      setPersonagemRemocao(null);
      setSucesso('Personagem desassociado da campanha com sucesso.');
      await carregarDados();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setRemovendoPersonagemId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-app-border bg-app-surface p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary">
            <Icon name="id" className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-app-fg">
              Associar personagem-base
            </h3>
            <p className="text-sm text-app-muted">
              Jogadores e observadores podem ter apenas 1 personagem por campanha.
              Mestres podem associar vários personagens. A ficha da campanha pode
              receber modificadores sem alterar a ficha-base.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="md:w-[340px]">
            <Select
              label={
                usuarioEhMestre
                  ? 'Personagem-base para associar'
                  : 'Meu personagem-base'
              }
              value={personagemBaseSelecionado}
              onChange={(event) => setPersonagemBaseSelecionado(event.target.value)}
              disabled={limiteUsuarioAtingido}
            >
              <option value="">Selecione...</option>
              {opcoesPersonagensBase.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </Select>
          </div>
          <Button
            onClick={handleAssociarPersonagem}
            disabled={associando || loading || limiteUsuarioAtingido}
          >
            {associando ? 'Associando...' : 'Associar personagem'}
          </Button>
        </div>
        {limiteUsuarioAtingido && (
          <p className="text-xs text-app-muted">
            Você já possui um personagem associado nesta campanha.
          </p>
        )}
        {erro && (
          <p className="text-xs text-app-danger">
            {erro}
          </p>
        )}
        {sucesso && (
          <p className="text-xs text-app-success">
            {sucesso}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-app-muted flex items-center gap-2">
          <Icon name="spinner" className="w-4 h-4" />
          Carregando personagens da campanha...
        </p>
      ) : personagensCampanha.length === 0 ? (
        <EmptyState
          variant="card"
          icon="characters"
          title="Nenhum personagem associado"
          description="Associe um personagem-base para começar a jogar nesta campanha."
          size="sm"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {personagensCampanha.map((personagem) => {
            const podeEditar = usuarioEhMestre || personagem.donoId === usuarioId;
            return (
              <Card key={personagem.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-semibold text-app-fg">
                      {personagem.nome}
                    </h4>
                    <p className="text-xs text-app-muted">
                      Dono: {personagem.dono.apelido} | Base:{' '}
                      {personagem.personagemBase.nome}
                    </p>
                  </div>
                  <Badge color="gray" size="sm">
                    Nv {personagem.nivel}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge color="red" size="sm">
                    PV {personagem.recursos.pvAtual}/{personagem.recursos.pvMax}
                  </Badge>
                  <Badge color="blue" size="sm">
                    PE {personagem.recursos.peAtual}/{personagem.recursos.peMax}
                  </Badge>
                  <Badge color="orange" size="sm">
                    EA {personagem.recursos.eaAtual}/{personagem.recursos.eaMax}
                  </Badge>
                  <Badge color="purple" size="sm">
                    SAN {personagem.recursos.sanAtual}/{personagem.recursos.sanMax}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge color="gray" size="sm">
                    DEF {personagem.defesa.total}
                  </Badge>
                  <Badge color="gray" size="sm">
                    ESQ {personagem.atributos.esquiva}
                  </Badge>
                  <Badge color="gray" size="sm">
                    BLQ {personagem.atributos.bloqueio}
                  </Badge>
                  <Badge
                    color={personagem.modificadoresAtivos.length ? 'purple' : 'gray'}
                    size="sm"
                    className="gap-1"
                  >
                    <Icon name="sparkles" className="h-3 w-3" />
                    Mods {personagem.modificadoresAtivos.length}
                  </Badge>
                </div>

                {podeEditar && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPersonagemEdicao(personagem)}
                    >
                      Editar ficha da campanha
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSolicitarDesassociar(personagem)}
                      disabled={removendoPersonagemId === personagem.id}
                    >
                      {removendoPersonagemId === personagem.id
                        ? 'Desassociando...'
                        : 'Desassociar'}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CampaignCharacterEditorModal
        isOpen={Boolean(personagemEdicao)}
        campanhaId={campanhaId}
        personagem={personagemEdicao}
        onClose={() => setPersonagemEdicao(null)}
        onPersonagemAtualizado={handlePersonagemAtualizado}
      />

      <Modal
        isOpen={sugestaoAberta}
        onClose={handleDispensarSugestao}
        title="Associar personagem na campanha"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-app-muted">
            Você ainda não associou seu personagem nesta campanha. Isso não é
            obrigatório, mas ajuda a liberar a ficha resumida na sessão e o
            controle dos recursos.
          </p>
          <Select
            label="Personagem-base sugerido"
            value={personagemBaseSelecionado}
            onChange={(event) => setPersonagemBaseSelecionado(event.target.value)}
          >
            <option value="">Selecione...</option>
            {opcoesPersonagensBase.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </Select>
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={handleDispensarSugestao}>
              Agora não
            </Button>
            <Button
              onClick={() => void handleAssociarPersonagem()}
              disabled={associando || !personagemBaseSelecionado}
            >
              {associando ? 'Associando...' : 'Associar personagem'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(personagemRemocao)}
        onClose={() => setPersonagemRemocao(null)}
        title="Desassociar personagem da campanha"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-app-muted">
            {personagemRemocao
              ? `Deseja desassociar "${personagemRemocao.nome}" desta campanha?`
              : 'Deseja desassociar este personagem da campanha?'}
          </p>
          <p className="text-xs text-app-muted">
            Isso remove a ficha da campanha e libera o personagem-base para nova associacao.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setPersonagemRemocao(null)}
              disabled={removendoPersonagemId !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={() => void handleConfirmarDesassociacao()}
              disabled={removendoPersonagemId !== null}
            >
              {removendoPersonagemId !== null ? 'Desassociando...' : 'Desassociar'}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
