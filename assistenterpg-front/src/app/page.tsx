import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ClassesSection } from '@/components/landing/ClassesSection';
import { VillainsSection } from '@/components/landing/VillainsSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { metadataPublica, serializarJsonLd, SITE_DESCRIPTION, SITE_NAME, urlPublica } from '@/lib/seo/site';

export const metadata = metadataPublica({
  title: 'Assistente RPG — Maledicência RPG',
  description: SITE_DESCRIPTION,
  path: '/',
});

export default function LandingPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: urlPublica('/'),
      inLanguage: 'pt-BR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Web',
      url: urlPublica('/'),
      description: SITE_DESCRIPTION,
      inLanguage: 'pt-BR',
    },
  ];

  return (
    <div className="landing-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />
      <LandingNavbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ClassesSection />
      <VillainsSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
