import {
  Prisma,
  PrismaClient,
  RoleUsuario,
  TamanhoNpcAmeaca,
  TipoFichaNpcAmeaca,
  TipoNpcAmeaca,
} from '@prisma/client';

type SagamiAmeacaSeed = {
  nome: string;
  descricao: string;
  tamanho: TamanhoNpcAmeaca;
  pontosVida: number;
  defesa: number;
  agilidade: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  percepcao: number;
  percepcaoDados: number;
  iniciativa: number;
  iniciativaDados: number;
  fortitude: number;
  fortitudeDados: number;
  reflexos: number;
  reflexosDados: number;
  vontade: number;
  vontadeDados: number;
  deslocamentoMetros: number;
  resistencias: string[];
  vulnerabilidades: string[];
  passivas: Array<Record<string, unknown>>;
  acoes: Array<Record<string, unknown>>;
  usoTatico: string;
};

const AMEACAS_SAGAMI: SagamiAmeacaSeed[] = [
  {
    nome: 'O Parasita de Sagami',
    descricao:
      'Maldição semelhante a um verme abissal com torso deformado e membros atrofiados presos a um tronco desenvolvido. Da cabeça projeta-se uma isca como peixe-pescador, com figura semelhante a um marinheiro.',
    tamanho: TamanhoNpcAmeaca.ENORME,
    pontosVida: 320,
    defesa: 25,
    agilidade: 3,
    forca: 6,
    intelecto: 4,
    presenca: 3,
    vigor: 6,
    percepcao: 6,
    percepcaoDados: 3,
    iniciativa: 8,
    iniciativaDados: 3,
    fortitude: 15,
    fortitudeDados: 6,
    reflexos: 5,
    reflexosDados: 3,
    vontade: 8,
    vontadeDados: 3,
    deslocamentoMetros: 18,
    resistencias: ['Dano 6', 'Energia Amaldiçoada 6'],
    vulnerabilidades: ['Fogo', 'Energia Positiva', 'Perfurante'],
    passivas: [
      {
        nome: 'Dano Transferido',
        descricao:
          'Metade de toda perda de PV do Afogador é passada para o Parasita.',
      },
      {
        nome: 'O Afogador',
        descricao:
          'A isca do Parasita age como segunda iniciativa. Enquanto estiver livre, o Parasita pode usar Correntes Espectrais, Puxar para o Abismo e Aparição Enganosa no próprio turno.',
      },
      {
        nome: 'Destruição do Afogador',
        descricao:
          'Quando O Afogador chega a 0 PV, reaparece após 1d6 rodadas. Até lá, o Parasita sofre -2d20 em Percepção e perde Correntes Espectrais, Puxar para o Abismo e Aparição Enganosa.',
      },
      {
        nome: 'Predador Abissal',
        descricao:
          'Submerso, recebe +4 Defesa, RD 5 e +3 em ataques. Não pode sofrer ataques corpo a corpo do convés; ataques à distância sofrem -1d20. Ser preso por arpão impede submersão.',
      },
      {
        nome: 'Sensibilidade à Luz',
        descricao:
          'Fontes intensas de luz atraem a criatura e podem ser usadas para afastá-la, atraí-la ou ganhar tempo.',
      },
      {
        nome: 'Cracas Abissais',
        descricao:
          'Ao sofrer mais de 50 de dano em um único turno, fragmentos se desprendem e liberam 1d4 Filhotes do Abismo no combate.',
      },
      {
        nome: 'Estágios de Combate',
        descricao:
          'PV > 200: Caçador das Profundezas. PV > 100: Predador Revelado. PV < 99: Frenesi do Naufrágio, ignorando tripulação e recebendo +1 dado de dano em todos os ataques.',
      },
    ],
    acoes: [
      {
        nome: 'Mordida Abissal',
        tipoExecucao: 'Padrão',
        teste: '3d20+14',
        dano: '3+2d8',
        efeito:
          'Fase 1/2. Se o alvo estiver Agarrado ou Caído, causa +1d8 adicional.',
      },
      {
        nome: 'Tentáculos de Pesca',
        tipoExecucao: 'Padrão',
        teste: '3d20+12',
        resistencia: 'Reflexos',
        dtResistencia: 'DT 22',
        efeito:
          'Falha puxa o alvo 6m em direção escolhida pelo Parasita: água, casco ou borda do convés.',
      },
      {
        nome: 'Investida Submersa',
        tipoExecucao: 'Movimento',
        alcance: '15m sob a água',
        resistencia: 'Reflexos',
        dtResistencia: 'DT 20',
        efeito:
          'O Parasita mergulha e atravessa o barco por baixo. Alvos adjacentes ao ponto de emergência que falham ficam Caídos.',
      },
      {
        nome: 'Ataque ao Casco',
        tipoExecucao: 'Padrão',
        dano: '3d10',
        requisitos: 'Fase 2: Predador Revelado',
        efeito: 'Ataque contra estrutura.',
      },
      {
        nome: 'Fixar no Casco',
        tipoExecucao: 'Completa',
        requisitos: 'Fase 2: Predador Revelado',
        efeito:
          'Prende o corpo na embarcação. Enquanto preso, causa 2d10 dano ao casco por rodada e o barco sofre -5 em testes de pilotagem.',
      },
      {
        nome: 'Golpe de Cauda Abissal',
        tipoExecucao: 'Padrão',
        alvo: 'Linha 2x4 no convés',
        teste: '3d20+12',
        dano: '2d10',
        resistencia: 'Reflexos',
        dtResistencia: 'DT 22',
        requisitos: 'Fase 2: Predador Revelado',
        efeito:
          'Falha causa dano total e Caído. Sucesso sofre metade e evita a condição.',
      },
      {
        nome: 'Mordida Abissal - Frenesi',
        tipoExecucao: 'Padrão',
        teste: '3d20+14',
        dano: '3+3d8',
        requisitos: 'Fase 3: Frenesi do Naufrágio',
        efeito:
          'Se o alvo estiver Agarrado ou Caído, causa +1d8 adicional.',
      },
      {
        nome: 'Tentáculos de Pesca - Frenesi',
        tipoExecucao: 'Padrão',
        teste: '3d20+12',
        resistencia: 'Reflexos',
        dtResistencia: 'DT 22',
        requisitos: 'Fase 3: Frenesi do Naufrágio',
        efeito:
          'Falha puxa 6m. Se estiver na borda, cai diretamente na água.',
      },
      {
        nome: 'Ataque ao Casco - Frenesi',
        tipoExecucao: 'Padrão',
        dano: '4d10',
        requisitos: 'Fase 3: Frenesi do Naufrágio',
        efeito: 'Ataque contra estrutura.',
      },
      {
        nome: 'Fixar no Casco - Frenesi',
        tipoExecucao: 'Completa',
        requisitos: 'Fase 3: Frenesi do Naufrágio',
        efeito:
          'Prende o corpo no barco. Enquanto preso, causa 3d10 dano ao casco por rodada e o barco sofre -5 em testes de pilotagem.',
      },
      {
        nome: 'Arrastar para o Fundo',
        tipoExecucao: 'Padrão',
        resistencia: 'Pilotagem do barco',
        dtResistencia: 'DT 22 +2 para cada 10 de dano no motor',
        requisitos: 'Fase 3 e Fixado no Casco',
        efeito:
          'Se vencer o teste, o casco sofre 20 dano direto sem RD e todos no convés fazem Reflexos DT 25; falha deixa Caído.',
      },
    ],
    usoTatico:
      'Use o Afogador para separar personagens e puxar alvos para a água. O Parasita alterna entre submersão, dano estrutural no barco e pressão por fases.',
  },
  {
    nome: 'Filhotes do Abismo',
    descricao:
      'Pequenas maldições desprendidas do Parasita de Sagami, misturando peixe de profundidade e ave marinha deformada. Voam em bandos curtos, mergulham sobre alvos expostos e bicam luzes, carne e cordas.',
    tamanho: TamanhoNpcAmeaca.PEQUENO,
    pontosVida: 15,
    defesa: 20,
    agilidade: 2,
    forca: 3,
    intelecto: 1,
    presenca: 3,
    vigor: 3,
    percepcao: 6,
    percepcaoDados: 1,
    iniciativa: 8,
    iniciativaDados: 2,
    fortitude: 5,
    fortitudeDados: 2,
    reflexos: 8,
    reflexosDados: 3,
    vontade: 4,
    vontadeDados: 1,
    deslocamentoMetros: 9,
    resistencias: ['Dano 2', 'Energia Amaldiçoada 2'],
    vulnerabilidades: ['Fogo', 'Corte'],
    passivas: [
      {
        nome: 'Instinto de Enxame',
        descricao:
          'Se houver outro Filhote do Abismo adjacente ao mesmo alvo, recebe +2 no teste de ataque corpo a corpo.',
      },
      {
        nome: 'Atraídos por Luz',
        descricao:
          'Quando uma fonte de luz intensa for ativada ou erguida em alcance curto, pode priorizá-la para apagar, derrubar ou danificar antes de voltar a atacar pessoas.',
      },
    ],
    acoes: [
      {
        nome: 'Rasante',
        tipoExecucao: 'Padrão',
        teste: '2d20+10',
        dano: '1d8+4 corte + amaldiçoado',
        resistencia: 'Reflexos',
        dtResistencia: 'DT 18',
        efeito:
          'Se acertar fonte de luz carregada por alguém, essa pessoa faz Reflexos. Falha derruba a luz no chão ou na água; sucesso mantém a luz.',
      },
      {
        nome: 'Bico Profundo',
        tipoExecucao: 'Padrão',
        teste: '2d20+9',
        dano: '2d6+4 perfurante',
        resistencia: 'Fortitude',
        dtResistencia: 'DT 18',
        efeito:
          'Falha deixa o alvo Frustrado até o fim do próximo turno. Sucesso sem efeito adicional.',
      },
      {
        nome: 'Nuvem Rasante',
        tipoExecucao: 'Completa',
        dano: '2d6+4',
        resistencia: 'Reflexos',
        dtResistencia: 'DT 20',
        efeito:
          'Move até o deslocamento total e faz um ataque contra alvo no caminho. Se o alvo falhar no Reflexos, fica Desprevenido para o próximo ataque.',
      },
      {
        nome: 'Batida de Asa Salgada',
        tipoExecucao: 'Reação',
        resistencia: 'Percepção',
        dtResistencia: 'DT 16',
        efeito:
          '1/rodada, quando alvo de ataque corpo a corpo, levanta nuvem de sal e gotículas. Falha deixa o atacante Ofuscado até o fim do turno.',
      },
    ],
    usoTatico:
      'Use em bando, preferindo luzes e alvos expostos. Eles funcionam como pressão móvel e distração para o Parasita.',
  },
  {
    nome: 'O Afogador',
    descricao:
      'Isca do Parasita de Sagami, capaz de assumir aparência adequada para amaldiçoar humanos. Na primeira aparição, parece um náufrago sobrevivente do S.S. Marijuana.',
    tamanho: TamanhoNpcAmeaca.MEDIO,
    pontosVida: 90,
    defesa: 20,
    agilidade: 2,
    forca: 3,
    intelecto: 1,
    presenca: 3,
    vigor: 3,
    percepcao: 10,
    percepcaoDados: 3,
    iniciativa: 8,
    iniciativaDados: 2,
    fortitude: 5,
    fortitudeDados: 3,
    reflexos: 8,
    reflexosDados: 3,
    vontade: 5,
    vontadeDados: 3,
    deslocamentoMetros: 9,
    resistencias: [],
    vulnerabilidades: ['Fogo', 'Energia Positiva'],
    passivas: [
      {
        nome: 'Apêndice Sensorial',
        descricao:
          'Órgão predatório ligado ao Parasita. Deve permanecer até alcance curto do corpo principal, age em iniciativa própria e faz parte da mesma criatura.',
      },
      {
        nome: 'Dano Transferido',
        descricao:
          'Metade de toda perda de PV do Afogador é passada para o Parasita.',
      },
      {
        nome: 'Regeneração do Apêndice',
        descricao:
          'Ao chegar a 0 PV, desaparece e começa a se regenerar no Parasita, reaparecendo após 1d6 rodadas.',
      },
      {
        nome: 'Colapso Sensorial',
        descricao:
          'Enquanto destruído, o Parasita sofre -2d20 em Percepção e perde Correntes Espectrais, Puxar para o Abismo e Aparição Enganosa até o retorno.',
      },
    ],
    acoes: [
      {
        nome: 'Isca Mutável',
        tipoExecucao: 'Padrão',
        resistencia: 'Percepção',
        dtResistencia: 'DT 20',
        requisitos: 'Fase 1',
        efeito:
          'Assume aparência de marinheiro ferido, lanterna flutuando, corpo afogado ou vulto na névoa. Se alguém se aproxima voluntariamente, o primeiro ataque contra ele recebe +2d20.',
      },
      {
        nome: 'Correntes Espectrais',
        tipoExecucao: 'Padrão',
        teste: '3d20+12',
        dano: '1d8+4',
        resistencia: 'Reflexos',
        dtResistencia: 'DT 20',
        efeito: 'Fase 1. Falha deixa o alvo Agarrado.',
      },
      {
        nome: 'Puxar para o Abismo',
        tipoExecucao: 'Padrão',
        resistencia: 'Teste oposto de Força ou Agilidade',
        requisitos: 'Alvo Agarrado',
        efeito:
          'Falha do alvo puxa 6m em direção à água. Se cair no mar, o Parasita recebe +2d20 na próxima Mordida Abissal contra ele.',
      },
      {
        nome: 'Aparição Enganosa',
        tipoExecucao: 'Movimento',
        efeito:
          '1/rodada, desaparece sob a água ou névoa e surge em outro ponto da borda do barco para reposicionamento e emboscada.',
      },
      {
        nome: 'Correntes Espectrais - Predador Revelado',
        tipoExecucao: 'Padrão',
        teste: '3d20+10',
        dano: '1d10+4',
        resistencia: 'Reflexos',
        dtResistencia: 'DT 20',
        requisitos: 'Fase 2',
        efeito: 'Falha deixa o alvo Agarrado.',
      },
      {
        nome: 'Investida da Isca',
        tipoExecucao: 'Padrão',
        teste: '3d20+11',
        dano: '2d6+4',
        requisitos: 'Fase 2',
        efeito:
          'Se o alvo estiver Desprevenido ou Caído, causa +1d6 adicional.',
      },
      {
        nome: 'Arrasto Desesperado',
        tipoExecucao: 'Movimento',
        teste: '3d20+10',
        requisitos: 'Fase 3 e alvo Agarrado',
        efeito:
          'Tenta arrastar o alvo para fora do convés. Falha do alvo puxa 6m em direção à água; se cair no mar, o Parasita pode realizar Mordida Abissal como reação.',
      },
      {
        nome: 'Isca Frenética',
        tipoExecucao: 'Padrão',
        teste: '3d20+12',
        dano: '2d6+6',
        requisitos: 'Fase 3',
      },
    ],
    usoTatico:
      'Use como segunda iniciativa do Parasita. Seu papel é enganar, isolar, agarrar e puxar alvos para a água.',
  },
];

