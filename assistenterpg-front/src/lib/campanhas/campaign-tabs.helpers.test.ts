import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CAMPAIGN_TAB,
  normalizarCampaignTab,
} from './campaign-tabs.helpers';

describe('campaign tabs helpers', () => {
  it('mantem aba valida', () => {
    expect(normalizarCampaignTab('sessoes')).toBe('sessoes');
    expect(normalizarCampaignTab('personagens')).toBe('personagens');
    expect(normalizarCampaignTab('roleta')).toBe('roleta');
  });

  it('usa visao geral para valor ausente ou invalido', () => {
    expect(normalizarCampaignTab(null)).toBe(DEFAULT_CAMPAIGN_TAB);
    expect(normalizarCampaignTab(undefined)).toBe(DEFAULT_CAMPAIGN_TAB);
    expect(normalizarCampaignTab('inventario')).toBe(DEFAULT_CAMPAIGN_TAB);
  });
});
