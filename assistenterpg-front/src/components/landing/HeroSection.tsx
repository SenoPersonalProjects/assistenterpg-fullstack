'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';

const stats = [
  { value: '50+', label: 'T?cnicas inatas' },
  { value: '100+', label: 'Equipamentos' },
  { value: '?', label: 'Combina??es' },
];

export function HeroSection() {
  return (
    <section id="hero" className="landing-hero">
      <div className="landing-hero__media">
        <Image
          src={landingImages.hero}
          alt="Ilustra??o de feiticeiro Jujutsu"
          fill
          priority
          className="landing-hero__image"
        />
        <div className="landing-hero__overlay" />
      </div>

      <div className="landing-hero__content">
        <div className="landing-hero__badge">
          <Icon name="sparkles" className="h-4 w-4" />
          Sistema completo de Jujutsu Kaisen RPG
        </div>

        <div className="landing-hero__headline">
          <h1 className="text-4xl md:text-6xl font-black text-app-fg leading-tight">
            Monte campanhas ?picas com
            <span className="landing-hero__accent"> tudo organizado</span>
          </h1>
          <p className="text-base md:text-lg text-app-muted">
            Controle personagens, t?cnicas, invent?rio e sess?es em um painel feito para mestres e
            jogadores mergulharem no universo de Jujutsu Kaisen.
          </p>
        </div>

        <div className="landing-hero__actions">
          <Link href="/auth/register">
            <Button size="lg" className="landing-hero__primary">
              <Icon name="add" className="h-5 w-5" />
              Criar conta gr?tis
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="secondary" className="landing-hero__secondary">
              <Icon name="forward" className="h-5 w-5" />
              J? tenho conta
            </Button>
          </Link>
        </div>

        <div className="landing-hero__stats">
          {stats.map((item) => (
            <div key={item.label} className="landing-hero__stat">
              <span>{item.value}</span>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-hero__logo">
        <Image
          src={landingImages.logoJjkJapones}
          alt="Logo em japon?s"
          fill
          sizes="120px"
          className="object-contain"
        />
      </div>
    </section>
  );
}
