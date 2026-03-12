'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from '@/components/ui/Input';
import { MESTRE_SHIELD_GUIDES } from '@/lib/constants/mestre-shield-guides';

type SubtopicoGuia = {
  titulo: string;
  markdown: string;
};

function extrairSubtopicos(markdown: string): {
  introducaoMarkdown: string;
  subtopicos: SubtopicoGuia[];
} {
  const linhas = markdown.split('\n');
  const introducaoLinhas: string[] = [];
  const subtopicos: SubtopicoGuia[] = [];
  let atual: SubtopicoGuia | null = null;

  for (const linha of linhas) {
    const matchTitulo = linha.match(/^##\s+(.+)$/);
    if (matchTitulo) {
      if (atual) {
        atual.markdown = atual.markdown.trim();
        subtopicos.push(atual);
      }
      atual = {
        titulo: matchTitulo[1].trim(),
        markdown: '',
      };
      continue;
    }

    if (atual) {
      atual.markdown += `${linha}\n`;
    } else {
      introducaoLinhas.push(linha);
    }
  }

  if (atual) {
    atual.markdown = atual.markdown.trim();
    subtopicos.push(atual);
  }

  return {
    introducaoMarkdown: introducaoLinhas.join('\n').trim(),
    subtopicos,
  };
}

const markdownComponents = {
  h1: ({ ...props }) => (
    <h1 className="text-base font-bold text-app-fg mb-2" {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 className="text-sm font-semibold text-app-fg mt-3 mb-1" {...props} />
  ),
  h3: ({ ...props }) => (
    <h3 className="text-xs font-semibold text-app-fg mt-2 mb-1" {...props} />
  ),
  p: ({ ...props }) => (
    <p className="text-xs text-app-fg leading-relaxed mb-2" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="list-disc list-inside text-xs text-app-fg mb-2 space-y-1" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol
      className="list-decimal list-inside text-xs text-app-fg mb-2 space-y-1"
      {...props}
    />
  ),
  li: ({ ...props }) => <li className="text-xs text-app-fg" {...props} />,
  strong: ({ ...props }) => (
    <strong className="font-semibold text-app-fg" {...props} />
  ),
  code: ({ ...props }) => (
    <code
      className="bg-app-bg border border-app-border px-1 py-0.5 rounded text-[11px] text-app-fg"
      {...props}
    />
  ),
  table: ({ ...props }) => (
    <div className="overflow-x-auto mb-2">
      <table className="min-w-full border border-app-border" {...props} />
    </div>
  ),
  th: ({ ...props }) => (
    <th
      className="border border-app-border px-2 py-1 text-left text-[11px] text-app-fg font-semibold"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="border border-app-border px-2 py-1 text-[11px] text-app-fg"
      {...props}
    />
  ),
  blockquote: ({ ...props }) => (
    <blockquote
      className="border-l-2 border-app-primary pl-2 text-xs text-app-muted italic"
      {...props}
    />
  ),
};

export function MestreShieldGuide() {
  const [busca, setBusca] = useState('');
  const [modo, setModo] = useState<'RESUMO' | 'DETALHADO'>('RESUMO');

  const secoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return MESTRE_SHIELD_GUIDES;
    return MESTRE_SHIELD_GUIDES.filter(
      (secao) =>
        secao.titulo.toLocaleLowerCase('pt-BR').includes(termo) ||
        secao.resumoMarkdown.toLocaleLowerCase('pt-BR').includes(termo) ||
        secao.detalhadoMarkdown?.toLocaleLowerCase('pt-BR').includes(termo),
    );
  }, [busca]);

  return (
    <div className="space-y-3">
      <Input
        label="Busca rapida no escudo"
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        placeholder="Ex.: condicoes, perseguicao, dominio"
      />

      <div className="inline-flex items-center rounded border border-app-border bg-app-bg p-1">
        <button
          type="button"
          onClick={() => setModo('RESUMO')}
          className={
            modo === 'RESUMO'
              ? 'rounded px-2 py-1 text-xs font-semibold bg-app-primary text-white'
              : 'rounded px-2 py-1 text-xs font-medium text-app-muted hover:text-app-fg'
          }
        >
          Resumo
        </button>
        <button
          type="button"
          onClick={() => setModo('DETALHADO')}
          className={
            modo === 'DETALHADO'
              ? 'rounded px-2 py-1 text-xs font-semibold bg-app-primary text-white'
              : 'rounded px-2 py-1 text-xs font-medium text-app-muted hover:text-app-fg'
          }
        >
          Detalhado
        </button>
      </div>

      <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1">
        {secoesFiltradas.length === 0 ? (
          <p className="text-xs text-app-muted">
            Nenhum topico encontrado para o termo informado.
          </p>
        ) : (
          secoesFiltradas.map((guia) => (
            <details
              key={guia.id}
              className="rounded border border-app-border bg-app-surface px-3 py-2"
            >
              <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                {guia.titulo}
              </summary>
              <div className="mt-2">
                {modo === 'DETALHADO' ? (
                  (() => {
                    const markdownDetalhado = guia.detalhadoMarkdown ?? guia.resumoMarkdown;
                    const { introducaoMarkdown, subtopicos } =
                      extrairSubtopicos(markdownDetalhado);
                    const usarAcordeoes = subtopicos.length > 0;

                    return (
                      <div className="space-y-2">
                        {introducaoMarkdown ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {introducaoMarkdown}
                          </ReactMarkdown>
                        ) : null}

                        {usarAcordeoes ? (
                          <div className="space-y-2">
                            {subtopicos.map((subtopico, index) => (
                              <details
                                key={`${guia.id}-${subtopico.titulo}-${index}`}
                                open={index === 0}
                                className="rounded border border-app-border bg-app-bg px-2 py-1.5"
                              >
                                <summary className="cursor-pointer text-xs font-semibold text-app-fg">
                                  {subtopico.titulo}
                                </summary>
                                {subtopico.markdown ? (
                                  <div className="mt-2">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={markdownComponents}
                                    >
                                      {subtopico.markdown}
                                    </ReactMarkdown>
                                  </div>
                                ) : null}
                              </details>
                            ))}
                          </div>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {markdownDetalhado}
                          </ReactMarkdown>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {guia.resumoMarkdown}
                  </ReactMarkdown>
                )}
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
