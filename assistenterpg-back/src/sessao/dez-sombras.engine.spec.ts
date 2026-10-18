import { obterSombra } from './dez-sombras.catalogo';
import { CONFIG_TAKARAMONO } from '../../prisma/seeds/haeinsa/revisao';
import {
  cargaSombras,
  comandarSombra,
  consumirAcaoSombra,
  custoInvocacao,
  descansarSombras,
  estadoSombra,
  iniciarEstadoSombras,
  iniciarTurnoSombras,
  liberarSombra,
  podeManifestar,
  prepararAspectosSombras,
  registrarDanoSombra,
} from './dez-sombras.engine';

describe('Dez Sombras — regras revisadas de Haeinsa', () => {
  const novo = () => iniciarEstadoSombras(structuredClone(CONFIG_TAKARAMONO));
  const manifestar = (
    estado: ReturnType<typeof novo>,
    codigo: string,
    id: number,
  ) => {
    const st = estadoSombra(estado, codigo);
    st.npcSessaoId = id;
    return st;
  };
  it('aplica descontos sem reduzir a Carga, sustentação ou PE', () => {
    expect(
      custoInvocacao(CONFIG_TAKARAMONO, obterSombra('SERPENTE_OROCHI')),
    ).toEqual({ ea: 2, pe: 1, execucao: 'MOVIMENTO' });
    expect(custoInvocacao(CONFIG_TAKARAMONO, obterSombra('NUE'))).toEqual({
      ea: 1,
      pe: 0,
      execucao: 'LIVRE',
    });
    expect(obterSombra('SERPENTE_OROCHI').carga).toBe(5);
  });
  it('não transforma fusões com Nue em Ação Livre', () => {
    expect(
      custoInvocacao(CONFIG_TAKARAMONO, obterSombra('ABISMO_POCO')),
    ).toEqual({ ea: 5, pe: 0, execucao: 'MOVIMENTO' });
    expect(
      custoInvocacao(CONFIG_TAKARAMONO, obterSombra('NUE_AMPLIADO')),
    ).toEqual({ ea: 5, pe: 1, execucao: 'MOVIMENTO' });
  });
  it('permite múltiplas sombras até carga18 e bloqueia o excesso', () => {
    const e = novo();
    manifestar(e, 'MADOKA', 1);
    manifestar(e, 'CAO_TOTALIDADE', 2);
    expect(cargaSombras(e)).toBe(18);
    expect(() =>
      podeManifestar(CONFIG_TAKARAMONO, e, obterSombra('NUE'), 18),
    ).toThrow('Carga');
  });
  it('bloqueia componentes simultâneos e Agito não dominado', () => {
    const e = novo();
    manifestar(e, 'SAPO', 1);
    expect(() =>
      podeManifestar(CONFIG_TAKARAMONO, e, obterSombra('ABISMO_POCO'), 18),
    ).toThrow('componente');
    expect(() =>
      podeManifestar(CONFIG_TAKARAMONO, novo(), obterSombra('AGITO'), 30),
    ).toThrow('dominado');
  });
  it('não libera os cães originais depois da Totalidade', () => {
    expect(() =>
      podeManifestar(CONFIG_TAKARAMONO, novo(), obterSombra('CAO_PRETO'), 18),
    ).toThrow('Totalidade');
  });
  it('não reutiliza Nue destruído para formar uma fusão', () => {
    const estado = novo();
    registrarDanoSombra(estado, 'NUE', 0);
    expect(() =>
      podeManifestar(
        CONFIG_TAKARAMONO,
        estado,
        obterSombra('NUE_AMPLIADO'),
        18,
      ),
    ).toThrow('destruída');
  });
  it('prepara Aspectos uma vez depois de Dormir e recusa passivas', () => {
    const estado = novo(),
      config = structuredClone(CONFIG_TAKARAMONO);
    expect(() =>
      prepararAspectosSombras(config, estado, ['SAPO:LINGUADA']),
    ).toThrow('início do dia');
    descansarSombras(estado);
    expect(() =>
      prepararAspectosSombras(config, estado, ['CAO_TOTALIDADE:CACA']),
    ).toThrow('passivo');
    prepararAspectosSombras(config, estado, [
      'SAPO:LINGUADA',
      'NUE:DESCARREGAR',
    ]);
    expect(config.aspectos).toEqual(['SAPO:LINGUADA', 'NUE:DESCARREGAR']);
    expect(() => prepararAspectosSombras(config, estado, [])).toThrow(
      'início do dia',
    );
  });
  it('liberar/reinvocar conserva PV e condições persistentes', () => {
    const e = novo(),
      s = manifestar(e, 'NUE', 1);
    s.pv = 31;
    s.condicoes = [{ codigo: 'VENENO', restante: null, persistente: true }];
    liberarSombra(e, 'NUE');
    podeManifestar(CONFIG_TAKARAMONO, e, obterSombra('NUE'), 18);
    expect(estadoSombra(e, 'NUE')).toMatchObject({
      pv: 31,
      condicoes: [{ codigo: 'VENENO' }],
    });
  });
  it('Completa da sombra exige Comandar e seu Movimento não gasto', () => {
    const e = novo();
    manifestar(e, 'NUE', 1);
    const descarga = obterSombra('NUE').acoes.find(
      (a) => a.codigo === 'DESCARREGAR',
    )!;
    expect(() => consumirAcaoSombra(e, 'NUE', descarga)).toThrow('Comandar');
    comandarSombra(e, 'NUE');
    consumirAcaoSombra(e, 'NUE', descarga);
    expect(estadoSombra(e, 'NUE')).toMatchObject({
      movimentoUsado: true,
      padraoDisponivel: false,
    });
  });
  it('movimento anterior impede usar Completa mesmo após Comandar', () => {
    const e = novo();
    manifestar(e, 'NUE', 1);
    consumirAcaoSombra(e, 'NUE', {
      codigo: 'MOVER',
      nome: 'Mover',
      execucao: 'MOVIMENTO',
    });
    comandarSombra(e, 'NUE');
    expect(() =>
      consumirAcaoSombra(
        e,
        'NUE',
        obterSombra('NUE').acoes.find((a) => a.codigo === 'DESCARREGAR')!,
      ),
    ).toThrow('Movimento');
  });
  it('uma única Reação das Sombras é compartilhada por todas as criaturas', () => {
    const e = novo();
    manifestar(e, 'SAPO', 1);
    manifestar(e, 'COELHO_MEDIO', 2);
    consumirAcaoSombra(
      e,
      'SAPO',
      obterSombra('SAPO').acoes.find((a) => a.codigo === 'PROTEGER')!,
    );
    expect(() =>
      consumirAcaoSombra(
        e,
        'COELHO_MEDIO',
        obterSombra('COELHO_MEDIO').acoes[0],
      ),
    ).toThrow('Reação das Sombras');
  });
  it('processar o mesmo início de turno não reinicia ações nem cobra novamente', () => {
    const e = novo();
    expect(iniciarTurnoSombras(e, '1:1:1', '1:1')).toBe(true);
    e.gasto = 8;
    expect(iniciarTurnoSombras(e, '1:1:1', '1:1')).toBe(false);
    expect(e.gasto).toBe(8);
  });
  it('condições temporárias continuam expirando sem manifestação', () => {
    const e = novo();
    estadoSombra(e, 'NUE').condicoes = [
      { codigo: 'ATORDOADO', restante: 1, persistente: false },
    ];
    iniciarTurnoSombras(e, '1:2:1', '1:2');
    expect(estadoSombra(e, 'NUE').condicoes).toEqual([]);
  });
  it('Dormir restaura PV sem ressuscitar uma sombra destruída', () => {
    const e = novo();
    estadoSombra(e, 'NUE').pv = 15;
    registrarDanoSombra(e, 'SAPO', 0);
    descansarSombras(e);
    expect(estadoSombra(e, 'NUE').pv).toBe(100);
    expect(estadoSombra(e, 'SAPO').destruido).toBe(true);
  });
  it('Dormir recupera Madoka sacrificado, conservando condições persistentes', () => {
    const e = novo(),
      s = estadoSombra(e, 'MADOKA');
    s.pv = 0;
    s.indisponivelAteDormir = true;
    s.condicoes = [
      { codigo: 'PERSISTENTE', restante: null, persistente: true },
      { codigo: 'TEMPORARIA', restante: 2, persistente: false },
    ];
    descansarSombras(e);
    expect(s.pv).toBe(180);
    expect(s.indisponivelAteDormir).toBe(false);
    expect(s.condicoes).toHaveLength(1);
  });
  it.each([
    [275, 'COELHO_ENORME'],
    [175, 'COELHO_GRANDE'],
    [65, 'COELHO_MEDIO'],
  ])('reduz automaticamente o Coelho com %sPV para %s', (pv, codigo) => {
    const e = novo();
    manifestar(e, 'COELHO_COLOSSAL', 7);
    expect(registrarDanoSombra(e, 'COELHO_COLOSSAL', Number(pv))).toBe(codigo);
    expect(e.sombras[codigo]).toMatchObject({ pv, npcSessaoId: 7 });
  });
});