export async function seedAmeacasSagami(prisma: PrismaClient) {
  console.log('Cadastrando ameaças de Sagami...');

  const admin = await prisma.usuario.findFirst({
    where: { role: RoleUsuario.ADMIN },
    orderBy: { id: 'asc' },
    select: { id: true, apelido: true, email: true },
  });

  if (!admin) {
    console.warn(
      '  ⚠️ Nenhum usuário ADMIN encontrado; ameaças de Sagami não foram cadastradas.',
    );
    return;
  }

  for (const ameaca of AMEACAS_SAGAMI) {
    const data = {
      donoId: admin.id,
      nome: ameaca.nome,
      descricao: ameaca.descricao,
      fichaTipo: TipoFichaNpcAmeaca.AMEACA,
      tipo: TipoNpcAmeaca.MALDICAO,
      tamanho: ameaca.tamanho,
      vd: 0,
      agilidade: ameaca.agilidade,
      forca: ameaca.forca,
      intelecto: ameaca.intelecto,
      presenca: ameaca.presenca,
      vigor: ameaca.vigor,
      percepcao: ameaca.percepcao,
      percepcaoDados: ameaca.percepcaoDados,
      iniciativa: ameaca.iniciativa,
      iniciativaDados: ameaca.iniciativaDados,
      fortitude: ameaca.fortitude,
      fortitudeDados: ameaca.fortitudeDados,
      reflexos: ameaca.reflexos,
      reflexosDados: ameaca.reflexosDados,
      vontade: ameaca.vontade,
      vontadeDados: ameaca.vontadeDados,
      luta: 0,
      jujutsu: 0,
      defesa: ameaca.defesa,
      pontosVida: ameaca.pontosVida,
      deslocamentoMetros: ameaca.deslocamentoMetros,
      resistencias: ameaca.resistencias as Prisma.InputJsonValue,
      vulnerabilidades: ameaca.vulnerabilidades as Prisma.InputJsonValue,
      passivas: ameaca.passivas as Prisma.InputJsonValue,
      acoes: ameaca.acoes as Prisma.InputJsonValue,
      usoTatico: ameaca.usoTatico,
    };

    const existente = await prisma.npcAmeaca.findFirst({
      where: { donoId: admin.id, nome: ameaca.nome },
      select: { id: true },
    });

    if (existente) {
      await prisma.npcAmeaca.update({
        where: { id: existente.id },
        data,
      });
      console.log(`  ✓ ${ameaca.nome} atualizada`);
      continue;
    }

    await prisma.npcAmeaca.create({ data });
    console.log(`  ✓ ${ameaca.nome} cadastrada`);
  }

  console.log(
    `✅ Ameaças de Sagami sincronizadas para ${admin.apelido} (${admin.email}).`,
  );
}
