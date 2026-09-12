'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  adicionarCamadaDialogo,
  indiceCamadaDialogo,
  removerCamadaDialogo,
} from '@/lib/ui/dialog-layer';

type DialogLayerContextValue = {
  register: (id: string) => () => void;
  isTopLayer: (id: string) => boolean;
  getLayerIndex: (id: string) => number;
};

const DialogLayerContext = createContext<DialogLayerContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<string[]>([]);
  const overflowAnterior = useRef<string | null>(null);

  useEffect(() => {
    if (layers.length > 0) {
      if (overflowAnterior.current === null) {
        overflowAnterior.current = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
      return;
    }

    if (overflowAnterior.current !== null) {
      document.body.style.overflow = overflowAnterior.current;
      overflowAnterior.current = null;
    }
  }, [layers.length]);

  useEffect(
    () => () => {
      if (overflowAnterior.current !== null) {
        document.body.style.overflow = overflowAnterior.current;
      }
    },
    [],
  );

  const register = useCallback((id: string) => {
    setLayers((current) => adicionarCamadaDialogo(current, id));
    return () => setLayers((current) => removerCamadaDialogo(current, id));
  }, []);

  const value = useMemo<DialogLayerContextValue>(() => ({
    register,
    isTopLayer: (id) => layers.at(-1) === id,
    getLayerIndex: (id) => indiceCamadaDialogo(layers, id),
  }), [layers, register]);

  return <DialogLayerContext.Provider value={value}>{children}</DialogLayerContext.Provider>;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute('hidden'));
}

export function useDialogLayer(isOpen: boolean, onClose: () => void, dialogRef: RefObject<HTMLElement | null>) {
  const context = useContext(DialogLayerContext);
  const id = useId();
  const previousFocus = useRef<HTMLElement | null>(null);
  const register = context?.register;

  useEffect(() => {
    if (!isOpen || !register) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unregister = register(id);
    const animationFrame = requestAnimationFrame(() => {
      const primeiroControle = dialogRef.current
        ? getFocusableElements(dialogRef.current)[0]
        : undefined;
      (primeiroControle ?? dialogRef.current)?.focus();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      unregister();
      if (previousFocus.current?.isConnected) {
        previousFocus.current.focus();
      }
    };
  }, [dialogRef, id, isOpen, register]);

  useEffect(() => {
    if (!isOpen || !context) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!context.isTopLayer(id)) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [context, dialogRef, id, isOpen, onClose]);

  return {
    isTopLayer: !context || context.isTopLayer(id),
    layerIndex: context ? Math.max(0, context.getLayerIndex(id)) : 0,
  };
}
