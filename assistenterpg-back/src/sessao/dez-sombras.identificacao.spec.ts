import { resolverConfigSombrasPersonagem } from './dez-sombras.engine';

describe('identificação mecânica das Dez Sombras', () => {
  const config = { dominadas: ['NUE'], aspectos: [], grauEfetivo: 4 };
  it('preserva configuração com técnica editável de código próprio', () => {
    expect(
      resolverConfigSombrasPersonagem({
        configuracaoDezSombras: config,
        tecnicaInataPropria: { codigo: 'COPIA_EDITAVEL' },
      }),
    ).toEqual(config);
  });
  it('aceita configuração herdada da ficha-base', () => {
    expect(
      resolverConfigSombrasPersonagem({
        personagemBase: { configuracaoDezSombras: config },
      }),
    ).toEqual(config);
  });
  it('reconhece o código original mesmo com cópia editável', () => {
    expect(
      resolverConfigSombrasPersonagem({
        tecnicaInata: { codigo: 'DEZ_SOMBRAS' },
        tecnicaInataPropria: { codigo: 'COPIA_EDITAVEL' },
      })?.grauEfetivo,
    ).toBe(1);
  });
  it('não concede a técnica a outra ficha', () => {
    expect(
      resolverConfigSombrasPersonagem({ tecnicaInata: { codigo: 'OUTRA' } }),
    ).toBeNull();
  });
});
