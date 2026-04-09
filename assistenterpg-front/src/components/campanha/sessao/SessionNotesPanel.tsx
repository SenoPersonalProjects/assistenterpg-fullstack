'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiAtualizarAnotacao,
  apiCriarAnotacao,
  apiExcluirAnotacao,
  apiListarAnotacoes,
  extrairMensagemErro,
  type AnotacaoResumo,
} from '@/lib/api';
import { formatarDataHora } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';

type SessionNotesPanelProps = {
  campanhaId: number;
  sessaoId: number;
  onCountChange?: (total: number) => void;
};

export function SessionNotesPanel({
  campanhaId,
  sessaoId,
  onCountChange,
}: SessionNotesPanelProps) {
  const [notas, setNotas] = useState<AnotacaoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');

  const carregarNotas = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const resposta = await apiListarAnotacoes({
        campanhaId,
        sessaoId,
        pagina: 1,
        limite: 50,
      });
      setNotas(resposta.items);
      onCountChange?.(resposta.items.length);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }, [campanhaId, sessaoId, onCountChange]);

  useEffect(() => {
    void carregarNotas();
  }, [carregarNotas]);

  function limparFormulario() {
    setTitulo('');
    setConteudo('');
    setEditandoId(null);
    setFormAberto(false);
  }

  function abrirFormularioNovaNota() {
    setEditandoId(null);
    setTitulo('');
    setConteudo('');
    setFormAberto(true);
  }

  async function handleSalvar() {
    const tituloFinal = titulo.trim();
    const conteudoFinal = conteudo.trim();
    if (!tituloFinal || !conteudoFinal) {
      setErro('Preencha titulo e conteudo.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      if (editandoId) {
        const atualizada = await apiAtualizarAnotacao(editandoId, {
          titulo: tituloFinal,
          conteudo: conteudoFinal,
          campanhaId,
          sessaoId,
        });
        setNotas((prev) => {
          const next = prev.map((nota) =>
            nota.id === atualizada.id ? atualizada : nota,
          );
          onCountChange?.(next.length);
          return next;
        });
      } else {
        const criada = await apiCriarAnotacao({
          titulo: tituloFinal,
          conteudo: conteudoFinal,
          campanhaId,
          sessaoId,
        });
        setNotas((prev) => {
          const next = [criada, ...prev];
          onCountChange?.(next.length);
          return next;
        });
      }

      limparFormulario();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  function handleEditar(nota: AnotacaoResumo) {
    setEditandoId(nota.id);
    setTitulo(nota.titulo);
    setConteudo(nota.conteudo);
    setFormAberto(true);
  }

  async function handleExcluir(nota: AnotacaoResumo) {
    const confirmar = window.confirm(`Excluir anotacao "${nota.titulo}"?`);
    if (!confirmar) return;

    try {
      await apiExcluirAnotacao(nota.id);
      setNotas((prev) => {
        const next = prev.filter((item) => item.id !== nota.id);
        onCountChange?.(next.length);
        return next;
      });
    } catch (error) {
      setErro(extrairMensagemErro(error));
    }
  }

  const buscaNormalizada = busca.trim().toLowerCase();
  const notasFiltradas = buscaNormalizada
    ? notas.filter((nota) => {
        const tituloNormalizado = nota.titulo.toLowerCase();
        const conteudoNormalizado = nota.conteudo.toLowerCase();
        return (
          tituloNormalizado.includes(buscaNormalizada) ||
          conteudoNormalizado.includes(buscaNormalizada)
        );
      })
    : notas;

  return (
    <div className="session-notes">
      <div className="session-notes__header">
        <div className="flex items-center gap-2">
          <Icon name="scroll" className="h-4 w-4 text-app-muted" />
          <p className="text-sm font-semibold text-app-fg">Anotacoes da sessao</p>
        </div>
        <Badge size="sm" color="gray">
          {notas.length} nota{notas.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="session-notes__toolbar">
        <div className="session-notes__search">
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por titulo ou conteudo"
            aria-label="Buscar anotacoes"
          />
          {busca ? (
            <Button size="xs" variant="ghost" onClick={() => setBusca('')}>
              Limpar
            </Button>
          ) : null}
        </div>
        <Button size="sm" className="session-notes__add-btn" onClick={abrirFormularioNovaNota}>
          <Icon name="plus" className="h-4 w-4" />
          Adicionar nota
        </Button>
      </div>

      {erro ? <ErrorAlert message={erro} /> : null}

      <Modal
        isOpen={formAberto}
        onClose={limparFormulario}
        title={editandoId ? 'Editar nota' : 'Nova nota'}
        size="md"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={limparFormulario}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSalvar} disabled={salvando}>
              {salvando ? 'Salvando...' : editandoId ? 'Salvar nota' : 'Adicionar nota'}
            </Button>
          </>
        }
      >
        <div className="session-notes__form">
          <Input
            label="Titulo"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
          />
          <Textarea
            label="Conteudo"
            value={conteudo}
            onChange={(event) => setConteudo(event.target.value)}
            rows={6}
          />
        </div>
      </Modal>

      {loading ? (
        <p className="session-text-xs text-app-muted">Carregando anotacoes...</p>
      ) : notas.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="scroll"
          title="Sem anotacoes"
          description="Crie notas pessoais desta sessao."
          className="text-left"
        />
      ) : notasFiltradas.length === 0 ? (
        <EmptyState
          variant="session"
          size="sm"
          icon="scroll"
          title="Nenhuma anotacao encontrada"
          description="Tente buscar por outro termo ou limpe o filtro."
          className="text-left"
        />
      ) : (
        <div className="session-notes__list">
          {notasFiltradas.map((nota) => (
            <div key={nota.id} className="session-notes__card">
              <div className="session-notes__card-head">
                <div>
                  <p className="session-notes__title">{nota.titulo}</p>
                  <p className="session-notes__meta">{formatarDataHora(nota.criadoEm)}</p>
                </div>
                <div className="session-notes__card-actions">
                  <Button size="xs" variant="ghost" onClick={() => handleEditar(nota)}>
                    Editar
                  </Button>
                  <Button size="xs" variant="destructive" onClick={() => handleExcluir(nota)}>
                    Excluir
                  </Button>
                </div>
              </div>
              <p className="session-notes__content">{nota.conteudo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
