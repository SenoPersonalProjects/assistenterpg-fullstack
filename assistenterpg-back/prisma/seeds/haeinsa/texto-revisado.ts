/** Correções expressas do mestre; os arquivos originais permanecem intactos. */
export function revisarTextoDezSombras(original: string): string {
  let texto = original.replace(/\r\n/g, '\n');
  function trocar(antes: string, depois: string) {
    if (!texto.includes(antes))
      throw new Error(
        `Trecho da fonte Dez Sombras não encontrado: ${antes.slice(0, 80)}`,
      );
    texto = texto.replace(antes, depois);
  }
  trocar(
    'Um Shikigami liberado dessa forma não é considerado destruído e pode ser invocado novamente normalmente.',
    'Um Shikigami liberado voluntariamente não é destruído. Salve seus PV atuais e condições persistentes: reinvocar na mesma cena ou antes de descansar não cura. Condições temporárias continuam contando mesmo desmanifestado. Ao realizar Dormir em um Interlúdio, Shikigamis não destruídos recuperam todos os PV e limpam condições temporárias. Destruição verdadeira continua permanente.',
  );
  trocar(
    'Seu poder residual pode ser herdado por outro Shikigami compatível.',
    'Seu poder residual fica registrado como herança e só pode ser transferido por uma compatibilidade explícita do catálogo. Sem compatibilidade cadastrada, permanece pendente de definição do mestre. Cão Divino → Cão Divino: Totalidade é uma relação cadastrada; não há combinação livre automática.',
  );
  trocar('- Caçada Implacável\n', '');
  trocar(
    'Passivas, Ressuscitação, Ritual de Exorcismo e a adaptação de Mahoraga não podem ser escolhidos como Aspecto, salvo decisão específica do mestre.',
    'Passivas, Ressuscitação, Ritual de Exorcismo e adaptação de Mahoraga não são Aspectos Extraíveis. Caçada Implacável não é extraível. Ataques e manobras de um Aspecto usam Jujutsu do usuário, mantendo efeito, dano, alcance, ação e DTs fixas da habilidade original.',
  );
  trocar(
    '> 2d8 Veneno por rodada.\n\n**Fortitude DT 30** encerra o efeito.',
    'Ao usar Injetar Veneno, o alvo faz Fortitude DT 30 imediatamente: sucesso impede o veneno. Em falha, no início de cada turno do alvo sofre 2d8 Veneno; no fim desse turno repete Fortitude DT 30 e, em sucesso, encerra.',
  );
  trocar(
    '**Fortitude DT 25** reduz o dano elétrico à metade e evita a condição Vulnerável.',
    '**Fortitude DT 25** reduz o dano elétrico à metade e evita Vulnerável. Em falha, Vulnerável dura até o fim do próximo turno do alvo.',
  );
  trocar(
    '**Fortitude DT 30:** metade do dano e evita Atordoado.',
    '**Fortitude DT 30:** metade do dano e evita Atordoado. Em falha, Atordoado dura até o fim do próximo turno do alvo; o alvo fica Desprevenido e não pode realizar ações nesse período.',
  );
  trocar(
    'Ao perder PV suficiente, o enxame pode cair uma categoria.\n\nO usuário pode pagar a diferença de EA para aumentar novamente uma categoria, se ainda possuir Carga disponível.',
    'A redução é automática: Colossal → Enorme em 275 PV ou menos; Enorme → Grande em 175 ou menos; Grande → Médio em 65 ou menos. Para ampliar, o usuário gasta Ação de Movimento, paga a diferença de custo e precisa de Carga disponível. O aumento acrescenta a diferença de PV máximos pela materialização de novos coelhos. Grande 120/175 → Enorme 220/275. Chegar a Colossal também custa 2 PE: Enorme → Colossal +1 EA +2 PE; Grande → Colossal +2 EA +2 PE.',
  );
  trocar(
    'Um inimigo pode tentar identificá-lo ativamente:',
    'Um inimigo pode identificar o Corpo Principal com Percepção contra a DT do tamanho. Jujutsu só por decisão manual do mestre. DTs:',
  );
  trocar(
    '> RD 25 antes de atingir Madoka ou alguém protegido diretamente por sua aura.',
    '> RD 25 contra dano puramente de EA que entre ou atravesse a área, protegendo Madoka e aliados adjacentes, a até 1,5m. Para Madoka, esta RD não soma com a RD 10 contra EA da ficha: use apenas RD 25.',
  );
  trocar(
    'O alvo perde temporariamente o controle do objeto e sofre:',
    'O controlador perde o controle do objeto até o fim do seu próximo turno; depois pode recuperá-lo, se o objeto existir e nenhuma outra condição impedir. O alvo sofre:',
  );
  trocar(
    'Madoka sacrifica todos os próprios PV.',
    'Madoka sacrifica todos os próprios PV, é liberado imediatamente e fica indisponível até o usuário realizar Dormir em um Interlúdio. Este sacrifício não conta como destruição permanente. Chegar a 0 PV por dano ou inimigos continua sendo destruição verdadeira.',
  );
  trocar(
    'Se o próprio usuário das Dez Sombras entrar em Morrendo enquanto Madoka estiver manifestado, a habilidade pode disparar automaticamente por Voto Vinculativo.',
    'O disparo automático exige um Voto Vinculativo específico previamente escolhido e registrado. Takaramono não inicia Haeinsa com esse voto: tem a Ressuscitação manual de 10d12, sem o gatilho automático de 2d12. Havendo o voto, se o usuário entrar em Morrendo com Madoka manifestado, a habilidade pode disparar automaticamente.',
  );
  trocar(
    '**Tamanho:** Enxame variável',
    '**Atributos:** AGI 3 / FOR 2 / INT 1 / PRE 2 / VIG 2  \n**RD:** 5 Impacto e 5 Corte  \n**Tamanho:** Grande — Enxame. Pode ocupar outros espaços; imune a manobras e a efeitos sem dano contra uma única criatura; metade do dano de armas e +50% de dano de área.',
  );
  trocar(
    '**PV:** 260',
    '**Atributos:** AGI 5 / FOR 4 / INT 2 / PRE 3 / VIG 4  \n**PV:** 260',
  );
  trocar(
    '**PV:** 360',
    '**Atributos:** AGI 4 / FOR 6 / INT 2 / PRE 4 / VIG 5  \n**PV:** 360',
  );
  trocar(
    '**Fortitude DT 30:** evita Vulnerável e reduz o dano elétrico à metade.',
    '**Fortitude DT 30:** evita Vulnerável e reduz o dano elétrico à metade. Vulnerável dura até o fim do próximo turno do alvo.',
  );
  trocar(
    '**Fortitude DT 32:** metade e evita Atordoado.',
    '**Fortitude DT 32:** metade e evita Atordoado. Atordoado dura até o fim do próximo turno do alvo, impedindo ações e deixando-o Desprevenido.',
  );
  trocar(
    'Ecos e clones não multiplicam o Acerto Garantido.',
    'O Aspecto Vinculado não paga invocação nem Sustentação do corpo. Custos próprios adicionais da habilidade são pagos a cada ativação, como os 2 PE de Bote. A área original permanece: um alvo escolhido por rodada recebe a entrega garantida; outros alvos da área resolvem normalmente. Resistências secundárias permanecem, inclusive para o alvo garantido. Ecos e clones não multiplicam o Acerto Garantido.',
  );
  return (
    texto +
    '\n\n## Execução das fusões para Takaramono\n\nChamariz permite invocar Abismo do Poço e Nue Ampliado com Ação de Movimento. Shikigami Favorito — Nue reduz 1 EA da parcela de Nue, sem tornar a fusão Livre. O Melhor Amigo do Homem só reduz a parcela de EA de Orochi. Custos finais: Abismo 5 EA, Carga 6, Sustentação 1 EA; Nue Ampliado 5 EA +1 PE, Carga 9, Sustentação 2 EA. Agito continua sendo template específico dos quatro componentes, indisponível para Takaramono nesta sessão.\n\nMahoraga: cada fenômeno registra de 1 a 4 giros; complexidade e consequência da adaptação são decididas pelo mestre.\n'
  );
}
