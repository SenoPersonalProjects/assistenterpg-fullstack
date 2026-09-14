import { describe, expect, it } from 'vitest';
import { criarChaveRascunhoWizardPersonagem } from './wizard-draft';

describe('rascunho do wizard de personagem', () => {
  it('isola a persistência por usuário e rejeita identificadores inválidos', () => {
    expect(criarChaveRascunhoWizardPersonagem(42)).toContain(':42');
    expect(criarChaveRascunhoWizardPersonagem(0)).toBeNull();
    expect(criarChaveRascunhoWizardPersonagem(-1)).toBeNull();
  });
});
