export const CAMPAIGN_TAB_IDS = [
  'visao-geral',
  'sessoes',
  'personagens',
  'membros',
  'roleta',
] as const;

export type CampaignTab = (typeof CAMPAIGN_TAB_IDS)[number];

export const DEFAULT_CAMPAIGN_TAB: CampaignTab = 'visao-geral';

export function normalizarCampaignTab(
  value: string | null | undefined,
): CampaignTab {
  return CAMPAIGN_TAB_IDS.includes(value as CampaignTab)
    ? (value as CampaignTab)
    : DEFAULT_CAMPAIGN_TAB;
}
