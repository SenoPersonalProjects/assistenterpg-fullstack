'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';

const links = [
  { label: 'Início', href: '#hero' },
  { label: 'Sobre', href: '#about' },
  { label: 'Recursos', href: '#features' },
  { label: 'Classes', href: '#classes' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`landing-navbar ${scrolled ? 'landing-navbar--scrolled' : ''}`}>
      <div className="landing-navbar__content">
        <a href="#hero" className="landing-navbar__brand" aria-label="Voltar ao início">
          <div className="landing-navbar__logo">
            <Image
              src={landingImages.simboloEscola}
              alt="Símbolo da escola"
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-app-fg">Assistente RPG</span>
            <span className="text-xs text-app-muted">Jujutsu Kaisen System</span>
          </div>
        </a>

        <div className="landing-navbar__links">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="landing-navbar__link">
              {link.label}
            </a>
          ))}
          <Link href="/auth/register">
            <Button size="sm" className="landing-navbar__cta">
              Começar agora
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="landing-navbar__toggle"
          onClick={() => setMenuAberto((prev) => !prev)}
          aria-label="Abrir menu"
        >
          <Icon name={menuAberto ? 'close' : 'menu'} className="h-5 w-5" />
        </button>
      </div>

      {menuAberto ? (
        <div className="landing-navbar__mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="landing-navbar__mobile-link"
              onClick={() => setMenuAberto(false)}
            >
              {link.label}
            </a>
          ))}
          <Link href="/auth/register" onClick={() => setMenuAberto(false)}>
            <Button size="sm" className="landing-navbar__mobile-cta">
              Começar agora
            </Button>
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
