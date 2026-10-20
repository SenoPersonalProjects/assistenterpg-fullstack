import {
  iniciarEstadoSombras,
  liberarAcoesSombrasModoLivre,
  comandarSombra,
  consumirAcaoSombra,
} from './dez-sombras.engine';
import { obterSombra } from './dez-sombras.catalogo';

describe('Dez Sombras sem turnos', () => {
  it('libera acoes sem curar, ressuscitar ou adiantar duracao de condicoes', () => {
    const estado = iniciarEstadoSombras({
      dominadas: ['NUE'],
      aspectos: [],
      grauEfetivo: 4,
    });
    estado.sombras.NUE = {
      pv: 37,
      npcSessaoId: 7,
      condicoes: [{ codigo: 'TESTE', restante: 2, persistente: false }],
    };
    comandarSombra(estado, 'NUE');
    const ataque = obterSombra('NUE').acoes.find((a) => a.codigo === 'RASGAR')!;
    consumirAcaoSombra(estado, 'NUE', ataque);
    expect(() => comandarSombra(estado, 'NUE')).toThrow();
    liberarAcoesSombrasModoLivre(estado);
    expect(() => comandarSombra(estado, 'NUE')).not.toThrow();
    expect(estado.sombras.NUE.pv).toBe(37);
    expect(estado.sombras.NUE.condicoes[0].restante).toBe(2);
  });
});
