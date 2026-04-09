'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

export function CTASection() {
  return (
    <section id="cta" className="landing-cta">
      <div className="landing-cta__media">
        <Image
          src={landingImages.ctaGif}
          alt="Malevolent Shrine dominando o campo"
          fill
          unoptimized
          sizes="100vw"
          className="landing-cta__media-file"
        />
      </div>
      <div className="landing-cta__overlay" />

      <div className="landing-section__content landing-section__content--cta">
        <LandingSectionDivider />

        <motion.div
          className="landing-cta__content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={landingStagger}
        >
          <motion.div className="landing-cta__badge" variants={landingScaleIn}>
            <Icon name="rank" className="h-5 w-5" />
          </motion.div>

          <motion.h2 variants={landingFadeUp}>
            Libere sua expansão de domínio e jogue campanhas memoráveis!
          </motion.h2>

          <motion.p variants={landingFadeUp}>
            Crie sua conta, organize fichas, conduza cenas intensas e transforme a mesa em algo
            de outro nível desde a primeira sessao.
          </motion.p>

          <motion.div variants={landingFadeUp}>
            <Link href="/auth/register">
              <Button size="lg" className="landing-cta__button">
                Comecar agora
                <Icon name="forward" className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
