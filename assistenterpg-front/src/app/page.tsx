// app/page.tsx - LANDING PAGE PÚBLICA

import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'Assistente RPG - Sistema Jujutsu Kaisen',
  description:
    'Assistente completo para criação de personagens, gerenciamento de inventário e campanhas do sistema Jujutsu Kaisen RPG Standalone.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
