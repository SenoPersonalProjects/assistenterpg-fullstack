import {
  AreaEfeito,
  TipoDano,
  TipoEscalonamentoHabilidade,
  TipoExecucao,
} from '@prisma/client';

export const SURTO_TEMPORAL_HABILIDADES = [
  {
    codigo: 'INATA_SURTO_TEMPORAL_REVESTIMENTO',
    nome: 'Surto Temporal',
    descricao:
      'Reveste o usuário com energia amaldiçoada imbuída de distorção temporal.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentado',
    custoEA: 1,
    custoPE: 1,
    custoSustentacaoEA: 1,
    efeito:
      'Enquanto sustentado, recebe +1 em Agilidade, 1 ação de movimento extra e 1 reação especial extra, realizando ações muito mais rápido que o padrão.',
    ordem: 10,
    variacoes: [
      {
        nome: 'Liberação Superior',
        descricao:
          'Eleva a técnica ao limite, acelerando corpo e percepção temporal.',
        substituiCustos: true,
        custoEA: 4,
        custoPE: 2,
        custoSustentacaoEA: 1,
        efeitoAdicional:
          'Enquanto sustentado, recebe 1 ação padrão extra, 1 reação especial extra, +1 em Agilidade, +5 em Percepção e +5 na Defesa.',
        ordem: 10,
      },
      {
        nome: 'Liberação Máxima',
        descricao: 'Projeta o surto temporal em outros seres próximos.',
        substituiCustos: true,
        custoEA: 8,
        custoPE: 4,
        custoSustentacaoEA: 1,
        alcance: 'Curto',
        alvo: 'Até 3 seres',
        efeitoAdicional:
          'Aplica o efeito da Liberação Superior em até 3 seres. A sustentação custa 1 EA por ser afetado.',
        ordem: 20,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_MOMENTUM',
    nome: 'Lapso da Técnica Surto Temporal: Momentum',
    descricao:
      'Acelera a percepção do momento para permitir uma reação defensiva aprimorada.',
    execucao: TipoExecucao.REACAO,
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantâneo',
    custoEA: 1,
    custoPE: 1,
    efeito:
      'Concede +4 na Defesa contra o gatilho da reação. Pode acumular com grau de aprimoramento em Técnica Amaldiçoada.',
    escalonaPorGrau: true,
    grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
    escalonamentoCustoEA: 1,
    escalonamentoTipo: TipoEscalonamentoHabilidade.NUMERICO,
    escalonamentoEfeito: { label: 'Defesa', incremento: 4 },
    ordem: 20,
    variacoes: [
      {
        nome: 'Momentum em Aliado',
        descricao:
          'Concede velocidade e percepção avançada a outro ser que esteja reagindo.',
        custoEA: 1,
        custoPE: 1,
        alcance: 'Curto',
        alvo: '1 ser reagindo a algo',
        efeitoAdicional:
          'Aponta para um ser em alcance curto que está reagindo e concede +4 na Defesa desse alvo. Pode acumular com grau de aprimoramento em Técnica Amaldiçoada.',
        ordem: 10,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_REVERSAO_MOMENTUM',
    nome: 'Reversão de Feitiço: Momentum',
    descricao:
      'Altera a percepção temporal de um alvo para reduzir sua velocidade e reação.',
    execucao: TipoExecucao.ACAO_COMPLETA,
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Instantâneo',
    resistencia: 'Vontade anula',
    custoEA: 2,
    custoPE: 2,
    efeito:
      'O alvo sofre -4 na Defesa e fica FRACO e LENTO por 1 rodada. Vontade anula.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 1 }],
    },
    ordem: 30,
    variacoes: [
      {
        nome: 'Liberação Superior',
        descricao: 'Remove ainda mais velocidade do alvo.',
        substituiCustos: true,
        custoEA: 6,
        custoPE: 4,
        efeitoAdicional:
          'O alvo sofre -8 na Defesa e fica DEBILITADO e LENTO por 1 rodada. Vontade anula o -8 e reduz para FRACO e LENTO.',
        ordem: 10,
      },
      {
        nome: 'Liberação Máxima',
        descricao: 'Chega ao ápice da reversão de Momentum.',
        substituiCustos: true,
        custoEA: 8,
        custoPE: 4,
        efeitoAdicional:
          'O alvo sofre -12 na Defesa e fica PARALISADO por 1 rodada. Vontade reduz para -6 na Defesa e FRACO e LENTO.',
        ordem: 20,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_LOOP_TEMPORAL',
    nome: 'Reversão de Feitiço: Loop Temporal',
    descricao:
      'Aprisiona um alvo em um loop temporal, forçando-o a repetir ações recentes.',
    execucao: TipoExecucao.ACAO_COMPLETA,
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: '2 turnos',
    resistencia: 'Vontade reduz',
    custoEA: 4,
    custoPE: 3,
    efeito:
      'O alvo repete as ações do último turno dele por 2 turnos e fica DESPREVENIDO até interagirem com ele. Vontade deixa apenas VULNERÁVEL e anula o loop.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 1 }],
    },
    ordem: 40,
    variacoes: [
      {
        nome: 'Liberação Superior',
        descricao: 'Amplia a duração do loop temporal.',
        substituiCustos: true,
        custoEA: 7,
        custoPE: 4,
        duracao: '4 turnos',
        efeitoAdicional:
          'O loop dura 4 turnos. Durante esse período, o alvo fica DESPREVENIDO até interagirem com ele. Vontade reduz a duração pela metade.',
        ordem: 10,
      },
      {
        nome: 'Liberação Máxima',
        descricao: 'Estende o loop temporal ao limite.',
        substituiCustos: true,
        custoEA: 10,
        custoPE: 4,
        duracao: '6 turnos',
        efeitoAdicional:
          'O loop dura 6 turnos. Durante esse período, o alvo fica DESPREVENIDO até interagirem com ele. Vontade reduz a duração pela metade.',
        ordem: 20,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_FRAGMENTACAO_INSTANTE',
    nome: 'Fragmentação do Instante',
    descricao:
      'Resgata lapsos temporais das próprias ações realizadas na cena atual.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    custoEA: 3,
    custoPE: 3,
    efeito:
      'Você pode executar até 2 ações da cena atual feitas por você como parte desta técnica, rolando novamente os testes dessas ações. Não pode repetir uma mesma ação depois de resgatá-la e não pode usar esta habilidade sobre ela mesma.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 }],
    },
    ordem: 50,
    variacoes: [
      {
        nome: 'Variação de Ataque',
        descricao:
          'Lapsos temporais repetem o ataque no mesmo valor de teste e dano.',
        substituiCustos: true,
        custoEA: 4,
        custoPE: 4,
        execucao: TipoExecucao.AO_ATACAR,
        alcance: 'Alcance do ataque',
        alvo: 'Alvo do ataque',
        efeitoAdicional:
          'Ao realizar um ataque, duplicatas temporais repetem o mesmo teste de ataque e dano. Pode adicionar mais uma repetição para cada +2 EA gastos, até o limite do Grau de Aprimoramento em Técnica Amaldiçoada.',
        escalonaPorGrau: true,
        escalonamentoCustoEA: 2,
        escalonamentoTipo: TipoEscalonamentoHabilidade.OUTRO,
        escalonamentoEfeito: {
          porAcumulo: '+1 repetição do ataque por +2 EA',
        },
        ordem: 10,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_ANULACAO_EVENTO',
    nome: 'Reversão de Feitiço: Anulação de Evento',
    descricao:
      'Rebobina um ataque ou habilidade até o ponto zero, anulando o evento.',
    execucao: TipoExecucao.REACAO,
    alcance: 'Curto',
    alvo: '1 ataque ou habilidade',
    duracao: 'Instantâneo',
    resistencia: 'Vontade anula',
    dtResistencia: 'DT de feitiços + 5',
    custoEA: 3,
    custoPE: 2,
    efeito:
      'Rebobina um ataque ou habilidade em andamento, anulando-o e devolvendo PE e/ou EA ao alvo caso tenham sido utilizados. Some metade do custo em PE e/ou EA do efeito alvo ao custo desta técnica.',
    requisitos: {
      graus: [
        { tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 2 },
        { tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 1 },
      ],
    },
    ordem: 60,
    variacoes: [
      {
        nome: 'Liberação Superior',
        descricao: 'Rebobina um ataque ou habilidade que já foi sofrido.',
        substituiCustos: true,
        custoEA: 4,
        custoPE: 3,
        execucao: TipoExecucao.ACAO_PADRAO,
        efeitoAdicional:
          'Pode rebobinar um ataque ou habilidade já sofrido e reduzir seus efeitos a zero. Some metade do custo em PE e/ou EA do efeito alvo ao custo desta técnica. Vontade DT de feitiços +5 anula.',
        ordem: 10,
      },
      {
        nome: 'Liberação Máxima',
        descricao:
          'Abre uma barreira para rebobinar uma rodada inteira em uma área.',
        substituiCustos: true,
        custoEA: 12,
        custoPE: 8,
        execucao: TipoExecucao.ACAO_COMPLETA,
        area: AreaEfeito.ESFERA,
        alcance: 'Esfera de 12m de diâmetro',
        alvo: 'Eventos na área',
        efeitoAdicional:
          'Rebobina tudo que aconteceu na última rodada para o que estiver na área. Exige grau de aprimoramento em Técnica de Barreira 1.',
        requisitos: {
          graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 1 }],
        },
        ordem: 20,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_NOSTALGIA',
    nome: 'Reversão de Feitiço: Nostalgia',
    descricao:
      'Revive uma reprise temporal de eventos recentes para extrair informação.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantâneo',
    custoEA: 3,
    custoPE: 3,
    efeito:
      'Revive um evento das últimas 24 horas que você vivenciou, sem alterar acontecimentos. Pode conceder informações ou bônus a critério do mestre em Investigação, Percepção e outras perícias ligadas ao evento.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 2 }],
    },
    ordem: 70,
    variacoes: [
      {
        nome: 'Liberação Superior',
        descricao:
          'Revive acontecimentos vividos por um alvo em um ambiente.',
        substituiCustos: true,
        custoEA: 5,
        custoPE: 3,
        alcance: 'Toque',
        alvo: 'Objeto importante ou parte do alvo com DNA',
        efeitoAdicional:
          'Revive acontecimentos de até 12 horas atrás que o alvo viveu naquele ambiente. Você ouve tudo que ele falou e vê o corpo dele e roupas; objetos, alterações no cenário e outras pessoas da reprise não aparecem.',
        ordem: 10,
      },
      {
        nome: 'Liberação Máxima',
        descricao:
          'Interage com a reprise e cria uma linha temporal falsa colidindo com a real.',
        substituiCustos: true,
        custoEA: 12,
        custoPE: 3,
        alcance: 'Toque',
        efeitoAdicional:
          'Como a superior, mas também permite ouvir o que o alvo ouviu e interagir com a reprise, podendo conversar ou agredir a versão reprise. A versão reprise mantém a categoria de atitude e é obrigada a responder algo, mesmo que minta.',
        ordem: 20,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_REMENDO_TEMPORAL',
    nome: 'Reversão de Técnica: Remendo Temporal',
    descricao:
      'Restaura parte ou todo o último dano sofrido por objeto ou ser.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Toque',
    alvo: 'Objeto ou ser',
    duracao: 'Instantâneo',
    custoEA: 4,
    custoPE: 2,
    efeito:
      'Restaura metade do último dano sofrido por um objeto ou ser, até 60 PV para objeto ou 30 PV para ser.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 2 }],
    },
    escalonamentoTipo: TipoEscalonamentoHabilidade.CURA,
    ordem: 80,
    variacoes: [
      {
        nome: 'Liberação Superior',
        descricao: 'Restaura integralmente o último dano com limites maiores.',
        substituiCustos: true,
        custoEA: 8,
        custoPE: 3,
        efeitoAdicional:
          'Restaura o último dano sofrido por um ser ou objeto, até 80 PV para objeto ou 50 PV para ser.',
        ordem: 10,
      },
      {
        nome: 'Liberação Máxima',
        descricao: 'Restaura integralmente o último dano com limites máximos.',
        substituiCustos: true,
        custoEA: 12,
        custoPE: 3,
        efeitoAdicional:
          'Restaura o último dano sofrido por um ser ou objeto, até 100 PV para objeto ou 70 PV para ser.',
        ordem: 20,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_FIXACAO_TEMPORAL',
    nome: 'Fixação Temporal',
    descricao:
      'Estabelece uma âncora temporal para retornar e recuperar dano sofrido.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Especial',
    custoEA: 3,
    custoPE: 2,
    efeito:
      'Estabelece um ponto de fixação no tempo. Role 1d3 para decidir em quantas rodadas será puxado de volta para essa âncora. Se tiver sofrido dano durante essas rodadas, recupera 3d8+5 PV.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_REVERSA', valorMinimo: 2 }],
    },
    danoFlat: 5,
    ordem: 90,
    variacoes: [
      {
        nome: 'Liberação Superior',
        descricao: 'Amplia o atraso da âncora e a recuperação.',
        substituiCustos: true,
        custoEA: 6,
        custoPE: 2,
        efeitoAdicional:
          'Aumenta o atraso para 2d3 rodadas e a cura para 5d8+5.',
        danoFlat: 5,
        ordem: 10,
      },
      {
        nome: 'Liberação Máxima',
        descricao: 'Permite ancorar outros seres voluntários.',
        substituiCustos: true,
        custoEA: 10,
        custoPE: 2,
        alvo: 'Até 3 seres voluntários',
        efeitoAdicional:
          'Como a superior, mas consegue ancorar até 3 seres voluntários.',
        danoFlat: 5,
        ordem: 20,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_ACUMULO_VELOCIDADE',
    nome: 'Acúmulo de Velocidade',
    descricao:
      'Converte deslocamento acelerado em impacto no momento do contato.',
    execucao: TipoExecucao.AO_ATACAR,
    alcance: 'Corpo a corpo',
    alvo: '1 ser',
    duracao: 'Enquanto sustentar Surto Temporal',
    custoEA: 6,
    custoPE: 2,
    efeito:
      'Requer Surto Temporal ativo. Ao declarar um ataque corpo a corpo, calcule quantos metros percorreu desde o início do seu turno. Você acumula Aceleração a cada 3m percorridos; cada curva feita reduz 1 acúmulo. Ao acertar, causa +1d6 de impacto por acúmulo de Aceleração.',
    requisitos: { requerSustentacao: 'INATA_SURTO_TEMPORAL_REVESTIMENTO' },
    escalonaPorGrau: true,
    grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
    escalonamentoTipo: TipoEscalonamentoHabilidade.DANO,
    escalonamentoDano: { quantidade: 1, dado: 'd6', tipo: 'IMPACTO' },
    ordem: 100,
    variacoes: [
      {
        nome: 'Projétil Acelerado',
        descricao:
          'Aplica a compressão temporal em projétil ou objeto disparado.',
        substituiCustos: true,
        custoEA: 12,
        custoPE: 2,
        alcance: 'Alcance do disparo',
        alvo: 'Projétil, bala ou objeto arremessado',
        efeitoAdicional:
          'A cada 3m que o projétil percorre até o alvo, acumula Aceleração. Ao acertar, descarrega +1d6 de impacto por acúmulo.',
        ordem: 10,
      },
    ],
  },
  {
    codigo: 'INATA_SURTO_MADE_IN_HEAVEN',
    nome: 'Técnica Máxima - Surto Temporal Made in Heaven',
    descricao: 'Força o corpo e a técnica a operar acima do limite corporal.',
    execucao: TipoExecucao.ACAO_COMPLETA,
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Sustentada',
    custoEA: 30,
    custoPE: 15,
    custoSustentacaoEA: 5,
    custoSustentacaoPE: 2,
    efeito:
      'Enquanto sustentada, recebe +2 em Agilidade, +10 em Percepção e em testes para reagir a algo a critério do mestre, +10 na Defesa e +5 em Luta. Recebe +1 ação completa adicional e +1 reação especial adicional por rodada. A partir da próxima rodada, age primeiro e ganha um Pré-Turno no início de cada rodada com 1 ação completa e 1 reação especial até o fim do pré-turno. Uma vez por rodada, quando for alvo de ataque, pode impor -1 dado no ataque. Não provoca reações por movimento e, uma vez por rodada, pode se mover até Curto como teleporte de frame, sem atravessar barreiras sólidas fechadas. Ao fim da sustentação, fica ALQUEBRADO e DEBILITADO até o fim da cena; ao fim da cena, fica FRACO até o próximo descanso confortável.',
    ordem: 110,
  },
  {
    codigo: 'INATA_SURTO_BLE_BLE_BLE',
    nome: 'Técnica ble ble ble',
    descricao: 'Apaga o intervalo temporal de um ataque em relação ao usuário.',
    execucao: TipoExecucao.REACAO,
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Instantânea',
    custoEA: 1,
    custoPE: 1,
    efeito:
      'Requer Surto Temporal ativo. Quando um inimigo declarar um ataque contra você, o ataque é efetuado normalmente. Independentemente do resultado, você pode apagar o intervalo do ataque em relação a você: o ataque não o afeta, não causa dano, não aplica condições e não ativa efeitos ao acertar. O ataque ainda existe para o ambiente e outros alvos, se houver.',
    requisitos: { requerSustentacao: 'INATA_SURTO_TEMPORAL_REVESTIMENTO' },
    ordem: 120,
  },
];

export const TRIBUNAL_JULGAMENTO_HABILIDADES = [
  {
    codigo: 'INATA_TRIBUNAL_JUDGE_GAVEL',
    nome: 'Judge Gavel',
    descricao:
      'Invoca um martelo de tribunal versátil que pode alterar sua forma base.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Pessoal',
    alvo: 'Você',
    duracao: 'Cena',
    custoEA: 1,
    testesExigidos: ['Luta com Jujutsu'],
    dadosDano: [{ quantidade: 1, dado: 'd6', tipo: 'IMPACTO' }],
    criticoMultiplicador: 2,
    efeito:
      'Invoca um martelo de tribunal em qualquer uma de suas mãos. Você tem proficiência com todas as formas, sujeito a penalidades de peso. Uma vez por rodada, se o martelo estiver invocado mas fora das suas mãos, pode gastar uma ação de movimento e 1 PE para fazê-lo retornar. Ao invocar, escolha uma forma: Martelo, Martelo de Batalha, Marreta, Cajado, Corrente ou Juízo Final. O peso é desconsiderado em Mudança Súbita.',
    ordem: 10,
    variacoes: [
      {
        nome: 'Martelo de Batalha',
        descricao: 'Forma de batalha do Judge Gavel.',
        substituiCustos: true,
        custoEA: 1,
        dadosDano: [{ quantidade: 2, dado: 'd4', tipo: 'IMPACTO' }],
        criticoMultiplicador: 2,
        efeitoAdicional: 'Forma de Força com espaço 1, causando 2d4 de impacto.',
        ordem: 10,
      },
      {
        nome: 'Marreta',
        descricao: 'Forma pesada do Judge Gavel.',
        substituiCustos: true,
        custoEA: 2,
        dadosDano: [{ quantidade: 3, dado: 'd6', tipo: 'IMPACTO' }],
        criticoMultiplicador: 2,
        efeitoAdicional: 'Forma de Força com espaço 2, causando 3d6 de impacto.',
        ordem: 20,
      },
      {
        nome: 'Cajado',
        descricao: 'Forma ágil e versátil do Judge Gavel.',
        substituiCustos: true,
        custoEA: 1,
        dadosDano: [{ quantidade: 1, dado: 'd8', tipo: 'IMPACTO' }],
        criticoMultiplicador: 2,
        efeitoAdicional:
          'Forma de arma ágil com espaço 2, causando 1d6/1d8 de impacto conforme empunhadura.',
        ordem: 30,
      },
      {
        nome: 'Corrente',
        descricao: 'Forma corrente do Judge Gavel.',
        substituiCustos: true,
        custoEA: 1,
        alcance: 'Corpo a corpo, alcance 3m',
        dadosDano: [{ quantidade: 1, dado: 'd6', tipo: 'IMPACTO' }],
        criticoMultiplicador: 2,
        efeitoAdicional: 'Forma de arma ágil com espaço 1 e alcance 3m.',
        ordem: 40,
      },
      {
        nome: 'Juízo Final',
        descricao: 'Forma colossal e sustentada do Judge Gavel.',
        substituiCustos: true,
        custoEA: 4,
        custoPE: 1,
        custoSustentacaoEA: 1,
        duracao: 'Sustentado',
        dadosDano: [{ quantidade: 4, dado: 'd8', tipo: 'IMPACTO' }],
        danoFlat: 5,
        danoFlatTipo: TipoDano.IMPACTO,
        criticoMultiplicador: 3,
        efeitoAdicional:
          'Forma de Força com espaço 3, causando 4d8+5 de impacto, crítico x3.',
        ordem: 50,
      },
      {
        nome: 'Mil Provas | Balanço da Justiça',
        descricao: 'Ataque extra com o martelo contra o mesmo alvo.',
        custoEA: 1,
        custoPE: 1,
        execucao: TipoExecucao.AO_ATACAR,
        efeitoAdicional:
          'Caso acerte uma ação de ataque com o Martelo, pode fazer um ataque extra no mesmo alvo gastando ação de movimento.',
        ordem: 60,
      },
      {
        nome: 'Mudança Súbita',
        descricao: 'Muda a forma da arma durante um ataque.',
        custoPE: 1,
        execucao: TipoExecucao.AO_ATACAR,
        resistencia: 'Percepção evita Desprevenido',
        dtResistencia: 'DT do ataque + 5',
        efeitoAdicional:
          'Durante uma ação de ataque, muda a forma da arma pagando o custo da variação escolhida + 1 PE. Se o alvo falhar em Percepção, fica DESPREVENIDO para este ataque ou ação. Não conta para Juízo Final.',
        ordem: 70,
      },
      {
        nome: 'Rédea Jurídica',
        descricao: 'Usa a corrente para reforçar manobras de agarrar.',
        custoEA: 1,
        execucao: TipoExecucao.AO_ATACAR,
        requisitos: { formaAtiva: 'Corrente' },
        efeitoAdicional:
          'Precisa portar a Corrente. Recebe +5 na manobra de combate para agarrar. Acumula conforme o grau de aprimoramento de Técnica Amaldiçoada.',
        escalonaPorGrau: true,
        escalonamentoCustoEA: 1,
        escalonamentoTipo: TipoEscalonamentoHabilidade.NUMERICO,
        escalonamentoEfeito: { label: 'Agarrar', incremento: 5 },
        ordem: 80,
      },
      {
        nome: 'Máxima: Sentença',
        descricao:
          'Executa uma sentença esmagadora com o Juízo Final durante um ataque.',
        custoEA: 2,
        custoPE: 1,
        execucao: TipoExecucao.AO_ATACAR,
        resistencia: 'Fortitude reduz condição',
        dtResistencia: 'DT do ataque + 5',
        efeitoAdicional:
          'Se estiver portando o Juízo Final, paga apenas o custo extra e sustentação do ritual; se não, muda a forma para Juízo Final até o fim do turno. Recebe +10 no teste de ataque e +10 no dano. Se acertar, o alvo faz Fortitude: falha deixa DEBILITADO; sucesso deixa FRACO por 2d2 turnos.',
        ordem: 90,
      },
    ],
  },
  {
    codigo: 'INATA_TRIBUNAL_PROMOTOR_JUSTICA_CEGA',
    nome: 'Promotor da Justiça Cega',
    descricao:
      'Invoca um Mini Judgeman para executar técnicas judiciais imparciais.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Curto',
    alvo: 'Pessoal',
    duracao: 'Cena',
    custoEA: 1,
    efeito:
      'Invoca um Mini Judgeman para executar técnicas que dependem do poder e da imparcialidade dele. Exige grau 1 em Técnica de Shikigami e uso de um amuleto.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_SHIKIGAMI', valorMinimo: 1 }],
      item: 'Amuleto',
    },
    ordem: 20,
  },
  {
    codigo: 'INATA_TRIBUNAL_SEGREDO_JUSTICA',
    nome: 'Segredo de Justiça',
    descricao: 'Cria uma cortina reforçada para ocultar um incidente.',
    execucao: TipoExecucao.ACAO_PADRAO,
    area: AreaEfeito.ESFERA,
    alcance: 'Até 60m de raio',
    alvo: 'Área escolhida',
    duracao: 'Cena',
    custoEA: 1,
    efeito:
      'Cria uma Cortina com até 60m de raio, ocultando um incidente de escolha do usuário. O Judgeman oculta tudo que ocorre dentro da cortina para seres fora dela. Pode gastar EA para adicionar regras: +2 EA expulsa não-feiticeiros, +2 EA altera/remove memórias recentes (Vontade DT 30 anula), +1 EA adiciona +30m no raio.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 1 }],
      requerHabilidade: 'INATA_TRIBUNAL_PROMOTOR_JUSTICA_CEGA',
    },
    ordem: 30,
  },
  {
    codigo: 'INATA_TRIBUNAL_ARQUIVO_PROVAS',
    nome: 'Arquivo de Provas',
    descricao:
      'Emite um pulso amaldiçoado a partir do Judgeman para apoiar investigação.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Área do Judgeman ou da cortina',
    alvo: 'Usuário ou pessoas na cortina',
    duracao: 'Cena de investigação',
    custoEA: 1,
    efeito:
      'Cria um projeto de barreira sem existência física a partir do Judgeman. Durante investigação, se convencer o Judgeman de que a investigação é necessária, ele quebra a imparcialidade e concede +5 em um teste de Investigação. Acumula conforme grau de Técnica Amaldiçoada. Se Segredo de Justiça estiver ativo, pode gastar 2 EA por pessoa para conceder o bônus dentro da cortina.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 2 }],
      requerHabilidade: 'INATA_TRIBUNAL_PROMOTOR_JUSTICA_CEGA',
    },
    escalonaPorGrau: true,
    grauTipoGrauCodigo: 'TECNICA_AMALDICOADA',
    escalonamentoCustoEA: 1,
    escalonamentoTipo: TipoEscalonamentoHabilidade.NUMERICO,
    escalonamentoEfeito: { label: 'Investigação', incremento: 5 },
    ordem: 40,
  },
  {
    codigo: 'INATA_TRIBUNAL_ZONA_PERJURIO',
    nome: 'Zona de Perjúrio',
    descricao: 'Cria uma barreira restritiva de depoimento mediado pelo Judgeman.',
    execucao: TipoExecucao.ACAO_PADRAO,
    area: AreaEfeito.ESFERA,
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Até o fim das acusações',
    resistencia: 'Vontade com Intelecto reduz efeitos',
    custoEA: 4,
    efeito:
      'Cria uma barreira restritiva contra um ser. Dentro dela há pacto de não-agressão e o usuário pode forçar até 3 acusações, uma por turno; se o alvo passar na Vontade, reduz para 1 acusação. O alvo responde obrigatoriamente e ambos tentam convencer o Judgeman com Diplomacia, Enganação ou perícias cabíveis. Propina: usuário pode pagar 1 EA para +5 no teste; alvo pode pagar 2 EA para o mesmo, acumulável até o limite de PE. Acusações bem-sucedidas geram dano, perda de energia/dados e precedentes Inconclusivo, Circunstancial ou Sólido.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 2 }],
      requerHabilidade: 'INATA_TRIBUNAL_PROMOTOR_JUSTICA_CEGA',
    },
    ordem: 50,
  },
  {
    codigo: 'INATA_TRIBUNAL_ACORDO_INFINDO',
    nome: 'Acordo Infindo',
    descricao:
      'Usa a mediação do Judgeman para criar um contrato amaldiçoado.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Curto',
    alvo: 'Um ou mais alvos de escolha',
    duracao: 'Conforme contrato',
    custoEA: 2,
    efeito:
      'Cria um Contrato Amaldiçoado seguindo regras de Voto Vinculativo. Todos os alvos e o usuário devem confirmar o acordo. Se alguma parte descumprir o estipulado, o Judgeman executa punição Leve, Normal ou Severa: dano amaldiçoado, Lento, Ancorado, confisco temporário, Algemado ou Fraco, podendo gerar precedentes.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 }],
      requerHabilidade: 'INATA_TRIBUNAL_PROMOTOR_JUSTICA_CEGA',
    },
    ordem: 60,
  },
  {
    codigo: 'INATA_TRIBUNAL_PROCESSO_PRE_MORTE',
    nome: 'Processo Pré-Morte',
    descricao:
      'Oferece acordos antes de um domínio para evitar possível condenação.',
    execucao: TipoExecucao.ACAO_PADRAO,
    alcance: 'Curto',
    alvo: '1 alvo com mais de 3 evidências',
    duracao: 'Antes da expansão de domínio',
    custoEA: 4,
    efeito:
      'Só pode ser usada caso um alvo possua mais de 3 evidências contra ele. Por 4 EA + 1 EA por ativação antes de um domínio, oferece até 3 acordos para evitar possível condenação: entrega com energia restrita por 24h, entrega de informação verdadeira, ou acatar uma ordem especificada. Se recusar os 3 acordos, recebe +1 Precedente Sólido garantido contra ele.',
    requisitos: {
      graus: [{ tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 }],
      evidenciasMinimas: 4,
    },
    ordem: 70,
  },
  {
    codigo: 'INATA_TRIBUNAL_EXPANSAO_SENTENCA_SUICIDIO',
    nome: 'Expansão de Domínio: Sentença de Suicídio Forçada',
    descricao:
      'Expande um domínio judicial em que uma acusação é julgada pelo Judgeman.',
    execucao: TipoExecucao.ACAO_COMPLETA,
    alcance: 'Curto',
    alvo: '1 ser',
    duracao: 'Cena',
    resistencia: 'Especial',
    custoEA: 8,
    custoPE: 2,
    custoSustentacaoEA: 1,
    efeito:
      'Escolhe um alvo para julgamento e remove todos os outros seres da área. Dentro da Sentença da Morte, não é possível realizar ações ofensivas e todos recebem imunidade a dano e efeitos, exceto bônus e penalidades, até a sentença. O crime julgado é Irrelevante, Comum ou Hediondo por d6, e uma prova Inconclusiva, Circunstancial ou Sólida é entregue ao usuário. O alvo escolhe Confessar, Ficar em Silêncio ou Negar. Usuário e alvo defendem seus lados com Diplomacia, Enganação ou perícias cabíveis, usando evidências armazenadas. Se o alvo for inocente, não sofre efeitos. Se culpado, recebe Restringir; a critério da narradora, pode sofrer Confiscar. Crime comum pode Confiscar energia/técnica/item; crime hediondo concede Pena de Morte, Confiscar e a Espada do Executor ao usuário. A Espada causa 12d12+12 de dano amaldiçoado, e esse dano não pode ser curado até o fim da cena.',
    requisitos: {
      graus: [
        { tipoGrauCodigo: 'TECNICA_BARREIRA', valorMinimo: 2 },
        { tipoGrauCodigo: 'TECNICA_AMALDICOADA', valorMinimo: 2 },
      ],
    },
    dadosDano: [
      { quantidade: 12, dado: 'd12', tipo: 'ENERGIA_AMALDICOADA' },
    ],
    danoFlat: 12,
    danoFlatTipo: TipoDano.ENERGIA_AMALDICOADA,
    ordem: 80,
  },
];
