import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__content">
        <div className="landing-footer__brand">
          <div className="landing-footer__logo">
            <Image
              src={landingImages.simboloEscola}
              alt="Símbolo da escola"
              fill
              sizes="56px"
              className="object-contain"
            />
          </div>
          <div>
            <div className="landing-footer__brand-title">Assistente RPG</div>
            <div className="landing-footer__brand-subtitle">Jujutsu Kaisen Standalone</div>
          </div>
        </div>

        <div className="landing-footer__links">
          <a href="#hero">Início</a>
          <a href="#about">Sobre</a>
          <a href="#features">Recursos</a>
          <a href="#classes">Classes</a>
          <a href="#villains">Ameaças</a>
          <Link href="/auth/login">Login</Link>
        </div>

        <div className="landing-footer__cta">
          <Icon name="sparkles" className="h-4 w-4" />
          <span>Feito por fãs, para fãs.</span>
        </div>
      </div>

      <p className="landing-footer__disclaimer">
        Não possuo os direitos das imagens utilizadas. Projeto sem fins lucrativos.
      </p>
    </footer>
  );
}
