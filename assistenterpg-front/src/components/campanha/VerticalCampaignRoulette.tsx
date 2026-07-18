'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import type {
  CampanhaRoletaPoolItem,
  CampanhaRoletaGiro,
} from '@/lib/api/campanha-roleta';

const MAX_ITENS_VISUAIS = 12;
const ALTURA_ITEM = 54;
const LARGURA_ITEM = 280;

function hashTexto(valor: string): number {
  let hash = 2166136261;
  for (let indice = 0; indice < valor.length; indice += 1) {
    hash ^= valor.charCodeAt(indice);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function criarGerador(seed: number) {
  let estado = seed || 1;
  return () => {
    estado = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    estado ^= estado + Math.imul(estado ^ (estado >>> 7), 61 | estado);
    return ((estado ^ (estado >>> 14)) >>> 0) / 4294967296;
  };
}

function selecionarItensVisuais(
  itens: CampanhaRoletaPoolItem[],
  giro?: CampanhaRoletaGiro['giro'] | null,
): CampanhaRoletaPoolItem[] {
  if (itens.length === 0) return [];
  const vencedor = giro?.resultado;
  const candidatos = vencedor
    ? itens.filter((item) => item.chave !== vencedor.chave)
    : [...itens];
  const aleatorio = criarGerador(hashTexto(giro?.animacaoId ?? 'estado-inicial'));
  for (let indice = candidatos.length - 1; indice > 0; indice -= 1) {
    const destino = Math.floor(aleatorio() * (indice + 1));
    [candidatos[indice], candidatos[destino]] = [
      candidatos[destino],
      candidatos[indice],
    ];
  }
  const limite = Math.max(1, Math.min(MAX_ITENS_VISUAIS, itens.length));
  return vencedor
    ? [vencedor, ...candidatos.slice(0, limite - 1)]
    : candidatos.slice(0, limite);
}

export function VerticalCampaignRoulette({
  itens,
  giro,
  onAnimationComplete,
}: {
  itens: CampanhaRoletaPoolItem[];
  giro?: CampanhaRoletaGiro['giro'] | null;
  onAnimationComplete?: (resultado: CampanhaRoletaPoolItem) => void;
}) {
  const controls = useAnimationControls();
  const reduzirMovimento = useReducedMotion();
  const rotacao = useRef(0);
  const ultimoGiro = useRef<string | null>(null);
  const [girando, setGirando] = useState(false);
  const [vencedor, setVencedor] = useState<string | null>(null);
  const itensVisuais = useMemo(
    () => selecionarItensVisuais(itens, giro),
    [giro, itens],
  );
  const quantidade = itensVisuais.length;
  const resultadoDestacado = vencedor !== null && !girando;
  const passo = quantidade > 0 ? 360 / quantidade : 360;
  const raio = Math.max(
    130,
    (ALTURA_ITEM * Math.max(quantidade, 6)) / (2 * Math.PI) / 0.82,
  );

  useEffect(() => {
    if (!giro || ultimoGiro.current === giro.animacaoId || quantidade === 0) return;
    ultimoGiro.current = giro.animacaoId;
    let cancelado = false;
    const animar = async () => {
      setGirando(true);
      setVencedor(null);
      const voltas = reduzirMovimento ? 0 : 6 + (hashTexto(giro.animacaoId) % 2);
      const proxima = rotacao.current + voltas * 360;
      rotacao.current = proxima;
      await controls.start({
        rotateX: proxima,
        transition: reduzirMovimento
          ? { duration: 0.12, ease: 'linear' }
          : {
              duration: Math.max(1.2, giro.duracaoMs / 1000),
              ease: [0.16, 1, 0.3, 1],
            },
      });
      if (cancelado) return;
      setVencedor(giro.resultado.chave);
      setGirando(false);
      onAnimationComplete?.(giro.resultado);
    };
    void animar();
    return () => {
      cancelado = true;
    };
  }, [controls, giro, onAnimationComplete, quantidade, reduzirMovimento]);

  if (quantidade === 0) {
    return (
      <div className="flex h-[22rem] items-center justify-center rounded-3xl border border-dashed border-app-border text-sm text-app-muted">
        Configure ao menos um item para visualizar a roleta.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-full max-w-[22rem] overflow-hidden rounded-3xl border border-app-border bg-app-card"
        style={{ height: 352, perspective: '900px' }}
        aria-label={girando ? 'Roleta girando' : 'Roleta pronta'}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-28 bg-gradient-to-b from-app-card via-app-card/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t from-app-card via-app-card/90 to-transparent" />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: resultadoDestacado ? 1.045 : 1,
            opacity: resultadoDestacado ? 1 : 0.72,
          }}
          transition={
            reduzirMovimento
              ? { duration: 0.08 }
              : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
          }
          style={{
            width: LARGURA_ITEM,
            height: ALTURA_ITEM,
            filter: resultadoDestacado
              ? 'drop-shadow(0 0 9px rgba(var(--primary-rgb), 0.72))'
              : 'drop-shadow(0 0 4px rgba(var(--primary-rgb), 0.34))',
          }}
          aria-hidden="true"
        >
          <span className="absolute left-0 top-0 h-5 w-5 rounded-tl-xl border-l-2 border-t-2 border-app-primary" />
          <span className="absolute right-0 top-0 h-5 w-5 rounded-tr-xl border-r-2 border-t-2 border-app-primary" />
          <span className="absolute bottom-0 left-0 h-5 w-5 rounded-bl-xl border-b-2 border-l-2 border-app-primary" />
          <span className="absolute bottom-0 right-0 h-5 w-5 rounded-br-xl border-b-2 border-r-2 border-app-primary" />
        </motion.div>
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-3xl"
          style={{ boxShadow: 'inset 0 0 48px 14px var(--bg)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={controls}
            initial={{ rotateX: 0 }}
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative',
              width: 0,
              height: 0,
            }}
          >
            {itensVisuais.map((item, indice) => {
              const selecionado = vencedor === item.chave;
              return (
                <div
                  key={item.chave}
                  className="absolute"
                  style={{
                    width: LARGURA_ITEM,
                    height: ALTURA_ITEM,
                    marginLeft: -LARGURA_ITEM / 2,
                    marginTop: -ALTURA_ITEM / 2,
                    transform: `rotateX(${indice * passo}deg) translateZ(${raio}px)`,
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div
                    className="absolute inset-x-1 top-1.5 h-full rounded-2xl border border-app-border bg-app-muted-surface"
                    style={{
                      transform: 'translateZ(-7px)',
                      backfaceVisibility: 'hidden',
                      background:
                        'linear-gradient(180deg, var(--bg-muted), var(--bg))',
                      boxShadow:
                        '0 8px 18px color-mix(in srgb, var(--border-subtle) 68%, transparent)',
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center gap-2 rounded-2xl border border-app-border px-4 text-center transition-[background,box-shadow,color] duration-300 ${
                      selecionado ? 'text-app-primary' : 'text-app-fg'
                    }`}
                    style={{
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      background: selecionado
                        ? 'linear-gradient(145deg, color-mix(in srgb, var(--bg-surface) 78%, var(--primary) 22%), color-mix(in srgb, var(--bg-card) 90%, var(--primary) 10%))'
                        : 'linear-gradient(145deg, color-mix(in srgb, var(--bg-surface) 94%, var(--primary) 6%), var(--bg-card))',
                      boxShadow: selecionado
                        ? '0 0 30px rgba(var(--primary-rgb), 0.34), inset 0 1px 0 color-mix(in srgb, var(--primary) 38%, transparent), inset 0 -9px 16px color-mix(in srgb, var(--bg-muted) 72%, transparent)'
                        : 'inset 0 1px 0 color-mix(in srgb, var(--border-subtle) 55%, transparent), inset 0 -9px 16px color-mix(in srgb, var(--bg-muted) 68%, transparent)',
                    }}
                  >
                    <span className="truncate text-base font-bold">{item.nome}</span>
                    {item.ocorrencias > 1 ? (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-bold ${
                          selecionado
                            ? 'border-app-primary/30 bg-app-primary/10 text-app-primary'
                            : 'border-app-border bg-app-muted-surface text-app-muted'
                        }`}
                      >
                        ×{item.ocorrencias}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {vencedor && giro ? `Resultado: ${giro.resultado.nome}` : ''}
      </p>
      <p className="text-xs text-app-muted">
        {girando ? 'Resultado autoritativo em animação…' : 'Resultado definido pelo servidor.'}
      </p>
    </div>
  );
}
