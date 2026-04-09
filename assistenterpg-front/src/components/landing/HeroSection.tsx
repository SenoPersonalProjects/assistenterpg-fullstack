'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

const stats = [
  { value: '50+', label: 'Tecnicas inatas' },
  { value: '100+', label: 'Equipamentos e reliquias' },
  { value: 'Sem fim', label: 'Combates possiveis' },
];

export function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="hero" className="landing-hero">
      <div className="landing-hero__backdrop" />
      <div className="landing-hero__glow" />

      <motion.div
        className="landing-hero__symbol"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={landingImages.heroWatermark}
          alt=""
          fill
          sizes="900px"
          className="object-contain"
        />
      </motion.div>

      <motion.div
        className="landing-hero__content"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={landingStagger}
      >
        <div className="landing-hero__copy">
          <motion.div className="landing-hero__badge" variants={landingScaleIn}>
            <Icon name="sparkles" className="h-4 w-4" />
            Campanhas Jujutsu com atmosfera real de anime
          </motion.div>

          <motion.h1 className="landing-hero__title" variants={landingFadeUp}>
            A sua mesa entra em campo quando a energia amaldicoada toma a tela.
          </motion.h1>

          <motion.p className="landing-hero__description" variants={landingFadeUp}>
            Monte personagens, tecnicas, inventario e sessoes em um fluxo que parece parte do
            proprio universo de Jujutsu Kaisen. Menos cara de painel, mais clima de confronto.
          </motion.p>

          <motion.div className="landing-hero__actions" variants={landingFadeUp}>
            <Link href="/auth/register">
              <Button size="lg" className="landing-hero__primary">
                <Icon name="add" className="h-5 w-5" />
                Comecar agora
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary" className="landing-hero__secondary">
                <Icon name="forward" className="h-5 w-5" />
                Entrar na conta
              </Button>
            </Link>
          </motion.div>

          <motion.div className="landing-hero__stats" variants={landingStagger}>
            {stats.map((item) => (
              <motion.div key={item.label} className="landing-hero__stat" variants={landingScaleIn}>
                <span>{item.value}</span>
                <p>{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="landing-hero__visual"
          variants={landingScaleIn}
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -8, 0],
                  rotate: [0, -0.6, 0.4, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 5.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }
          }
        >
          <div className="landing-hero__frame">
            <Image
              src={landingImages.heroGif}
              alt="Gojo executando Hollow Purple"
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 92vw, 40vw"
              className="landing-hero__gif"
            />
            <div className="landing-hero__frame-overlay" />
          </div>

          <div className="landing-hero__caption">
            <span className="landing-hero__caption-label">Ritmo cinematografico</span>
            <p>
              Rolagens, tecnica, dominio e narrativa reunidos em uma experiencia mais viva para o
              mestre e para o grupo.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
