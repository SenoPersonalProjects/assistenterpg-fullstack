// prisma/seeds/catalogos/equipamentos-utilitarios.ts

import type { PrismaClient } from '@prisma/client';
import {
  TipoEquipamento,
  TipoAcessorio,
  TipoExplosivo,
  TipoAmaldicoado,
  TipoArma,
  ProficienciaArma,
  EmpunhaduraArma,
  AlcanceArma,
  TipoUsoEquipamento,
  CategoriaEquipamento,
  TipoFonte, // ✅ NOVO
} from '@prisma/client';

// ========================================
// ✅ TIPOS AUXILIARES PARA SEED
// ========================================

interface EquipamentoAcessorioSeed {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoAcessorio: TipoAcessorio;
  periciaBonificada?: string;
  bonusPericia?: number;
  requereEmpunhar?: boolean;
  efeito?: string;
  maxVestimentas?: number;
  tipoUso?: TipoUsoEquipamento;
}

interface EquipamentoExplosivoSeed {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoExplosivo: TipoExplosivo;
  efeito: string;
  tipoUso?: TipoUsoEquipamento;
}

interface EquipamentoOperacionalSeed {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  periciaBonificada?: string;
  bonusPericia?: number;
  efeito?: string;
  tipoUso?: TipoUsoEquipamento;
  tipoArma?: TipoArma;
  proficienciaArma?: ProficienciaArma;
  empunhaduras?: EmpunhaduraArma[];
  alcance?: AlcanceArma;
  agil?: boolean;
}

interface EquipamentoAmaldicoadoSeed {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoEquipamento;
  categoria: CategoriaEquipamento;
  espacos: number;
  tipoAmaldicoado: TipoAmaldicoado;
  tipoUso: TipoUsoEquipamento;
  efeito: string;
}

// ========================================
// ✅ CATÁLOGO DE ACESSÓRIOS - SEEDS
// ========================================

