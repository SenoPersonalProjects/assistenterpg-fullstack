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
              src={landingImages.logoJjkJapones}
              alt="Jujutsu Kaisen"
              fill
              sizes="56px"
              className="object-contain"
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-app-fg">Assistente RPG</div>
            <div className="text-xs text-app-muted">Jujutsu Kaisen System</div>
          </div>
        </div>

        <div className="landing-footer__links">
          <a href="#hero">In?cio</a>
          <a href="#about">Sobre</a>
          <a href="#features">Recursos</a>
          <Link href="/auth/login">Login</Link>
        </div>

        <div className="landing-footer__cta">
          <Icon name="sparkles" className="h-4 w-4" />
          <span>Feito por f?s, para f?s.</span>
        </div>
      </div>

      <p className="landing-footer__disclaimer">
        N?o possuo os direitos das imagens utilizadas. Projeto sem fins lucrativos.
      </p>
    </footer>
  );
}
