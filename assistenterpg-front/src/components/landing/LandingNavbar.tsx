'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
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
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useGSAP(() => {
    // Initial entry animation
    gsap.fromTo(navRef.current, 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.2 }
    );

    // Setup mobile menu timeline
    tlRef.current = gsap.timeline({ paused: true })
      .to(mobileMenuRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.inOut',
        display: 'flex'
      })
      .fromTo('.landing-navbar__mobile-link, .landing-navbar__mobile-cta',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: 'power2.out' },
        '-=0.2'
      );
  }, { scope: navRef });

  useEffect(() => {
    if (tlRef.current) {
      if (menuAberto) {
        tlRef.current.play();
      } else {
        tlRef.current.reverse();
      }
    }
  }, [menuAberto]);

  return (
    <nav ref={navRef} className={`landing-navbar ${scrolled ? 'landing-navbar--scrolled' : ''}`}>
      <div className="landing-navbar__content">
        <a href="#hero" className="landing-navbar__brand group" aria-label="Voltar ao início">
          <div className="landing-navbar__logo group-hover:rotate-12 transition-transform duration-300">
            <ThemedLogo size={44} priority className="h-full w-full" />
          </div>
          <div className="landing-navbar__brand-copy">
            <span className="landing-navbar__brand-title group-hover:text-app-primary transition-colors">Assistente RPG</span>
            <span className="landing-navbar__brand-subtitle">Maledicência RPG</span>
          </div>
        </a>

        <div className="landing-navbar__links">
          {links.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="landing-navbar__link font-bold hover:text-app-primary transition-all duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-app-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Link href="/auth/register">
            <Button size="sm" className="font-black px-6 shadow-lg shadow-app-primary/20 hover:scale-105 transition-transform duration-300">
              Começar agora
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="landing-navbar__toggle hover:bg-app-surface/80 hover:text-app-primary transition-colors"
          onClick={() => setMenuAberto((prev) => !prev)}
          aria-label="Abrir menu"
        >
          <Icon name={menuAberto ? 'close' : 'menu'} className={`h-5 w-5 transition-transform duration-300 ${menuAberto ? 'rotate-90' : ''}`} />
        </button>
      </div>

      <div
        ref={mobileMenuRef}
        className="landing-navbar__mobile hidden opacity-0 overflow-hidden"
        style={{ height: 0 }}
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
      </div>
    </nav>
  );
}
