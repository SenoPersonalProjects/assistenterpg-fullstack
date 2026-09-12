'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';

type DialogLayerContextValue = {
  register: (id: string) => () => void;
  isTopLayer: (id: string) => boolean;
};

const DialogLayerContext = createContext<DialogLayerContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<string[]>([]);

  useEffect(() => {
    if (layers.length === 0) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [layers.length]);

  const register = useCallback((id: string) => {
    setLayers((current) => (current.includes(id) ? current : [...current, id]));
    return () => setLayers((current) => current.filter((layerId) => layerId !== id));
  }, []);

  const value = useMemo<DialogLayerContextValue>(() => ({
    register,
    isTopLayer: (id) => layers.at(-1) === id,
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

  useEffect(() => {
    if (!isOpen || !context) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unregister = context.register(id);
    requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      unregister();
      previousFocus.current?.focus();
    };
  }, [context, dialogRef, id, isOpen]);

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

  return { isTopLayer: !context || context.isTopLayer(id) };
}
