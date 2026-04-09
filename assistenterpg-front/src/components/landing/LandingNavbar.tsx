'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';

const links = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Sobre', href: '#about' },
  { label: 'Recursos', href: '#features' },
  { label: 'Classes', href: '#classes' },
  { label: 'Ameacas', href: '#villains' },
] as const;

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
        <a href="#hero" className="landing-navbar__brand" aria-label="Voltar ao inicio">
          <div className="landing-navbar__logo">
            <Image
              src={landingImages.simboloEscola}
              alt="Simbolo da escola"
              fill
              sizes="44px"
              className="object-contain"
            />
          </div>
          <div className="landing-navbar__brand-copy">
            <span className="landing-navbar__brand-title">Assistente RPG</span>
            <span className="landing-navbar__brand-subtitle">Jujutsu Kaisen Standalone</span>
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
              Comecar agora
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

      <AnimatePresence>
        {menuAberto ? (
          <motion.div
            className="landing-navbar__mobile"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
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
                Comecar agora
              </Button>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