export const acessoriosSeed: EquipamentoAcessorioSeed[] = [
  // Kits de Perícia
  {
    codigo: 'KIT_ARROMBAMENTO',
    nome: 'Kit de Arrombamento',
    descricao: 'Conjunto de ferramentas para arrombar fechaduras e portas. Sem este kit, você sofre –5 no teste.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.KIT_PERICIA,
    efeito: 'Elimina penalidade de –5 em testes de Furto para arrombar',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'KIT_INVESTIGACAO',
    nome: 'Kit de Investigação',
    descricao: 'Conjunto de ferramentas para investigação de cenas de crime. Sem este kit, você sofre –5 no teste.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.KIT_PERICIA,
    efeito: 'Elimina penalidade de –5 em testes de Investigação em cenas de crime',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'KIT_MEDICINA',
    nome: 'Kit de Medicina',
    descricao:
      'Conjunto de instrumentos e suprimentos para primeiros socorros, diagnósticos e procedimentos médicos. Sem este kit, você sofre –5 no teste quando ferramentas adequadas forem necessárias.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.KIT_PERICIA,
    periciaBonificada: 'Medicina',
    efeito: 'Elimina penalidade de –5 em testes de Medicina quando ferramentas adequadas forem necessárias',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'KIT_ENGANACAO',
    nome: 'Kit de Enganação',
    descricao:
      'Conjunto de disfarces, documentos falsos simples e apetrechos para blefes e encenações. Sem este kit, você sofre –5 no teste quando ferramentas adequadas forem necessárias.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.KIT_PERICIA,
    periciaBonificada: 'Enganação',
    efeito: 'Elimina penalidade de –5 em testes de Enganação quando ferramentas adequadas forem necessárias',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'KIT_PERICIA_PERSONALIZADO',
    nome: 'Kit de Perícia Personalizado',
    descricao:
      'Um conjunto de ferramentas preparado para uma perícia escolhida pelo usuário. Configure a perícia no inventário; sem um kit adequado, o personagem sofre –5 no teste quando ferramentas forem necessárias.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.KIT_PERICIA,
    efeito:
      'Elimina penalidade de –5 em testes da perícia escolhida quando ferramentas adequadas forem necessárias',
    tipoUso: TipoUsoEquipamento.GERAL,
  },

  // Utensílios
  {
    codigo: 'UTENSILIO_CANIVETE',
    nome: 'Canivete',
    descricao: 'Um canivete suíço versátil. Fornece +2 em perícias como Furto ou Sobrevivência.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    periciaBonificada: 'Furto ou Sobrevivência',
    bonusPericia: 2,
    requereEmpunhar: true,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'UTENSILIO_LUPA',
    nome: 'Lupa',
    descricao: 'Uma lupa de precisão. Fornece +2 em testes de Investigação para examinar detalhes.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    periciaBonificada: 'Investigação',
    bonusPericia: 2,
    requereEmpunhar: true,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'UTENSILIO_SMARTPHONE',
    nome: 'Smartphone',
    descricao: 'Um smartphone moderno com acesso à internet. Fornece +2 em testes de Ciências.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    periciaBonificada: 'Ciências',
    bonusPericia: 2,
    requereEmpunhar: true,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'UTENSILIO_NOTEBOOK',
    nome: 'Notebook',
    descricao: 'Um notebook de alta performance. Fornece +2 em testes de Tecnologia.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    periciaBonificada: 'Tecnologia',
    bonusPericia: 2,
    requereEmpunhar: true,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'UTENSILIO_DETECTOR_MENTIRAS',
    nome: 'Detector de Mentiras Portátil',
    descricao: 'Um dispositivo portátil que ajuda a detectar sinais de mentira. Fornece +2 em Intuição.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    periciaBonificada: 'Intuição',
    bonusPericia: 2,
    requereEmpunhar: true,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'UTENSILIO_PERSONALIZADO',
    nome: 'Utensílio Personalizado',
    descricao:
      'Um utensílio adaptado à especialidade do usuário. Escolha uma perícia elegível para receber +2 quando este item for configurado no inventário.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.UTENSILIO,
    bonusPericia: 2,
    requereEmpunhar: true,
    tipoUso: TipoUsoEquipamento.GERAL,
  },

  // Vestimentas
  {
    codigo: 'VESTIMENTA_BOTAS_MILITARES',
    nome: 'Botas Militares',
    descricao: 'Um par de botas militares resistentes. Fornece +2 em testes de Atletismo.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    periciaBonificada: 'Atletismo',
    bonusPericia: 2,
    efeito: 'Pode usar até 2 vestimentas ao mesmo tempo',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'VESTIMENTA_TERNO_ELEGANTE',
    nome: 'Terno Elegante',
    descricao: 'Um terno ou vestido formalmente elegante. Fornece +2 em testes de Diplomacia.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    periciaBonificada: 'Diplomacia',
    bonusPericia: 2,
    efeito: 'Pode usar até 2 vestimentas ao mesmo tempo',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'VESTIMENTA_PERSONALIZADA',
    nome: 'Vestimenta Personalizada',
    descricao:
      'Uma vestimenta ajustada para reforçar uma especialidade específica. Escolha uma perícia elegível para receber +2 quando este item for configurado no inventário.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    bonusPericia: 2,
    efeito: 'Pode usar até 2 vestimentas ao mesmo tempo',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
  {
    codigo: 'VESTIMENTA_MANTO_GLIFOS',
    nome: 'Manto com Glifos',
    descricao: 'Um manto com glifos esotéricos costurados. Fornece +2 em testes de Ocultismo.',
    tipo: TipoEquipamento.ACESSORIO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    tipoAcessorio: TipoAcessorio.VESTIMENTA,
    periciaBonificada: 'Ocultismo',
    bonusPericia: 2,
    efeito: 'Pode usar até 2 vestimentas ao mesmo tempo',
    tipoUso: TipoUsoEquipamento.VESTIVEL,
  },
];

// ========================================
// ✅ CATÁLOGO DE EXPLOSIVOS - SEEDS
// ========================================

export const explosivosSeed: EquipamentoExplosivoSeed[] = [
  // Granadas
  {
    codigo: 'GRANADA_ATORDOAMENTO',
    nome: 'Granada de Atordoamento (Flash-Bang)',
    descricao: 'Cria um estouro barulhento e luminoso. Seres na área ficam atordoados por 1 rodada (Fortitude DT Agi reduz para ofuscado e surdo por uma rodada). Raio de efeito: 6m.',
    tipo: TipoEquipamento.EXPLOSIVO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_ATORDOAMENTO,
    efeito: 'Atordoar inimigos em raio de 6m',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'GRANADA_FRAGMENTACAO',
    nome: 'Granada de Fragmentação',
    descricao: 'Espalha fragmentos perfurantes. Seres na área sofrem 8d6 pontos de dano de perfuração (Reflexos DT Agi reduz à metade). Raio de efeito: 6m.',
    tipo: TipoEquipamento.EXPLOSIVO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_FRAGMENTACAO,
    efeito: 'Causa 8d6 dano de perfuração em raio de 6m',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'GRANADA_FUMACA',
    nome: 'Granada de Fumaça',
    descricao: 'Produz uma fumaça espessa e escura. Seres na área ficam cegos e sob camuflagem total. A fumaça dura 2 rodadas. Raio de efeito: 6m.',
    tipo: TipoEquipamento.EXPLOSIVO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_FUMACA,
    efeito: 'Gera fumaça em raio de 6m (dura 2 rodadas)',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'GRANADA_INCENDIARIA',
    nome: 'Granada Incendiária',
    descricao: 'Espalha labaredas incandescentes. Seres na área sofrem 6d6 pontos de dano de fogo e ficam em chamas (Reflexos DT Agi reduz o dano à metade e evita a condição em chamas). Raio de efeito: 6m.',
    tipo: TipoEquipamento.EXPLOSIVO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoExplosivo: TipoExplosivo.GRANADA_INCENDIARIA,
    efeito: 'Causa 6d6 dano de fogo em raio de 6m',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },

  // Mina Antipessoal
  {
    codigo: 'MINA_ANTIPESSOAL',
    nome: 'Mina Antipessoal',
    descricao: 'Mina ativada por controle remoto. Dispara centenas de bolas de aço em um cone de 6m, causando 12d6 pontos de dano de perfuração em todos os seres na área (Reflexos DT Int reduz à metade). Instalação requer ação completa e teste de Tática contra DT 15.',
    tipo: TipoEquipamento.EXPLOSIVO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    tipoExplosivo: TipoExplosivo.MINA_ANTIPESSOAL,
    efeito: 'Causa 12d6 dano de perfuração em cone de 6m',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
];

// ========================================
// ✅ CATÁLOGO DE ITENS OPERACIONAIS - SEEDS
// ========================================

export const itensOperacionaisSeed: EquipamentoOperacionalSeed[] = [
  {
    codigo: 'ALGEMAS',
    nome: 'Algemas de Aço',
    descricao: 'Um par de algemas de aço. Prender exige teste de Agarrar. Impede conjuração (ambos os pulsos) ou movimento (um pulso em objeto imóvel). Escapar requer Acrobacia DT 30.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'ARPEU',
    nome: 'Arpéu',
    descricao: 'Um gancho de aço com corda. Prender requer teste de Pontaria (DT 15). Fornece +5 em Atletismo para escalar com corda.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    periciaBonificada: 'Atletismo',
    bonusPericia: 5,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'BANDOLEIRA',
    nome: 'Bandoleira',
    descricao: 'Um cinto com bolsos e alças. Uma vez por rodada, sacar ou guardar um item como ação livre.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 0,
    efeito: 'Sacar/guardar itens como ação livre 1x por rodada',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'BINOCULOS',
    nome: 'Binóculos Militares',
    descricao: 'Binóculos de alta qualidade. Fornece +5 em testes de Percepção para observar coisas distantes.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    periciaBonificada: 'Percepção',
    bonusPericia: 5,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'BLOQUEADOR_SINAL',
    nome: 'Bloqueador de Sinal',
    descricao: 'Dispositivo compacto que emite ondas para "poluir" frequências de rádio. Impede conexão de celulares em alcance médio.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito: 'Bloqueia sinais de celular em alcance médio',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'CICATRIZANTE',
    nome: 'Cicatrizante (Spray)',
    descricao: 'Spray com remédio cicatrizante potente. Ação padrão para curar 2d8+2 PV em você ou em um ser adjacente. Dura dois usos.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito: 'Cura 2d8+2 PV (2 usos)',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'CORDA',
    nome: 'Corda',
    descricao: 'Um rolo com 10 metros de corda resistente. Fornece +5 em testes de Atletismo para descer ou subir. Útil para amarrar pessoas inconscientes.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    periciaBonificada: 'Atletismo',
    bonusPericia: 5,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'EQUIPAMENTO_SOBREVIVENCIA',
    nome: 'Equipamento de Sobrevivência',
    descricao: 'Mochila com saco de dormir, panelas, GPS e itens úteis. Fornece +5 em Sobrevivência para acampar e orientar-se. Permite fazer esses testes sem treinamento.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 3,
    periciaBonificada: 'Sobrevivência',
    bonusPericia: 5,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'LANTERNA_TATICA',
    nome: 'Lanterna Tática',
    descricao: 'Ilumina um cone de 9m. Ação de movimento para mirar nos olhos de um ser em alcance curto (ofuscado por 1 rodada, imune depois).',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito: 'Ilumina cone 9m, ofusca inimigos',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'MASCARA_GAS',
    nome: 'Máscara de Gás',
    descricao: 'Máscara com filtro que cobre o rosto inteiro. Fornece +10 em testes de Fortitude contra efeitos que dependam de respiração.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito: 'Fornece +10 em Fortitude contra efeitos de respiração',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'MOCHILA_MILITAR',
    nome: 'Mochila Militar',
    descricao: 'Mochila leve de alta qualidade. Não usa nenhum espaço e aumenta sua capacidade de carga em 2 espaços.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 0,
    efeito: 'Aumenta capacidade de carga em 2 espaços',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'OCULOS_VISAO_TERMICA',
    nome: 'Óculos de Visão Térmica',
    descricao: 'Óculos que eliminam a penalidade em testes por camuflagem.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    efeito: 'Elimina penalidade de camuflagem',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'PE_CABRA',
    nome: 'Pé de Cabra',
    descricao: 'Barra de ferro que fornece +5 em testes de Força para arrombar portas. Pode ser usada em combate como um bastão.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    periciaBonificada: 'Força',
    bonusPericia: 5,
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'PISTOLA_DARDOS',
    nome: 'Pistola de Dardos',
    descricao: 'Dispara dardos com sonífero em alcance curto. Acerto deixa inconsciente até fim da cena (Fortitude DT Agi reduz para desprevenido e lento por uma rodada). Vem com 2 dardos.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito: 'Deixa inconsciente ou desprevenido',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'PISTOLA_SINALIZADORA',
    nome: 'Pistola Sinalizadora',
    descricao: 'Dispara sinalizador luminoso para chamar outras pessoas. Pode ser usada como arma de disparo leve que causa 2d6 dano de fogo. Vem com 2 cargas.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito: 'Disparo Leve (2d6 fogo)',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'SOQUEIRA',
    nome: 'Soqueira',
    descricao: 'Peça de metal para usar entre os dedos. Fornece +1 em rolagens de dano desarmado e torna-os letal. Pode receber modificações de armas corpo a corpo.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoArma: TipoArma.CORPO_A_CORPO,
    proficienciaArma: ProficienciaArma.SIMPLES,
    empunhaduras: [EmpunhaduraArma.LEVE],
    alcance: AlcanceArma.ADJACENTE,
    agil: true,
    efeito: 'Desarmado +1 dano (letal)',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'SPRAY_PIMENTA',
    nome: 'Spray de Pimenta',
    descricao: 'Composto químico que causa dor e lacrimação. Ação padrão em ser adjacente deixa cego por 1d4 rodadas (Fortitude DT Agi evita). Dura dois usos.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito: 'Cega por 1d4 rodadas (2 usos)',
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
  },
  {
    codigo: 'TASER',
    nome: 'Taser',
    descricao: 'Dispositivo de eletrochoque. Ação padrão em ser adjacente causa 1d6 dano de eletricidade e atordoa por uma rodada (Fortitude DT Agi evita). Bateria dura dois usos.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    efeito: 'Causa 1d6 dano elétrico e atordoa (2 usos)',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
  {
    codigo: 'TRAJE_HAZMAT',
    nome: 'Traje Hazmat',
    descricao: 'Roupa impermeável que cobre o corpo inteiro para proteger contra materiais tóxicos. Fornece +5 em testes de resistência contra efeitos ambientais e resistência a dano químico 10.',
    tipo: TipoEquipamento.ITEM_OPERACIONAL,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 2,
    efeito: 'Resistência química 10, +5 contra efeitos ambientais',
    tipoUso: TipoUsoEquipamento.GERAL,
  },
];

// ========================================
// ✅ CATÁLOGO DE ITENS AMALDIÇOADOS - SEEDS
// ========================================

export const itensAmaldicoadosSeed: EquipamentoAmaldicoadoSeed[] = [
  {
    codigo: 'ANATEMA_AMALDICOADA',
    nome: 'Anátema Amaldiçoada',
    descricao:
      'Corrente banhada em maldições, concede: teste de Agarrar + 2 EA para ativar = RD 10 contra qualquer ataque daquela maldição (teste de Luta da maldição DT de Encantamento para resistir).',
    tipo: TipoEquipamento.ITEM_AMALDICOADO,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.GERAL,
    efeito: 'RD 10 contra maldições específicas após agarrá-las',
  },
  {
    codigo: 'ANCORA_BARREIRA',
    nome: 'Âncora de Barreira',
    descricao:
      'Prego com talismãs de selos. Pode gerar uma barreira com regras definidas. Custo mínimo: 2 EA. Quanto mais fácil encontrar a fonte, mais forte a barreira (aumenta DT para quebrar).',
    tipo: TipoEquipamento.ITEM_AMALDICOADO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.GERAL,
    efeito: 'Cria barreiras customizadas (custo 2+ EA)',
  },
  {
    codigo: 'GUIA_MALDICOES',
    nome: 'Guia de Maldições',
    descricao:
      'Livro com informações sobre maldições catalogadas. Ação completa + 2 PE = teste de Investigação (DT 10 + 5 por Grau da Maldição) para obter dica sobre a maldição.',
    tipo: TipoEquipamento.ITEM_AMALDICOADO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.GERAL,
    efeito: 'Fornece dicas sobre maldições em combate',
  },
  {
    codigo: 'CORRENTE_MIL_MILHAS',
    nome: 'Corrente de Mil Milhas',
    descricao:
      'Corrente de 4 metros visualmente comum. Ação de movimento + 1 PE para adicionar 20m de alcance (por PE gasto). Pode aumentar alcance de outras armas corpo a corpo.',
    tipo: TipoEquipamento.ITEM_AMALDICOADO,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.GERAL,
    efeito: 'Aumenta alcance de armas corpo a corpo (1 PE = +20m)',
  },
  {
    codigo: 'MAPA_ASSOMBRADO',
    nome: 'Mapa Assombrado',
    descricao:
      'Pergaminho raro com selos de encantamento. 1 PE: revela maldições em raio de 36m. + 2 EA + teste de Jujutsu (DT 25): defini o grau da maldição.',
    tipo: TipoEquipamento.ITEM_AMALDICOADO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.GERAL,
    efeito: 'Detecta maldições em raio de 36m',
  },
  {
    codigo: 'VENDA_OCULTACAO',
    nome: 'Venda de Ocultação',
    descricao:
      'Venda preta que não interfere na visão. Suprime sua presença para quem não vê você diretamente. +1d20 e +5 em Furtividade fora do campo de visão.',
    tipo: TipoEquipamento.ITEM_AMALDICOADO,
    categoria: CategoriaEquipamento.CATEGORIA_3,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    efeito: '+1d20 e +5 em Furtividade quando oculto',
  },
  {
    codigo: 'OCULOS_VISAO_AMALDICOADA',
    nome: 'Óculos de Visão Amaldiçoada',
    descricao:
      'Permite que pessoas com baixa afinidade à energia amaldiçoada enxerguem técnicas e maldições dentro do campo da lente.',
    tipo: TipoEquipamento.ITEM_AMALDICOADO,
    categoria: CategoriaEquipamento.CATEGORIA_4,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.VESTIVEL,
    efeito: 'Enxergar técnicas e maldições',
  },
  {
    codigo: 'ORBE_NEGATIVIDADE',
    nome: 'Orbe de Negatividade',
    descricao:
      'Emoções negativas condensadas em um pequeno orbe (pesado). Ao consumir: recupera 2 + 1d4 pontos de energia amaldiçoada.',
    tipo: TipoEquipamento.ITEM_AMALDICOADO,
    categoria: CategoriaEquipamento.CATEGORIA_0,
    espacos: 1,
    tipoAmaldicoado: TipoAmaldicoado.ITEM,
    tipoUso: TipoUsoEquipamento.CONSUMIVEL,
    efeito: 'Recupera 2 + 1d4 EA ao consumir',
  },
];

// ========================================
// ✅ FUNÇÃO SEED - UTILITÁRIOS
// ========================================

export async function seedEquipamentosUtilitarios(prisma: PrismaClient) {
  console.log('📌 Cadastrando equipamentos utilitários...');

  // 1️⃣ Acessórios
  console.log('  → Cadastrando acessórios...');
  for (const data of acessoriosSeed) {
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: {
        ...data,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        ...data,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  console.log(`  ✓ ${acessoriosSeed.length} acessórios cadastrados`);

  // 2️⃣ Explosivos
  console.log('  → Cadastrando explosivos...');
  for (const data of explosivosSeed) {
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: {
        ...data,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        ...data,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  console.log(`  ✓ ${explosivosSeed.length} explosivos cadastrados`);

  // 3️⃣ Itens Operacionais
  console.log('  → Cadastrando itens operacionais...');
  for (const data of itensOperacionaisSeed) {
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: {
        ...data,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        ...data,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  console.log(`  ✓ ${itensOperacionaisSeed.length} itens operacionais cadastrados`);

  // 4️⃣ Itens Amaldiçoados
  console.log('  → Cadastrando itens amaldiçoados...');
  for (const data of itensAmaldicoadosSeed) {
    await prisma.equipamentoCatalogo.upsert({
      where: { codigo: data.codigo },
      update: {
        ...data,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
      create: {
        ...data,
        fonte: TipoFonte.SISTEMA_BASE,
        suplementoId: null,
      },
    });
  }
  console.log(`  ✓ ${itensAmaldicoadosSeed.length} itens amaldiçoados cadastrados`);

  console.log('✅ Equipamentos utilitários cadastrados com sucesso!\n');
}
