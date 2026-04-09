import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ClassesSection } from '@/components/landing/ClassesSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'Assistente RPG - Sistema Jujutsu Kaisen',
  description:
    'Assistente completo para criação de personagens, gerenciamento de inventário e campanhas do sistema Jujutsu Kaisen RPG Standalone.',
};

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <LandingNavbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ClassesSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
