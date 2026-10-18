// Regras da campanha revisadas pelo mestre em 18/10/2026.
export const REGRAS_FLOR_CAIDA = { gastoMaximoEA: 3, rdPorEA: 5 } as const;
export type AcaoSombra = {
  codigo: string;
  nome: string;
  execucao:
    | 'PADRAO'
    | 'MOVIMENTO'
    | 'COMPLETA'
    | 'REACAO'
    | 'LIVRE'
    | 'PASSIVA';
  custoEA?: number;
  custoPE?: number;
  teste?: string;
  dano?: string;
  efeito?: string;
  basica?: boolean;
  extraivel?: boolean;
  ofensiva?: boolean;
  condicao?: { codigo: string; duracao: 'FIM_PROXIMO_TURNO' };
};
export type SombraCatalogo = {
  codigo: string;
  nome: string;
  familia: string;
  pv: number;
  defesa: number;
  rd: Record<string, number>;
  atributos: [number, number, number, number, number]; // AGI FOR INT PRE VIG
  movimento: number;
  voo?: number;
  tamanho: 'PEQUENO' | 'MEDIO' | 'GRANDE' | 'ENORME' | 'COLOSSAL';
  pericias: Record<string, number>;
  ea: number;
  pe: number;
  carga: number;
  sustentacao: number;
  componentes?: string[];
  herancaDe?: string;
  enxame?: boolean;
  acoes: AcaoSombra[];
};
const ataque = (
  codigo: string,
  nome: string,
  teste: string,
  dano: string,
  extraivel = false,
): AcaoSombra => ({
  codigo,
  nome,
  execucao: 'PADRAO',
  teste,
  dano,
  basica: true,
  ofensiva: true,
  extraivel,
});
const condicao = (codigo: string) => ({
  codigo,
  duracao: 'FIM_PROXIMO_TURNO' as const,
});
export const TAMANHOS_COELHO = [
  {
    codigo: 'MEDIO',
    pv: 65,
    ea: 1,
    pe: 0,
    carga: 1,
    sustentacao: 1,
    dt: 15,
    alvos: 1,
    bonus: 4,
  },
  {
    codigo: 'GRANDE',
    pv: 175,
    ea: 2,
    pe: 0,
    carga: 2,
    sustentacao: 1,
    dt: 20,
    alvos: 2,
    bonus: 8,
  },
  {
    codigo: 'ENORME',
    pv: 275,
    ea: 3,
    pe: 0,
    carga: 3,
    sustentacao: 2,
    dt: 25,
    alvos: 3,
    bonus: 12,
  },
  {
    codigo: 'COLOSSAL',
    pv: 375,
    ea: 4,
    pe: 2,
    carga: 6,
    sustentacao: 2,
    dt: 40,
    alvos: 4,
    bonus: 18,
  },
] as const;
export const CATALOGO_DEZ_SOMBRAS: SombraCatalogo[] = [
  ...['BRANCO', 'PRETO'].map(
    (cor): SombraCatalogo => ({
      codigo: `CAO_${cor}`,
      familia: 'CAES_DIVINOS',
      nome: `Cão Divino ${cor === 'BRANCO' ? 'Branco' : 'Preto'}`,
      pv: 45,
      defesa: 18,
      rd: { IMPACTO: 5 },
      atributos: [3, 2, 2, 2, 2],
      movimento: 12,
      tamanho: 'PEQUENO',
      pericias: { REFLEXOS: 10, FORTITUDE: 5, PERCEPCAO: 10 },
      ea: 1,
      pe: 0,
      carga: 1,
      sustentacao: 1,
      acoes: [
        ataque(
          'AGRESSAO',
          'Agressão Abundante',
          '3d20+10',
          '2d8+4 Corte',
          true,
        ),
        {
          codigo: 'DERRUBAR',
          nome: 'Derrubar',
          execucao: 'LIVRE',
          efeito:
            'Após ambos os cães acertarem o mesmo alvo na rodada: manobra Derrubar.',
        },
        {
          codigo: 'FAREJAR',
          nome: 'Farejar o Caminho de Volta',
          execucao: 'PADRAO',
          extraivel: true,
          efeito:
            '+1d20 em Percepção pelo faro; distingue assinaturas de energia.',
        },
        {
          codigo: 'DETECTAR',
          nome: 'Detectar',
          execucao: 'PASSIVA',
          efeito:
            'Alerta o usuário ao detectar ameaças quando não estiver distraído.',
        },
      ],
    }),
  ),
  {
    codigo: 'CAO_TOTALIDADE',
    familia: 'CAES_DIVINOS',
    nome: 'Cão Divino: Totalidade',
    herancaDe: 'CAES_DIVINOS',
    pv: 140,
    defesa: 26,
    rd: { IMPACTO: 10, CORTANTE: 5 },
    atributos: [5, 4, 2, 2, 4],
    movimento: 15,
    tamanho: 'MEDIO',
    pericias: { REFLEXOS: 15, FORTITUDE: 10, PERCEPCAO: 15, LUTA: 15 },
    ea: 5,
    pe: 0,
    carga: 5,
    sustentacao: 1,
    acoes: [
      ataque('GARRAS', 'Garras da Totalidade', '5d20+15', '4d10+8 Corte', true),
      {
        codigo: 'CACA',
        nome: 'Caçada Implacável',
        execucao: 'PASSIVA',
        efeito: '+1d20 em Percepção para rastrear assinatura já encontrada.',
      },
      {
        codigo: 'DERRUBAR_PRESA',
        nome: 'Derrubar a Presa',
        execucao: 'COMPLETA',
        teste: '5d20+15',
        dano: '4d10+8 Corte',
        ofensiva: true,
        efeito: 'Move até o limite, usa Garras e tenta Derrubar se acertar.',
      },
    ],
  },
  {
    codigo: 'SAPO',
    familia: 'GAMA',
    nome: 'Gama',
    pv: 150,
    defesa: 22,
    rd: { IMPACTO: 10, CORTANTE: 5 },
    atributos: [2, 1, 1, 2, 4],
    movimento: 9,
    tamanho: 'MEDIO',
    pericias: { FORTITUDE: 10, REFLEXOS: 10, ATLETISMO: 10 },
    ea: 3,
    pe: 0,
    carga: 3,
    sustentacao: 1,
    acoes: [
      {
        codigo: 'LINGUADA',
        nome: 'Linguada',
        execucao: 'PADRAO',
        ofensiva: true,
        extraivel: true,
        efeito: 'Curto. Manobra Agarrar, Grande ou menor; +10 no oposto.',
      },
      {
        codigo: 'PUXAR',
        nome: 'Puxar',
        execucao: 'MOVIMENTO',
        extraivel: true,
        efeito: 'Traz o alvo agarrado para adjacente.',
      },
      {
        codigo: 'ESTOMAGO',
        nome: 'Estômago Profundo',
        execucao: 'PASSIVA',
        efeito:
          'Protegido na boca: +5 RD/Defesa. Gama: -5 Defesa e recebe metade do dano causado ao protegido.',
      },
      {
        codigo: 'JOGAR',
        nome: 'Jogar',
        execucao: 'PADRAO',
        ofensiva: true,
        dano: '4d6+5 Impacto',
        efeito: 'Manobra; arremessa alvo agarrado e deixa Caído.',
      },
      {
        codigo: 'PROTEGER',
        nome: 'Proteger',
        execucao: 'REACAO',
        efeito:
          'Até 4,5m: Reflexos contra ataque, puxa aliado até 3m e nega ataque; ou recebe ataque sem teste.',
      },
    ],
  },
  {
    codigo: 'SERPENTE_OROCHI',
    familia: 'OROCHI',
    nome: 'Orochi',
    pv: 200,
    defesa: 22,
    rd: { IMPACTO: 10, PERFURANTE: 5 },
    atributos: [4, 2, 2, 2, 2],
    movimento: 16,
    tamanho: 'ENORME',
    pericias: { FORTITUDE: 10, ATLETISMO: 10, INTIMIDACAO: 5, LUTA: 15 },
    ea: 4,
    pe: 1,
    carga: 5,
    sustentacao: 1,
    acoes: [
      {
        codigo: 'BOTE',
        nome: 'Bote',
        execucao: 'COMPLETA',
        teste: '4d20+15',
        dano: '4d8+6 Perfuração',
        custoPE: 2,
        extraivel: true,
        ofensiva: true,
        efeito:
          'Pode ocorrer na invocação, consumindo Comandar. Acerto: Agarra e carrega.',
      },
      ataque('MORDIDA', 'Mordida', '4d20+15', '4d12+6 Perfuração', true),
      {
        codigo: 'VENENO',
        nome: 'Injetar Veneno',
        execucao: 'MOVIMENTO',
        ofensiva: true,
        efeito:
          'Alvo preso na mordida. Fortitude DT30 imediata impede; falha: 2d8 Veneno no início do turno e novo teste DT30 no fim para encerrar.',
      },
      {
        codigo: 'CARREGAR',
        nome: 'Carregar',
        execucao: 'MOVIMENTO',
        efeito: 'Transporta alvo agarrado durante deslocamento.',
      },
    ],
  },
  {
    codigo: 'NUE',
    familia: 'NUE',
    nome: 'Nue',
    pv: 100,
    defesa: 25,
    rd: { CORTANTE: 5, ELETRICIDADE: 10 },
    atributos: [3, 2, 2, 3, 2],
    movimento: 24,
    voo: 24,
    tamanho: 'MEDIO',
    pericias: { REFLEXOS: 10, ATLETISMO: 5, PERCEPCAO: 10, LUTA: 15 },
    ea: 2,
    pe: 0,
    carga: 2,
    sustentacao: 1,
    acoes: [
      {
        ...ataque(
          'COLISAO',
          'Colisão',
          '3d20+15',
          '2d10+5 Impacto +4d6 Eletricidade',
          true,
        ),
        condicao: condicao('VULNERAVEL'),
        efeito: 'Fortitude DT25: metade da eletricidade e evita Vulnerável.',
      },
      ataque('RASGAR', 'Rasgar', '3d20+15', '2d10+8 Corte'),
      {
        codigo: 'DESCARREGAR',
        nome: 'Descarregar',
        execucao: 'COMPLETA',
        dano: '8d6 Eletricidade',
        extraivel: true,
        ofensiva: true,
        condicao: condicao('ATORDOADO'),
        efeito:
          'Área em alcance curto. Fortitude DT30: metade e evita Atordoado.',
      },
      {
        codigo: 'MAOZINHA',
        nome: 'Mãozinha',
        execucao: 'COMPLETA',
        extraivel: true,
        efeito:
          'Agarra e carrega pelo ar; manobra oposta se resistir. Soltar: Livre, dano de queda normal.',
      },
    ],
  },
  {
    codigo: 'MAX_ELEFANTE',
    familia: 'BANSHO',
    nome: 'Bansho — Elefante Máximo',
    pv: 300,
    defesa: 25,
    rd: { TODOS: 10 },
    atributos: [1, 3, 2, 2, 3],
    movimento: 9,
    tamanho: 'ENORME',
    pericias: { FORTITUDE: 10, ATLETISMO: 10, INTIMIDACAO: 5, LUTA: 15 },
    ea: 6,
    pe: 2,
    carga: 8,
    sustentacao: 2,
    acoes: [
      ataque('ESMAGAR', 'Esmagar', '4d20+15', '5d10+10 Impacto'),
      {
        codigo: 'PRESSAO',
        nome: 'Pressão da Costa',
        execucao: 'COMPLETA',
        ofensiva: true,
        extraivel: true,
        dano: '4d12+10 Impacto',
        efeito:
          'Na invocação: consome Comandar. Exige altura e espaço; Reflexos DT30 evita.',
      },
      {
        codigo: 'JATO',
        nome: "Jato d'Água",
        execucao: 'COMPLETA',
        ofensiva: true,
        extraivel: true,
        dano: '5d10+5 Impacto',
        efeito: 'Linha 9m. Fortitude DT30: metade; falha empurra 4,5m.',
      },
    ],
  },
  ...TAMANHOS_COELHO.map(
    (t): SombraCatalogo => ({
      codigo: `COELHO_${t.codigo}`,
      familia: 'COELHO',
      nome: `Fuga do Coelho — ${t.codigo.toLowerCase()}`,
      pv: t.pv,
      defesa: 15,
      rd: { PERFURANTE: 10 },
      atributos: [2, 1, 0, 1, 0],
      movimento: 9,
      tamanho: t.codigo,
      enxame: true,
      pericias: { FORTITUDE: 5, REFLEXOS: 10, INICIATIVA: 5 },
      ea: t.ea,
      pe: t.pe,
      carga: t.carga,
      sustentacao: t.sustentacao,
      acoes: [
        {
          codigo: 'BARRAGEM',
          nome: 'Barragem de Coelhos',
          execucao: 'REACAO',
          efeito: `Cobertura total para ${t.alvos} alvo(s); enxame recebe o dano.`,
        },
        {
          codigo: 'COORDENADO',
          nome: 'Ataque Coordenado',
          execucao: 'COMPLETA',
          efeito: `+${t.bonus} no próximo ataque aliado.`,
        },
        {
          codigo: 'CORPO',
          nome: 'Corpo Principal',
          execucao: 'PASSIVA',
          efeito: `Percepção DT${t.dt} identifica. Coelho principal só atingido nos 25 PV finais.`,
        },
      ],
    }),
  ),
  {
    codigo: 'MADOKA',
    familia: 'MADOKA',
    nome: 'Madoka — Veado Redondo',
    pv: 180,
    defesa: 22,
    rd: { IMPACTO: 5, ENERGIA_AMALDICOADA: 10, CORTANTE: 5 },
    atributos: [1, 1, 2, 4, 3],
    movimento: 9,
    tamanho: 'GRANDE',
    pericias: { FORTITUDE: 10, VONTADE: 10, LUTA: 10 },
    ea: 9,
    pe: 4,
    carga: 13,
    sustentacao: 2,
    acoes: [
      {
        codigo: 'AURA',
        nome: 'Aura Positiva',
        execucao: 'PASSIVA',
        efeito:
          'Madoka e aliados até 1,5m: RD25 contra dano puramente de EA que entre na área, usando a maior RD. Recupera 2d12 PV no início do turno do usuário se não usou Boop desde o anterior.',
      },
      {
        codigo: 'BOOP',
        nome: 'Boop',
        execucao: 'COMPLETA',
        extraivel: true,
        efeito: 'Toque; cura 4d12+10 PV.',
      },
      {
        ...ataque(
          'GALHADA',
          'Galhada Positiva',
          '1d20+10',
          '2d8 Perfuração',
          true,
        ),
        efeito:
          'Objeto fortalecido: +4d12 Energia Positiva e perde controle até fim do próximo turno do controlador; Maldição: +6d12 Energia Positiva.',
      },
      {
        codigo: 'RESSUSCITACAO',
        nome: 'Ressuscitação',
        execucao: 'COMPLETA',
        efeito:
          'Cura 10d12 e remove Morrendo. Sacrifica PV, libera Madoka e o indisponibiliza até Dormir. Não é destruição permanente. Gatilho automático só com voto específico prévio.',
      },
    ],
  },
  {
    codigo: 'KANGYU',
    familia: 'KANGYU',
    nome: 'Kangyu — Boi Perfurante',
    pv: 220,
    defesa: 20,
    rd: { TODOS: 15, CORTANTE: 5 },
    atributos: [2, 5, 1, 2, 3],
    movimento: 9,
    tamanho: 'GRANDE',
    pericias: { FORTITUDE: 10, ATLETISMO: 15, VONTADE: 5, INTIMIDACAO: 5 },
    ea: 6,
    pe: 2,
    carga: 8,
    sustentacao: 2,
    acoes: [
      {
        codigo: 'INVESTIDA',
        nome: 'Investida',
        execucao: 'COMPLETA',
        ofensiva: true,
        extraivel: true,
        teste: '5d20+15',
        dano: '3d12+15 Impacto',
        efeito:
          '+1d12/3m retos acumulados, máximo +8d12; mudar direção perde momentum. Reflexos DT30 evita arremesso 2d4m e Caído.',
      },
      {
        codigo: 'COURACA',
        nome: 'Couraça Resistente',
        execucao: 'PASSIVA',
        efeito: 'Durante Investida: +15 RD; ignora terreno difícil compatível.',
      },
    ],
  },
  {
    codigo: 'FUNERAL_TIGRE',
    familia: 'TIGRE',
    nome: 'Funeral do Tigre',
    pv: 180,
    defesa: 28,
    rd: { CORTANTE: 5, PERFURANTE: 5 },
    atributos: [5, 3, 2, 2, 2],
    movimento: 12,
    tamanho: 'MEDIO',
    pericias: {
      FORTITUDE: 5,
      ACROBACIA: 10,
      REFLEXOS: 15,
      INTIMIDACAO: 10,
      LUTA: 15,
    },
    ea: 6,
    pe: 2,
    carga: 8,
    sustentacao: 2,
    acoes: [
      {
        codigo: 'CHAMAS',
        nome: 'Derramando Chamas',
        execucao: 'PASSIVA',
        efeito: 'Machucado: +2d8 Fogo em Agredir e Cremação.',
      },
      ataque('AGREDIR', 'Agredir', '5d20+15', '4d8+6 Corte', true),
      {
        codigo: 'CREMACAO',
        nome: 'Cremação',
        execucao: 'COMPLETA',
        ofensiva: true,
        extraivel: true,
        dano: '4d8 Fogo',
        efeito:
          'Curto. Reflexos DT45 evita, DT30 se conhecer a técnica. Chamas até retirada do Tigre, alvo consumido ou negação da técnica.',
      },
    ],
  },
  {
    codigo: 'MAHORAGA',
    familia: 'MAHORAGA',
    nome: 'Mahoraga',
    pv: 420,
    defesa: 30,
    rd: { TODOS: 15 },
    atributos: [5, 6, 3, 4, 6],
    movimento: 12,
    tamanho: 'GRANDE',
    pericias: { FORTITUDE: 20, REFLEXOS: 20, INTIMIDACAO: 20, LUTA: 20 },
    ea: 10,
    pe: 10,
    carga: 20,
    sustentacao: 3,
    acoes: [
      ataque('AGREDIR', 'Agredir', '6d20+20', '8d8+12 Impacto'),
      ataque(
        'ESPADA',
        'Espada do Extermínio',
        '6d20+20',
        '7d10+10 Energia Positiva',
      ),
      {
        codigo: 'RODA',
        nome: 'Girar a Roda',
        execucao: 'LIVRE',
        efeito:
          '1/rodada: avança um fenômeno em um giro. Complexidade 1–4 e consequência definidas pelo mestre; completar cura 8d8.',
      },
      {
        codigo: 'LAMINA',
        nome: 'Lâmina Adaptativa',
        execucao: 'PADRAO',
        ofensiva: true,
        dano: '7d8+10',
        efeito:
          'Exige adaptação ofensiva relevante; propriedade definida pelo mestre.',
      },
    ],
  },
  {
    codigo: 'ABISMO_POCO',
    familia: 'ABISMO',
    nome: 'O Abismo Desconhecido do Poço',
    componentes: ['GAMA', 'NUE'],
    pv: 120,
    defesa: 22,
    rd: { IMPACTO: 5, CORTANTE: 5 },
    atributos: [3, 2, 1, 2, 2],
    movimento: 15,
    voo: 15,
    tamanho: 'GRANDE',
    enxame: true,
    pericias: { REFLEXOS: 10, ATLETISMO: 10 },
    ea: 6,
    pe: 0,
    carga: 6,
    sustentacao: 1,
    acoes: [
      {
        codigo: 'LINGUAS',
        nome: 'Línguas Aladas',
        execucao: 'PADRAO',
        ofensiva: true,
        efeito:
          'Curto: Agarra até dois alvos Grandes ou menores, +10 nos opostos.',
      },
      {
        codigo: 'RESGATE',
        nome: 'Resgate do Poço',
        execucao: 'REACAO',
        efeito: 'Aliado em curto: puxa até 4,5m para espaço livre.',
      },
    ],
  },
  {
    codigo: 'NUE_AMPLIADO',
    familia: 'NUE_AMPLIADO',
    nome: 'Nue Ampliado',
    componentes: ['NUE', 'OROCHI'],
    pv: 260,
    defesa: 26,
    rd: { ELETRICIDADE: 10, IMPACTO: 10 },
    atributos: [5, 4, 2, 3, 4],
    movimento: 30,
    voo: 30,
    tamanho: 'ENORME',
    pericias: { REFLEXOS: 15, PERCEPCAO: 15, LUTA: 15 },
    ea: 8,
    pe: 1,
    carga: 9,
    sustentacao: 2,
    acoes: [
      {
        ...ataque(
          'COLISAO',
          'Colisão Trovejante',
          '5d20+15',
          '4d10+8 Impacto +6d6 Eletricidade',
        ),
        condicao: condicao('VULNERAVEL'),
        efeito: 'Fortitude DT30: metade elétrica e evita Vulnerável.',
      },
      {
        codigo: 'CAUDA',
        nome: 'Cauda Serpentina',
        execucao: 'MOVIMENTO',
        ofensiva: true,
        efeito: 'Manobra Agarrar Grande ou menor, +15 no oposto.',
      },
      {
        codigo: 'TEMPESTADE',
        nome: 'Tempestade de Nue',
        execucao: 'COMPLETA',
        ofensiva: true,
        dano: '10d6 Eletricidade',
        condicao: condicao('ATORDOADO'),
        efeito: 'Curto. Fortitude DT32: metade e evita Atordoado.',
      },
    ],
  },
  {
    codigo: 'AGITO',
    familia: 'AGITO',
    nome: 'Nue: Totalidade — Agito',
    componentes: ['NUE', 'OROCHI', 'MADOKA', 'TIGRE'],
    pv: 360,
    defesa: 30,
    rd: { TODOS: 15, ELETRICIDADE: 15 },
    atributos: [4, 6, 2, 4, 5],
    movimento: 15,
    voo: 18,
    tamanho: 'ENORME',
    pericias: { FORTITUDE: 15, REFLEXOS: 15, LUTA: 20 },
    ea: 14,
    pe: 6,
    carga: 20,
    sustentacao: 3,
    acoes: [
      ataque(
        'AGREDIR',
        'Agredir',
        '6d20+20',
        '6d8+10 Impacto +4d6 Eletricidade',
      ),
      {
        codigo: 'REGENERACAO',
        nome: 'Regeneração Reversa',
        execucao: 'PASSIVA',
        efeito: 'No início do turno do usuário: recupera 4d12 PV.',
      },
      {
        codigo: 'DESCARGA',
        nome: 'Descarga Positiva',
        execucao: 'COMPLETA',
        efeito:
          'Toque: cura 4d12+10 ou causa 8d12 Energia Positiva em alvo sustentado por EA.',
      },
      {
        codigo: 'CAUDA',
        nome: 'Cauda de Orochi',
        execucao: 'MOVIMENTO',
        ofensiva: true,
        efeito: 'Manobra Agarrar, Grande ou menor; +15 no oposto.',
      },
    ],
  },
];
export const HERANCAS_DEZ_SOMBRAS = [
  { origem: 'CAES_DIVINOS', destino: 'CAO_TOTALIDADE' },
];
export function obterSombra(codigo: string): SombraCatalogo {
  const sombra = CATALOGO_DEZ_SOMBRAS.find((s) => s.codigo === codigo);
  if (!sombra) throw new Error(`Sombra desconhecida: ${codigo}`);
  return sombra;
}
