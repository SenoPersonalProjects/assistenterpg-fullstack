// src/components/ui/Modal.tsx
'use client';

import React, { useEffect } from 'react';
import { Icon } from './Icon';
import { Portal } from './Portal';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
};

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'lg' 
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`
            relative w-full ${sizeClasses[size]} 
            bg-app-surface rounded-lg border border-app-border shadow-2xl 
            max-h-[90vh] flex flex-col
            overflow-hidden
          `}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-app-border flex-shrink-0">
              <h2 className="text-lg font-semibold text-app-fg">{title}</h2>
              <button
                onClick={onClose}
                className="text-app-muted hover:text-app-fg transition-colors"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Body - ✅ Agora com overflow-auto */}
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-app-border p-4 flex items-center justify-end gap-3 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
