// src/components/ui/SelectModal.tsx
'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { Input } from './Input';
import { Button } from './Button';
import { Badge } from './Badge';
import { ClickableCard } from './ClickableCard';

export type SelectModalOption<T = unknown> = {
  value: string | number;
  label: string;
  description?: string | null;
  badges?: { text: string; color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' }[];
  details?: React.ReactNode;
  data?: T;
};

type SelectModalProps = {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  value: string | number;
  options: SelectModalOption[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
  searchable?: boolean;
  emptyText?: string;
  allowClear?: boolean;
};

export function SelectModal({
  label,
  placeholder = 'Selecione...',
  helperText,
  error,
  value,
  options,
  onChange,
  disabled = false,
  searchable = true,
  emptyText = 'Nenhuma opção disponível',
  allowClear = true,
}: SelectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState<string | number | null>(null);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleConfirm = () => {
    if (selectedValue !== null) {
      onChange(selectedValue);
      setIsOpen(false);
      setSearchTerm('');
      setSelectedValue(null);
      setExpandedId(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setSelectedValue(null);
    setExpandedId(null);
  };

  const handleToggleExpand = (optValue: string | number) => {
    if (expandedId === optValue) {
      setExpandedId(null);
    } else {
      setExpandedId(optValue);
      setSelectedValue(optValue);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleOpenModal = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-app-fg">{label}</label>}
        
        {/* ✅ TRIGGER - Usando ClickableCard */}
        <ClickableCard
          onClick={handleOpenModal}
          disabled={disabled}
          error={!!error}
          filled={!!selectedOption}
          padding={selectedOption ? 'md' : 'lg'}
        >
          {selectedOption ? (
            // ✅ ESTADO PREENCHIDO
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-app-fg text-base mb-1">
                    {selectedOption.label}
                  </h4>
                  {selectedOption.description && (
                    <p className="text-sm text-app-muted line-clamp-2 leading-relaxed">
                      {selectedOption.description}
                    </p>
                  )}
                </div>
                
                {/* Botão X para remover */}
                {allowClear && !disabled && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex-shrink-0 rounded-full p-1.5 hover:bg-app-danger/10 text-app-muted hover:text-app-danger transition-all"
                    title="Remover seleção"
                    aria-label="Remover seleção"
                  >
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                )}
              </div>

              {selectedOption.badges && selectedOption.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedOption.badges.map((badge, idx) => (
                    <Badge 
                      key={idx} 
                      color={badge.color || 'blue'} 
                      size="sm"
                    >
                      {badge.text}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // ✅ ESTADO VAZIO
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="rounded-full p-2 bg-app-primary/10 text-app-primary group-hover:bg-app-primary/20 transition-colors">
                <Icon name="add" className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-app-muted group-hover:text-app-fg transition-colors">
                  {placeholder}
                </p>
              </div>
            </div>
          )}
        </ClickableCard>

        {error && <span className="text-xs text-app-danger">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-app-muted">{helperText}</span>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={label || 'Selecionar opção'}
        size="lg"
      >
        <div className="flex flex-col h-full max-h-[70vh]">
          {/* Search */}
          {searchable && options.length > 5 && (
            <div className="mb-3 flex-shrink-0">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="search"
              />
            </div>
          )}

          {/* Lista com scroll */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 min-h-0">
            {filteredOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Icon name="search" className="w-12 h-12 text-app-muted mb-3 opacity-50" />
                <p className="text-app-muted text-sm">{emptyText}</p>
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = String(option.value) === String(value);
                const isExpanded = expandedId === option.value;
                const isCurrentlySelected = selectedValue === option.value;
                
                return (
                  <div
                    key={option.value}
                    className={`
                      rounded-lg border transition-all
                      ${isCurrentlySelected
                        ? 'border-app-primary bg-app-primary/10 ring-2 ring-app-primary/20'
                        : isSelected
                        ? 'border-app-success/50 bg-app-success/5'
                        : 'border-app-border bg-app-card'
                      }
                    `}
                  >
                    {/* Header clicável */}
                    <button
                      type="button"
                      onClick={() => handleToggleExpand(option.value)}
                      className="w-full text-left p-3 hover:bg-app-surface/50 transition-colors rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-app-fg text-sm">
                              {option.label}
                            </h4>
                            {isSelected && (
                              <Badge color="green" size="sm">Atual</Badge>
                            )}
                            {option.badges && option.badges.length > 0 && (
                              <>
                                {option.badges.slice(0, 2).map((badge, idx) => (
                                  <Badge 
                                    key={idx} 
                                    color={badge.color || 'blue'} 
                                    size="sm"
                                  >
                                    {badge.text}
                                  </Badge>
                                ))}
                                {option.badges.length > 2 && (
                                  <Badge color="gray" size="sm">
                                    +{option.badges.length - 2}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          {option.description && (
                            <p className="text-xs text-app-muted line-clamp-2">
                              {option.description}
                            </p>
                          )}
                        </div>

                        <Icon 
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          className="w-4 h-4 text-app-muted flex-shrink-0 transition-transform" 
                        />
                      </div>
                    </button>

                    {/* Detalhes (dropdown interno) */}
                    {isExpanded && option.details && (
                      <div className="px-3 pb-3 pt-0 border-t border-app-border/50 mt-2">
                        <div className="pt-3">
                          {option.details}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer fixo com botão de confirmação */}
          <div className="flex-shrink-0 pt-3 border-t border-app-border flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={selectedValue === null}
              className="flex-1"
            >
              <Icon name="check" className="w-4 h-4" />
              Confirmar seleção
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
