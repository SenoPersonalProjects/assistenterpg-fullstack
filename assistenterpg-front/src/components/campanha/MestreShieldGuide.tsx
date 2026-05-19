'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
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
    <h1 className="text-base font-black text-app-fg mb-3 tracking-tight border-b border-app-border/10 pb-1" {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 className="text-sm font-black text-app-primary mt-4 mb-2 uppercase tracking-widest" {...props} />
  ),
  h3: ({ ...props }) => (
    <h3 className="text-xs font-bold text-app-fg mt-3 mb-1" {...props} />
  ),
  p: ({ ...props }) => (
    <p className="text-xs text-app-fg/80 leading-relaxed mb-3 font-medium" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="list-disc list-inside text-xs text-app-fg/80 mb-3 space-y-1.5 ml-1" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol
      className="list-decimal list-inside text-xs text-app-fg/80 mb-3 space-y-1.5 ml-1"
      {...props}
    />
  ),
  li: ({ ...props }) => <li className="text-xs" {...props} />,
  strong: ({ ...props }) => (
    <strong className="font-black text-app-fg" {...props} />
  ),
  code: ({ ...props }) => (
    <code
      className="bg-app-primary/10 border border-app-primary/10 px-1.5 py-0.5 rounded text-[10px] text-app-primary font-black"
      {...props}
    />
  ),
  table: ({ ...props }) => (
    <div className="overflow-x-auto mb-4 rounded-xl border border-app-border/10 bg-app-surface/20">
      <table className="min-w-full divide-y divide-app-border/10" {...props} />
    </div>
  ),
  th: ({ ...props }) => (
    <th
      className="bg-app-primary/5 px-3 py-2 text-left text-[10px] text-app-primary font-black uppercase tracking-widest"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="px-3 py-2 text-[11px] text-app-fg/80 border-t border-app-border/5"
      {...props}
    />
  ),
  blockquote: ({ ...props }) => (
    <blockquote
      className="border-l-4 border-app-primary/30 bg-app-primary/5 p-3 rounded-r-xl text-xs text-app-muted italic mb-3"
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Busca rápida no guia"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Ex.: condições, domínio, morte..."
            className="font-bold"
            icon="search"
          />
        </div>

        <div className="flex h-10 items-center gap-1 rounded-xl border border-app-border/10 bg-app-surface/40 p-1">
          {(['RESUMO', 'DETALHADO'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={`relative flex-1 rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                modo === m
                  ? 'bg-app-primary text-white shadow-lg'
                  : 'text-app-muted hover:text-app-fg'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 scrollbar-none">
        {secoesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
            <Icon name="search" className="mb-4 h-12 w-12 text-app-muted" />
            <p className="text-xs font-bold text-app-muted">
              Nenhum tópico encontrado para o termo informado.
            </p>
          </div>
        ) : (
          secoesFiltradas.map((guia) => (
            <details
              key={guia.id}
              className="group rounded-2xl border border-app-border/10 bg-app-surface/30 transition-all hover:border-app-primary/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5">
                <span className="text-xs font-black text-app-fg uppercase tracking-tight group-open:text-app-primary transition-colors">
                  {guia.titulo}
                </span>
                <Icon
                  name="chevron-down"
                  className="h-4 w-4 text-app-muted transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="px-4 pb-4 border-t border-app-border/5 pt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${guia.id}-${modo}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {modo === 'DETALHADO' ? (
                      (() => {
                        const markdownDetalhado = guia.detalhadoMarkdown ?? guia.resumoMarkdown;
                        const { introducaoMarkdown, subtopicos } =
                          extrairSubtopicos(markdownDetalhado);
                        const usarAcordeoes = subtopicos.length > 0;

                        return (
                          <div className="space-y-4">
                            {introducaoMarkdown ? (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {introducaoMarkdown}
                              </ReactMarkdown>
                            ) : null}

                            {usarAcordeoes && (
                              <div className="space-y-2">
                                {subtopicos.map((subtopico, index) => (
                                  <details
                                    key={`${guia.id}-${subtopico.titulo}-${index}`}
                                    open={index === 0}
                                    className="group/sub rounded-xl border border-app-border/5 bg-app-bg/40"
                                  >
                                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5">
                                      <span className="text-[11px] font-bold text-app-fg/90 uppercase tracking-tight">
                                        {subtopico.titulo}
                                      </span>
                                      <Icon name="add" className="h-3 w-3 text-app-muted group-open/sub:hidden" />
                                      <Icon name="close" className="h-3 w-3 text-app-muted hidden group-open/sub:block" />
                                    </summary>
                                    <div className="px-3 pb-3 pt-1">
                                      {subtopico.markdown && (
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={markdownComponents}
                                        >
                                          {subtopico.markdown}
                                        </ReactMarkdown>
                                      )}
                                    </div>
                                  </details>
                                ))}
                              </div>
                            )}

                            {!usarAcordeoes && (
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
                  </motion.div>
                </AnimatePresence>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
