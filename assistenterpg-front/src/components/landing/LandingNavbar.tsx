'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ThemedLogo } from '@/components/ui/ThemedLogo';

const links = [
  { label: 'Início', href: '#hero' },
  { label: 'Sobre', href: '#about' },
  { label: 'Recursos', href: '#features' },
  { label: 'Classes', href: '#classes' },
  { label: 'Ameaças', href: '#villains' },
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
        <a href="#hero" className="landing-navbar__brand" aria-label="Voltar ao início">
          <div className="landing-navbar__logo">
            <ThemedLogo size={44} priority className="h-full w-full" />
          </div>
          <div className="landing-navbar__brand-copy">
            <span className="landing-navbar__brand-title">Assistente RPG</span>
            <span className="landing-navbar__brand-subtitle">Jujutsu Kaisen Standalone</span>
          </div>
        </a>

        <div className="landing-navbar__links">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="landing-navbar__link font-bold hover:text-app-primary transition-colors">
              {link.label}
            </a>
          ))}
          <Link href="/auth/register">
            <Button size="sm" className="font-black px-6 shadow-lg shadow-app-primary/20">
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
                Começar agora
              </Button>
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
