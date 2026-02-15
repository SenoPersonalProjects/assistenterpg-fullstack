// components/landing/HeroSection.tsx - CORRIGIDO

'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-overlay-subtle" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-app-muted-surface border border-app-border mb-8">
          <Icon name="sparkles" className="w-4 h-4 text-app-secondary" />
          <span className="text-sm text-app-muted font-medium">
            Sistema completo de RPG Jujutsu Kaisen
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-black text-app-fg mb-6 leading-tight">
          Crie Personagens
          <br />
          <span className="bg-gradient-to-r from-app-primary via-app-secondary to-app-primary bg-clip-text text-transparent">
            Épicos de Jujutsu
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-app-muted mb-12 max-w-3xl mx-auto">
          Assistente completo para criação de personagens, gerenciamento de inventário, técnicas
          inatas e campanhas do sistema Jujutsu Kaisen RPG Standalone.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 text-lg">
              <Icon name="add" className="w-5 h-5 mr-2" />
              Começar Gratuitamente
            </Button>
          </Link>

          <Link href="/auth/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 text-lg">
              <Icon name="forward" className="w-5 h-5 mr-2" />
              Já tenho conta
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <StatItem value="100+" label="Equipamentos" />
          <StatItem value="50+" label="Técnicas Inatas" />
          <StatItem value="∞" label="Possibilidades" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <Icon name="chevron-down" className="w-8 h-8 text-app-secondary" />
      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-app-fg mb-2">{value}</div>
      <div className="text-sm text-app-muted">{label}</div>
    </div>
  );
}
