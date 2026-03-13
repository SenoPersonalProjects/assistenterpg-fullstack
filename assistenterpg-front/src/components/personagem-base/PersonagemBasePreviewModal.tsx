'use client';

import type { PersonagemBaseDetalhe, PersonagemBaseResumo } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';

type PersonagemBasePreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  resumo: PersonagemBaseResumo | null;
  detalhe: PersonagemBaseDetalhe | null;
  loading: boolean;
  error?: string | null;
  onOpenFull: () => void;
};

export function PersonagemBasePreviewModal({
  isOpen,
  onClose,
  resumo,
  detalhe,
  loading,
  error,
  onOpenFull,
}: PersonagemBasePreviewModalProps) {
  const nome = detalhe?.nome ?? resumo?.nome ?? 'Pré-visualização';
  const nivel = detalhe?.nivel ?? resumo?.nivel ?? 0;
  const claNome = detalhe?.cla?.nome ?? resumo?.cla ?? '-';
  const classeNome = detalhe?.classe?.nome ?? resumo?.classe ?? '-';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={nome}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onOpenFull} disabled={!resumo}>
            Abrir ficha
          </Button>
        </>
      }
    >
      {loading ? <Loading message="Carregando personagem..." className="py-8 text-app-fg" /> : null}
      {!loading && error ? <ErrorAlert message={error} /> : null}

      {!loading && !error ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="blue">Personagem-base</Badge>
            <span className="text-sm text-app-muted">
              Nível {nivel} | {claNome} | {classeNome}
            </span>
          </div>

          {detalhe ? (
            <>
              <div className="grid gap-3 sm:grid-cols-5">
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">AGI</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.agilidade}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">FOR</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.forca}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">INT</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.intelecto}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">PRE</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.presenca}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">VIG</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.vigor}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">PV / PE</p>
                  <p className="text-sm font-semibold text-app-fg">
                    {detalhe.atributosDerivados.pvMaximo} / {detalhe.atributosDerivados.peMaximo}
                  </p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">EA / SAN</p>
                  <p className="text-sm font-semibold text-app-fg">
                    {detalhe.atributosDerivados.eaMaximo} / {detalhe.atributosDerivados.sanMaximo}
                  </p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">Defesa / Deslocamento</p>
                  <p className="text-sm font-semibold text-app-fg">
                    {detalhe.atributosDerivados.defesaTotal} / {detalhe.atributosDerivados.deslocamento}m
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">Perícias</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.pericias.length}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">Proficiências</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.proficiencias.length}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">Passivas</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.passivas?.length ?? 0}</p>
                </div>
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="text-xs text-app-muted">Poderes</p>
                  <p className="text-lg font-semibold text-app-fg">{detalhe.poderesGenericos?.length ?? 0}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge color="gray" size="sm">
                  Origem: {detalhe.origem.nome}
                </Badge>
                {detalhe.trilha ? (
                  <Badge color="gray" size="sm">
                    Trilha: {detalhe.trilha.nome}
                  </Badge>
                ) : null}
                {detalhe.caminho ? (
                  <Badge color="gray" size="sm">
                    Caminho: {detalhe.caminho.nome}
                  </Badge>
                ) : null}
              </div>

              {detalhe.background ? (
                <div className="rounded-lg border border-app-border bg-app-surface p-3">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-app-muted">
                    Background
                  </p>
                  <p className="text-sm text-app-fg">{detalhe.background}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-app-muted">
              Clique em &quot;Abrir ficha&quot; para visualizar os detalhes completos.
            </p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
