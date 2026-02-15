// components/landing/CTASection.tsx - CORRIGIDO

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function CTASection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-gradient-cta relative overflow-hidden shadow-2xl">
          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Crie sua conta gratuitamente e comece a construir personagens épicos agora mesmo.
            </p>

            <Link href="/auth/register">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-app-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                <Icon name="fire" className="w-5 h-5 mr-2" />
                Criar Conta Grátis
              </Button>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Icon name="success" className="w-4 h-4" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1">
                <Icon name="success" className="w-4 h-4" />
                Acesso instantâneo
              </span>
              <span className="flex items-center gap-1">
                <Icon name="success" className="w-4 h-4" />
                100% gratuito
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
